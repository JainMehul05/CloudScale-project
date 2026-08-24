import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] px-4 overflow-hidden">
      <Suspense fallback={<div className="relative w-full max-w-md" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}