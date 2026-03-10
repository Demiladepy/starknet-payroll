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
import { Toaster } from "sonner";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossOrigin: "anonymous" },
  {
    rel: "preload",
    as: "style",
    href: "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/Geist-Variable.css",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/Geist-Variable.css",
  },
  {
    rel: "preload",
    as: "style",
    href: "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-mono/GeistMono-Variable.css",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-mono/GeistMono-Variable.css",
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
            <Toaster 
              position="bottom-center" 
              duration={4000}
              toastOptions={{
                className: "bg-[#17171c] text-[#ededef] text-[13px] border-y-0 border-r-0 rounded shadow-xl",
                style: {
                   borderLeft: '2px solid var(--accent)',
                   background: '#17171c',
                   color: '#ededef',
                   padding: '12px 16px'
                }
              }}
              icons={{
                success: <span className="hidden"></span>,
                error: <span className="hidden"></span>,
                warning: <span className="hidden"></span>,
                info: <span className="hidden"></span>,
              }}
            />
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
