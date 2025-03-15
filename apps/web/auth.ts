// auth.ts
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { authConfig } from "./auth.config";

// Extended session interface
export interface ExtendedSession extends Session {
  user: {
    jwt: string;
    id: string;
    email: string;
    image: string;
    name: string;
    role: string;
    isOnboarded: boolean;
  };
}

// Extended token interface
export interface ExtendedToken extends JWT {
  jwt: string;
  id: string;
  role: string;
  isOnboarded: boolean;
}

// Create and export auth handlers with proper typing
// Add explicit type annotations to prevent the portability issue
export const {
  handlers,
  signIn,
  signOut,
  auth,
}: {
  handlers: any;
  signIn: (
    provider?: string | undefined,
    options?: { redirectTo?: string; [key: string]: any },
  ) => Promise<void>;
  signOut: () => Promise<void>;
  auth: any;
} = NextAuth(authConfig);

// Helper to get the session with proper typing
export async function getAuthSession(): Promise<ExtendedSession | null> {
  const session = await auth();
  return session as ExtendedSession | null;
}
