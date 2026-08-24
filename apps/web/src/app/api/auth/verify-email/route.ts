import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/email";
import { createAuditLog, AuditAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required" },
      { status: 400 }
    );
  }

  const verification = await consumeVerificationToken(token);
  
  if (!verification) {
    return NextResponse.json(
      { error: "Invalid or expired verification token" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: verification.email },
  });

  if (!user) {
    await createAuditLog({
      userId: "unknown",
      action: AuditAction.EMAIL_VERIFICATION_FAILED,
      metadata: { reason: "User not found", email: verification.email },
    });
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  if (user.emailVerified) {
    await createAuditLog({
      userId: user.id,
      action: AuditAction.EMAIL_VERIFICATION_FAILED,
      metadata: { reason: "Already verified" },
    });
    return NextResponse.json(
      { error: "Email is already verified" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: AuditAction.EMAIL_VERIFIED,
    metadata: {},
  });

  return NextResponse.json(
    { message: "Email verified successfully. You can now sign in." },
    { status: 200 }
  );
}