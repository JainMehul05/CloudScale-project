import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        console.log('[NextAuth] authorize called with:', credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials');
          return null;
        }

        const email = credentials.email as string;
        const ip = req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() 
          || req?.headers?.get("x-real-ip") 
          || "unknown";

        const ipRateLimit = await checkRateLimit({
          key: `login:ip:${ip}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        const emailRateLimit = await checkRateLimit({
          key: `login:email:${email.toLowerCase()}`,
          limit: 5,
          windowMs: 15 * 60 * 1000,
        });

        if (!ipRateLimit.success || !emailRateLimit.success) {
          console.log('[NextAuth] Rate limited:', { ip, email, ipRateLimit, emailRateLimit });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) {
          console.log('[NextAuth] User not found or no password');
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          console.log('[NextAuth] Invalid password');
          return null;
        }

        console.log('[NextAuth] Auth successful for:', user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});