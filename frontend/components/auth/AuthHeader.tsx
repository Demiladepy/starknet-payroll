"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function AuthHeader() {
  const hasClerk =
    typeof process !== "undefined" &&
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerk) return null;

  return (
    <header className="flex justify-end items-center px-6 py-4 h-14 border-b border-[var(--border)] bg-[var(--card)]">
      <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal">
          <button className="rounded-lg bg-[var(--accent)] text-white font-medium text-sm px-4 py-2 hover:opacity-90 transition-opacity">
            Sign up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
}
