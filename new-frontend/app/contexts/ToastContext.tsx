import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "warning" | "info";
type ToastMessage = { id: number; text: string; kind: ToastKind };

type ToastContextValue = {
  toast: (text: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4500;

const kindConfig = {
  success: { color: "var(--status-success)", Icon: CheckCircle2 },
  error: { color: "var(--status-error)", Icon: AlertCircle },
  warning: { color: "var(--status-pending)", Icon: AlertTriangle },
  info: { color: "var(--status-info)", Icon: Info },
};

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
      <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 pointer-events-none">
        <AnimatePresence>
          {message && (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
              className="pointer-events-auto"
            >
              <div
                className="max-w-[640px] rounded-xl border border-[var(--border)] px-4 py-3.5 text-[13px] text-[var(--text-primary)] shadow-2xl flex items-center gap-3"
                style={{
                  background: "var(--bg-elevated)",
                  backdropFilter: "blur(16px)",
                  borderLeft: `3px solid ${kindConfig[message.kind].color}`,
                  boxShadow: `0 0 20px rgba(0,0,0,0.3), 0 0 40px ${kindConfig[message.kind].color}15`,
                }}
              >
                {(() => {
                  const { Icon, color } = kindConfig[message.kind];
                  return <Icon size={16} style={{ color }} className="shrink-0" />;
                })()}
                <span>{message.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
