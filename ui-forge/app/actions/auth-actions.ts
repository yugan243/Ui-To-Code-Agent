/**
 * Authentication Server Actions
 * 
 * These are server-side functions that handle:
 * - User registration (signup)
 * - User login (using NextAuth)
 * - User logout
 * 
 * Benefits of Server Actions:
 * - Type-safe
 * - No API route needed
 * - Automatic serialization
 * - Progressive enhancement
 */

'use server';

import prisma from '@/libs/prisma';
import { signIn, signOut } from '@/libs/auth';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

/**
 * Sign Up - Create new user with email/password
 * 
 * @param formData - Form data containing name, email, password
 * @returns Success status and message
 */
export async function signup(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation
    if (!name || !email || !password) {
      return { error: 'All fields are required' };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists with this email' };
    }

    // Hash password (10 rounds = secure & fast)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Auto-login after signup
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true, message: 'Account created successfully!' };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

/**
 * Sign In - Login with email/password
 * 
 * @param formData - Form data containing email and password
 * @returns Success status or error message
 */
export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // Use NextAuth's signIn function
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/', // Redirect to home (UICodeGenerator) after successful login
    });

    return { success: true };
  } catch (error) {
    // NextAuth throws NEXT_REDIRECT on successful login - this is expected behavior
    // We need to re-throw it immediately so Next.js can handle the redirect
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    // Handle NextAuth authentication errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    throw error; // Re-throw for any other errors
  }
}

/**
 * Google Sign In
 */
export async function googleSignIn() {
  await signIn('google', { redirectTo: '/' });
}

/**
 * GitHub Sign In
 */
export async function githubSignIn() {
  await signIn('github', { redirectTo: '/' });
}

/**
 * Logout
 */
export async function logout() {
  await signOut({ redirectTo: '/login' });
}
