import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--background)]">
      <div className="text-center max-w-md">
        <p className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
          Error 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-3">
          Page not found
        </h1>
        <p className="text-[var(--muted)] mb-8">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] text-white font-medium px-6 py-3 hover:opacity-90 transition-opacity"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
