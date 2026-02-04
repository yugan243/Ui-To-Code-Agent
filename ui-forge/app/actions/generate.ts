'use server';

import { agent } from "@/libs/agent";
import { auth } from "@/libs/auth";
import prisma from "@/libs/prisma";
import { revalidatePath } from "next/cache";

export async function generateComponent(
  projectId: string, 
  prompt: string, 
  imageUrl?: string,
  currentCode?: string,
  activeFileId?: string 
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  console.log("🚀 START: generateComponent");

  try {
    // 1. Run the Agentic Flow
    console.log("🤖 Agent Invoke Started...");
    
    // 👇 Ensure we pass 'messages: []' to match the state definition
    const result = await agent.invoke({
      userRequest: prompt,
      imageUrl: imageUrl,
      currentCode: currentCode,
      messages: [] 
    });

    console.log("✅ Agent Finished. Reply:", result.reply); 

    // Handle non-coding questions (classifier detected it's not a code request)
    if (!result.finalCode && result.reply) {
      console.log("💬 Non-coding question - returning reply only");
      
      // Save the assistant reply to the chat
      const chatSession = await prisma.chatSession.findFirst({
        where: { projectId },
      });
      
      if (chatSession) {
        await prisma.chatMessage.create({
          data: {
            sessionId: chatSession.id,
            role: "ASSISTANT",
            content: result.reply,
          }
        });
      }
      
      return { success: true, code: null, versionId: null, reply: result.reply };
    }

    if (!result || !result.finalCode) {
        throw new Error("Agent returned no code.");
    }

    const generatedCode = result.finalCode;
    // 👇 Get the conversational reply (fallback if empty)
    const assistantReply = result.reply || "I've generated the code based on your request. Check the preview!";

    // 2. Find/Create the active Session
    const chatSession = await prisma.chatSession.findFirst({
      where: { projectId },
      include: { files: true }
    });

    if (!chatSession) throw new Error("Session not found");

    let fileId = activeFileId || chatSession.files[0]?.id;

    if (!fileId) {
      const newFile = await prisma.uIFile.create({
        data: {
          sessionId: chatSession.id,
          name: "Component.tsx",
        }
      });
      fileId = newFile.id;
    }

    // 3. Save Version
    const version = await prisma.codeVersion.create({
      data: {
        fileId: fileId,
        code: generatedCode,
        versionNumber: (await prisma.codeVersion.count({ where: { fileId } })) + 1,
        description: prompt.slice(0, 50) 
      }
    });

    // 4. Save Assistant Message (THE DYNAMIC REPLY)
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "ASSISTANT",
        content: assistantReply, // 👈 Using the AI's actual words
      }
    });

    revalidatePath(`/`);
    return { success: true, code: generatedCode, versionId: version.id, reply: assistantReply };

  } catch (error: unknown) {
    console.error("❌ GENERATION FAILED:", error);
    const message = error instanceof Error ? error.message : "Failed to generate code";
    return { success: false, error: message };
  }
}