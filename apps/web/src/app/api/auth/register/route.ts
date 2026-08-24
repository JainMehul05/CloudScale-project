import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp, createRateLimitHeaders } from "@/lib/ratelimit";
import { validatePassword } from "@/lib/password";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit({
    key: `register:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  const headers = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400, headers }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      await createAuditLog({
        userId: "unknown",
        action: AuditAction.REGISTER_FAILED,
        metadata: { reason: "Password validation failed", errors: passwordValidation.errors },
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: "Password does not meet requirements", details: passwordValidation.errors },
        { status: 400, headers }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent user enumeration
    // If user exists, we don't create a new account but still send verification email
    if (existingUser) {
      await createAuditLog({
        userId: existingUser.id,
        action: AuditAction.REGISTER_FAILED,
        metadata: { reason: "Email already exists" },
        ipAddress: ip,
      });
      
      // Still send verification email in case user forgot they registered
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(email, verificationToken.token);
      
      return NextResponse.json(
        { message: "If an account exists for this email, a verification email has been sent." },
        { status: 200, headers }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    await createAuditLog({
      userId: user.id,
      action: AuditAction.REGISTER_SUCCESS,
      metadata: {},
      ipAddress: ip,
    });

    return NextResponse.json(
      { message: "Account created successfully. Please check your email to verify your account.", user },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Registration error:", error);
    await createAuditLog({
      userId: "unknown",
      action: AuditAction.REGISTER_FAILED,
      metadata: { reason: "Server error", error: String(error) },
      ipAddress: ip,
    });
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500, headers }
    );
  }
}