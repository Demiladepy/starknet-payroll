import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ChipiProvider } from "@chipi-stack/nextjs";

export const metadata: Metadata = {
  title: "Privacy-First Payroll System",
  description: "Starknet payroll with Tongo Protocol privacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ChipiProvider>{children}</ChipiProvider>
        </Providers>
      </body>
    </html>
  );
}
