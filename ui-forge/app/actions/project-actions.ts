'use server';

import prisma from '@/libs/prisma';
import { auth } from '@/libs/auth'; // Using the auth helper we saw in your files
import { revalidatePath } from 'next/cache';

// 1. Create a New Project (When user clicks "New Project" in your sidebar)
export async function createNewProject(name: string = "New Project") {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        userId: session.user.id, // Links to the real user
        sessions: {
          create: {
            title: "New Chat", // Auto-create the first chat room
          }
        }
      },
      include: {
        sessions: true
      }
    });

    revalidatePath('/'); // Refresh the UI
    return { success: true, project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// 2. Fetch All Projects (Deep Fetch)
export async function getUserProjects() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      // Fetch deeply nested data so the UI has everything
      sessions: {
        include: {
          files: {
            include: {
              versions: {
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return projects;
}

// 3. Fetch Chat History for a Project
export async function getProjectChatHistory(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  // 1. Find the active session for this project
  // (For now, we assume 1 project = 1 active chat session to keep it simple)
  const chatSession = await prisma.chatSession.findFirst({
    where: {
      projectId: projectId,
      project: { userId: session.user.id } // Security: Ensure user owns project
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' } // Oldest first (like a real chat)
      }
    }
  });

  if (!chatSession) return [];

  return chatSession.messages;
}

// 4. Save a User Message
export async function saveUserMessage(projectId: string, content: string, role: 'USER' | 'ASSISTANT' = 'USER') {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  // 1. Find the Chat Session ID for this project
  const chatSession = await prisma.chatSession.findFirst({
    where: {
      projectId: projectId,
      project: { userId: session.user.id }
    }
  });

  if (!chatSession) return { success: false, error: "No session found" };

  // 2. Create the Message
  const newMessage = await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: role,
      content: content
    }
  });

  return { success: true, message: newMessage };
}