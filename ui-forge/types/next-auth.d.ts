/**
 * TypeScript Module Augmentation for NextAuth
 * 
 * This extends NextAuth's default types to include custom fields
 * like user.id in the session object
 */

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
