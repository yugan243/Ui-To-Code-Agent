'use server';

import { agent } from "@/libs/agent";
import { auth } from "@/libs/auth";
import prisma from "@/libs/prisma";
import { revalidatePath } from "next/cache";

export async function generateComponent(
  projectId: string, 
  prompt: string, 
  imageUrl?: string,
  currentCode?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  console.log("🚀 START: generateComponent"); // LOG 1

  try {
    // 1. Run the Agentic Flow
    console.log("🤖 Agent Invoke Started..."); // LOG 2
    
    const result = await agent.invoke({
      userRequest: prompt,
      imageUrl: imageUrl,
      currentCode: currentCode,
      messages: []
    });

    console.log("✅ Agent Finished. Result:", result ? "Got Data" : "Empty"); // LOG 3

    if (!result || !result.finalCode) {
        throw new Error("Agent returned no code.");
    }

    const generatedCode = result.finalCode;

    // 2. Find/Create the active Session
    const chatSession = await prisma.chatSession.findFirst({
      where: { projectId },
      include: { files: true }
    });

    if (!chatSession) throw new Error("Session not found");

    let fileId = chatSession.files[0]?.id;

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
        description: "AI Generated"
      }
    });

    // 4. Save Assistant Message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "ASSISTANT",
        content: "I've generated the code based on your request. Check the version history!",
      }
    });

    revalidatePath(`/`);
    return { success: true, code: generatedCode, versionId: version.id };

  } catch (error: any) {
    console.error("❌ GENERATION FAILED:", error); // LOG ERROR
    // Return the actual error message so we can see it in the UI alert if needed
    return { success: false, error: error.message || "Failed to generate code" };
  }
}