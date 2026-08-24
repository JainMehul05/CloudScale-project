import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export interface EmailVerificationToken {
  token: string;
  expires: Date;
  email: string;
}

export async function generateVerificationToken(email: string): Promise<EmailVerificationToken> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email.toLowerCase(),
      token,
      expires,
    },
  });

  return { token, expires, email: email.toLowerCase() };
}

export async function consumeVerificationToken(token: string): Promise<EmailVerificationToken | null> {
  const stored = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!stored) {
    return null;
  }

  if (stored.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  await prisma.verificationToken.delete({ where: { token } });
  return { token: stored.token, expires: stored.expires, email: stored.identifier };
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;
  
  console.log("[Email] Sending verification email to:", email);
  console.log("[Email] Verification URL:", verificationUrl);
  console.log("[Email] Token:", token);

  // In production, integrate with a real email service like:
  // - Resend, SendGrid, Postmark, Nodemailer with SMTP
  // For now, we log the verification URL for development
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;
  
  console.log("[Email] Sending password reset email to:", email);
  console.log("[Email] Reset URL:", resetUrl);
}