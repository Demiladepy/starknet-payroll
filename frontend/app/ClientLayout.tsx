"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { Providers } from "./providers";
import { ChipiProviderWrapper } from "@/components/chipi-pay/ChipiProviderWrapper";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <AuthHeader />
      <Providers>
        <ChipiProviderWrapper>{children}</ChipiProviderWrapper>
      </Providers>
    </ClerkProvider>
  );
}
