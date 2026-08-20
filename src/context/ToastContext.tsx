"use client";

/**
 * ToastContext — global glass toast queue (shadcn-style API, no sonner dependency)
 *
 * Walkthrough:
 * - `toast.success | error | info({ title, description })` pushes into a shared queue.
 * - Auto-dismiss after ~4s; max 3 visible so the bottom-right stack stays tidy.
 * - Push helpers are referentially stable so HomePage/Navbar effects do not re-fire.
 * - Mounted once via AppProvider so Navbar + HomePage share the same viewport.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
};

export type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastApi = {
  success: (input: ToastInput) => void;
  error: (input: ToastInput) => void;
  info: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

type ToastContextValue = ToastApi & {
  toasts: ToastItem[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;
const DISMISS_MS = 4000;

function makeId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, input: ToastInput) => {
    const id = makeId();
    setToasts((prev) => {
      const next = [...prev, { id, variant, ...input }];
      return next.slice(-MAX_TOASTS);
    });
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DISMISS_MS);
  }, []);

  const success = useCallback(
    (input: ToastInput) => push("success", input),
    [push],
  );
  const error = useCallback(
    (input: ToastInput) => push("error", input),
    [push],
  );
  const info = useCallback((input: ToastInput) => push("info", input), [push]);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, dismiss, success, error, info }),
    [toasts, dismiss, success, error, info],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

/** Access the global toast helpers. Must be used under ToastProvider. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
