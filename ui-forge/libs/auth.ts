/**
 * Authentication Configuration (NextAuth.js v5)
 * 
 * This file configures:
 * - Authentication providers (Credentials, Google, GitHub)
 * - Session strategy (JWT for serverless compatibility)
 * - Database adapter (Prisma for user/session storage)
 * - Callbacks for session customization
 * 
 * Best Practices:
 * - JWT strategy for edge/serverless deployments
 * - Secure password hashing with bcryptjs (10 rounds)
 * - Session includes user ID for database queries
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Use Prisma adapter for user/account/session storage
  adapter: PrismaAdapter(prisma),

  // JWT strategy: Best for serverless (no database sessions needed)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Configure authentication providers
  providers: [
    // Google OAuth - For social login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Request additional profile information
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Credentials Provider - For email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Check if user exists and has password (not OAuth-only account)
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object (will be stored in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  // Customize pages (use your custom login page)
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },

  // Callbacks for customizing JWT and session
  callbacks: {
    // JWT Callback: Add user ID to token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Session Callback: Add user ID to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Security settings
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug logs to prevent exposing sensitive data
});
