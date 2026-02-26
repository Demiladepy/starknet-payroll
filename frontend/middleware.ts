import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Pass-through middleware. Auth is handled in ClientLayout via ClerkProvider when
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set and @clerk/nextjs is installed.
 * To use Clerk middleware (e.g. protected routes), install @clerk/nextjs and
 * replace this with: export default clerkMiddleware();
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
