"use client";

import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth-layout";
import { authClerkAppearance } from "@/components/auth-clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center gap-6 [&_.clerk-box]:!w-full [&_.clerk-box]:!max-w-none">
        <SignUp
          routing="path"
          path="/sign-up"
          appearance={authClerkAppearance}
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </AuthLayout>
  );
}
