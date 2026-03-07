"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth-layout";
import { authClerkAppearance } from "@/components/auth-clerk-appearance";

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center gap-6 [&_.clerk-box]:!w-full [&_.clerk-box]:!max-w-none">
        <SignIn
          routing="path"
          path="/sign-in"
          appearance={authClerkAppearance}
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </AuthLayout>
  );
}
