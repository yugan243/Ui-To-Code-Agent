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