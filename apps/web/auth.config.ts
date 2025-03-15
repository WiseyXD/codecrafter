// auth.config.ts
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - forces token refresh more often
  },
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // For debugging

      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // Always fetch fresh user data on token refresh or when using session
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: {
              email: token.email as string,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isOnboarded: true,
              image: true,
            },
          });

          if (dbUser) {
            // Update token with latest user data

            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isOnboarded = dbUser.isOnboarded;

            // Update other fields only if they exist
            if (dbUser.name) token.name = dbUser.name;
            if (dbUser.image) token.picture = dbUser.image;
          } else {
          }
        } catch (error) {
          console.error("Error fetching user data for token:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      const customSession = session as any;
      if (!customSession.user) {
        customSession.user = {};
      }

      // Add user data from token to session
      customSession.user.id = token.id;
      customSession.user.name = token.name;
      customSession.user.email = token.email;
      customSession.user.image = token.picture;
      customSession.user.role = token.role;
      customSession.user.isOnboarded = token.isOnboarded;

      // Generate JWT with user data
      const jwt = await generateJWT({
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        isOnboarded: token.isOnboarded,
      });

      customSession.user.jwt = jwt;

      return customSession;
    },
  },
  events: {
    async signIn(message) {
      console.log("User signed in:", message.user.email);
    },
    async createUser(message) {
      console.log("User created:", message.user.email);
    },
    async updateUser(message) {
      console.log("User updated:", message.user.email);
    },
    async session(message) {
      console.log("Session accessed:", message.session.user?.email);
    },
  },
};
// // auth.config.ts
// import type { NextAuthConfig } from "next-auth";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "@repo/db";
// import { SignJWT, importJWK } from "jose";

// // Helper function for JWT generation
// export const generateJWT = async (payload: any) => {
//   const secret = process.env.AUTH_SECRET;
//   const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });
//   const jwt = await new SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("365d")
//     .sign(jwk);
//   return jwt;
// };

// // Auth configuration
// export const authConfig: NextAuthConfig = {
//   adapter: PrismaAdapter(prisma),
//   providers: [Google],
//   secret: process.env.AUTH_SECRET,
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async jwt({ token, user, account, profile }) {
//       // Initial sign in
//       if (user) {
//         // Fetch additional user data from database
//         const dbUser = await prisma.user.findUnique({
//           where: {
//             email: user.email as string,
//           },
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             isOnboarded: true,
//             image: true,
//           },
//         });

//         if (dbUser) {
//           // Add user data to token
//           token.id = dbUser.id;
//           token.role = dbUser.role;
//           console.log(dbUser.isOnboarded);
//           token.isOnboarded = dbUser.isOnboarded;
//         }
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       const customSession = session as any;
//       if (!customSession.user) {
//         customSession.user = {};
//       }

//       // Add user data from token to session
//       customSession.user.id = token.id;
//       customSession.user.name = token.name;
//       customSession.user.email = token.email;
//       customSession.user.image = token.picture;
//       customSession.user.role = token.role;
//       customSession.user.isOnboarded = token.isOnboarded;

//       // Generate JWT with user data
//       const jwt = await generateJWT({
//         id: token.id,
//         name: token.name,
//         email: token.email,
//         role: token.role,
//         isOnboarded: token.isOnboarded,
//       });

//       customSession.user.jwt = jwt;

//       return customSession;
//     },
//   },
// };
