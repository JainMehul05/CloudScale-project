import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/ratelimit";
import { createAuditLog, AuditAction } from "@/lib/audit";

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

        // Check email verification
        if (!user.emailVerified) {
          await createAuditLog({
            userId: user.id,
            action: AuditAction.LOGIN_FAILED,
            metadata: { reason: "Email not verified" },
            ipAddress: ip,
          });
          console.log('[NextAuth] Email not verified for:', user.email);
          return null;
        }

        // Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await createAuditLog({
            userId: user.id,
            action: AuditAction.ACCOUNT_LOCKED,
            metadata: { reason: "Account locked", lockedUntil: user.lockedUntil },
            ipAddress: ip,
          });
          console.log('[NextAuth] Account locked until:', user.lockedUntil);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          // Increment failed login attempts
          const failedAttempts = user.failedLoginAttempts + 1;
          const MAX_FAILED_ATTEMPTS = 5;
          const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

          if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: failedAttempts,
                lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
              },
            });
            await createAuditLog({
              userId: user.id,
              action: AuditAction.ACCOUNT_LOCKED,
              metadata: { failedAttempts, lockDurationMs: LOCK_DURATION_MS },
              ipAddress: ip,
            });
            console.log('[NextAuth] Account locked due to failed attempts:', user.email);
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: failedAttempts },
            });
          }
          await createAuditLog({
            userId: user.id,
            action: AuditAction.LOGIN_FAILED,
            metadata: { failedAttempts, reason: "Invalid password" },
            ipAddress: ip,
          });
          console.log('[NextAuth] Invalid password, failed attempts:', failedAttempts);
          return null;
        }

        // Successful login - reset failed attempts and lock
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        await createAuditLog({
          userId: user.id,
          action: AuditAction.LOGIN_SUCCESS,
          metadata: {},
          ipAddress: ip,
        });

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
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      if (token?.id) {
        await createAuditLog({
          userId: token.id as string,
          action: AuditAction.LOGOUT,
          metadata: {},
        });
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - refresh session if older than this
  },
  cookies: {
    sessionToken: {
      name: "cloudscale.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: "cloudscale.callback-url",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
    csrfToken: {
      name: "cloudscale.csrf-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});