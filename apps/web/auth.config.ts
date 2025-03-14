import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@repo/db";
import { SignJWT, importJWK } from "jose";

// Helper function for JWT generation
export const generateJWT = async (payload: any) => {
  const secret = process.env.AUTH_SECRET;
  const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(jwk);
  return jwt;
};

// Auth configuration
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      const customSession = session as any;
      if (!customSession.user) {
        customSession.user = {};
      }

      const jwt = await generateJWT({
        id: customSession.user.id,
        name: customSession.user.name,
        image: customSession.user.email,
      });

      customSession.user.jwt = jwt;
      return customSession;
    },
  },
};
