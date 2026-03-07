"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

/**
 * Syncs the current Clerk user to the Convex users table on sign-in.
 * Renders nothing; place inside ConvexClientProvider (which must be inside ClerkProvider).
 */
export default function SyncUser() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (isAuthenticated) {
      storeUser();
    }
  }, [isAuthenticated, storeUser]);

  return null;
}
