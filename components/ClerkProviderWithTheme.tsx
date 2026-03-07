"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function ClerkProviderWithTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only pass theme after mount to avoid hydration mismatch; before that Clerk uses default theme + color-scheme from CSS
  const appearance =
    mounted && resolvedTheme === "dark"
      ? { baseTheme: dark }
      : undefined;

  return (
    <ClerkProvider dynamic appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
