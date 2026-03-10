import { useState, useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import type { Route } from "./+types/root";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AppProviders } from "./providers/AppProviders";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossOrigin: "anonymous" },
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/Geist-Variable.woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-mono/GeistMono-Variable.woff2",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ClientNuqsAdapter({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;
  return <NuqsAdapter>{children}</NuqsAdapter>;
}

export default function App() {
  return (
    <AppProviders>
      <ClientNuqsAdapter>
        <ThemeProvider>
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </ThemeProvider>
      </ClientNuqsAdapter>
    </AppProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = import.meta.env.DEV ? error.stack : undefined;
  }

  return (
    <main className="pt-16 p-4 container mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{message}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{details}</p>
      {stack && (
        <pre className="mt-4 w-full p-4 overflow-x-auto text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
