import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "warning" | "info";
type ToastMessage = { id: number; text: string; kind: ToastKind };

type ToastContextValue = {
  toast: (text: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const idRef = useRef(0);

  const toast = useCallback((text: string, kind: ToastKind = "info") => {
    const id = ++idRef.current;
    setMessage({ id, text, kind });
    setTimeout(() => {
      setMessage((m) => (m?.id === id ? null : m));
    }, AUTO_DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {message && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2" aria-live="polite">
          <div
            className="max-w-[640px] rounded-[6px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[13px] text-[var(--text-primary)] shadow-xl"
            style={{
              borderLeft: `2px solid ${
                message.kind === "success"
                  ? "var(--status-success)"
                  : message.kind === "warning"
                    ? "var(--status-pending)"
                    : message.kind === "error"
                      ? "var(--status-error)"
                      : "var(--status-info)"
              }`,
            }}
          >
            {message.text}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
