"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { LayoutBottomIcon } from "@hugeicons/core-free-icons";

export function AuthLayout({
  children,
  logoHref = "/",
}: {
  children: React.ReactNode;
  logoHref?: string;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex min-w-0 w-full flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href={logoHref}
            className="flex items-center gap-2 font-medium"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HugeiconsIcon
                icon={LayoutBottomIcon}
                strokeWidth={2}
                className="size-4"
              />
            </div>
            Acme Inc.
          </Link>
        </div>
        <div className="relative min-w-0 flex-1 w-full">
          <div className="absolute left-[calc(50%-0.5rem)] top-1/2 w-full max-w-xs -translate-x-1/2 -translate-y-1/2">
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block" />
    </div>
  );
}
