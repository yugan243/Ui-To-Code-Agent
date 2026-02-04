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

// Get a single project by ID with all nested data
export async function getProjectById(projectId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id // Security check
    },
    include: {
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
    }
  });

  return project;
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

  // Normalize role to lowercase for UI consistency
  // Database stores as 'USER'/'ASSISTANT' but UI expects 'user'/'assistant'
  // Also map imageUrl to image for UI compatibility
  return chatSession.messages.map((msg: { role: string; imageUrl: string | null; id: string; createdAt: Date; content: string }) => ({
    ...msg,
    role: msg.role.toLowerCase(),
    image: msg.imageUrl // Map imageUrl to image for the UI
  }));
}

// --- UPDATED: Save Message with Image URL ---
export async function saveUserMessage(
  projectId: string, 
  content: string, 
  role: 'USER' | 'ASSISTANT', 
  imageUrl?: string | null // <--- NEW PARAMETER
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // 1. Find the active session for this project
    let chatSession = await prisma.chatSession.findFirst({
      where: { projectId: projectId },
      orderBy: { updatedAt: 'desc' }
    });

    // Create session if it doesn't exist (safety check)
    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: { projectId: projectId, title: "New Chat" }
      });
    }

    // 2. Save the message with the URL
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: role,
        content: content,
        imageUrl: imageUrl || null, // <--- SAVING THE CLOUDINARY URL
      },
    });

    return { success: true, messageId: message.id };
  } catch (error) {
    console.error("Failed to save message:", error);
    return { success: false, error: "Database error" };
  }
}

// --- NEW FUNCTION: Create a File Entry ("Screen X") ---
export async function createUIFile(projectId: string, imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // 1. Find the active Chat Session
    const chatSession = await prisma.chatSession.findFirst({
      where: { projectId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!chatSession) throw new Error("No active session found");

    // 2. Count existing files to generate the name (e.g., "Screen 1", "Screen 2")
    const fileCount = await prisma.uIFile.count({
      where: { sessionId: chatSession.id }
    });

    const newName = `Screen ${fileCount + 1}`;

    // 3. Create the File Record
    const newFile = await prisma.uIFile.create({
      data: {
        sessionId: chatSession.id,
        name: newName,
        referenceImageUrl: imageUrl, // Storing the Cloudinary URL
        currentVersion: 1
      }
    });

    return { success: true, file: newFile };
  } catch (error) {
    console.error("Failed to create file:", error);
    return { success: false, error: "Database error" };
  }
}