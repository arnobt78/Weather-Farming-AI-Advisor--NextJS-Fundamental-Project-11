import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-full border border-white/30 bg-white/10 px-4 text-sm text-white placeholder:text-white outline-none shadow-[0_10px_30px_rgba(2,132,199,0.18)] backdrop-blur-sm transition focus:border-sky-300/60 focus:ring-4 focus:ring-sky-400/40",
        className,
      )}
      {...props}
    />
  );
}
