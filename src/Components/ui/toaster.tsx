"use client";

/**
 * Toaster — bottom-right glass toast viewport (Framer Motion enter/exit)
 *
 * Walkthrough:
 * - Renders the ToastContext queue; pointer-events only on each card.
 * - Variants: success (emerald), error (rose), info (sky) — same glass tokens as Card/Badge.
 */
import { useToast, type ToastVariant } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const variantStyles: Record<
  ToastVariant,
  { wrap: string; icon: typeof CheckCircle2 }
> = {
  success: {
    wrap: "border-emerald-300/30 bg-emerald-500/15",
    icon: CheckCircle2,
  },
  error: {
    wrap: "border-rose-300/30 bg-rose-500/15",
    icon: CircleAlert,
  },
  info: {
    wrap: "border-sky-300/30 bg-sky-500/15",
    icon: Info,
  },
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = variantStyles[toast.variant];
          const Icon = style.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto flex gap-3 rounded-xl border p-3 shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-sm",
                style.wrap,
              )}
              role="status"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-white/85">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md p-0.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
