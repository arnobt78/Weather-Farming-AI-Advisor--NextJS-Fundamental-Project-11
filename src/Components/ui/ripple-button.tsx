"use client";

import { cn } from "@/lib/utils";
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

type RippleButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Reusable ripple button used across the project for click feedback.
 */
export function RippleButton({
  className,
  children,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (ripples.length === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setRipples([]);
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [ripples]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    idRef.current += 1;
    setRipples((prev) => [...prev, { id: idRef.current, x, y, size }]);
    onClick?.(event);
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-white/25 bg-white/10 text-white shadow-[0_15px_35px_rgba(59,130,246,0.32)] backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-sky-300/50",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
        {children}
      </span>
      {ripples.map((ripple) => (
        <span key={ripple.id}>
          <span
            className="pointer-events-none absolute rounded-full animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.1) 65%, transparent 100%)",
              boxShadow: "0 0 24px 6px rgba(255,255,255,0.25)",
            }}
          />
          <span
            className="pointer-events-none absolute rounded-full animate-ripple-ring border border-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        </span>
      ))}
    </button>
  );
}
