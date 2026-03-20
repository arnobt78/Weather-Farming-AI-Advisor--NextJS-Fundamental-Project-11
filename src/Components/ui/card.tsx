import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/20 bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-all duration-300 hover:border-white/35 hover:shadow-[0_30px_80px_rgba(15,23,42,0.35),0_0_40px_rgba(56,189,248,0.08)] hover:scale-[1.008]",
        className,
      )}
      {...props}
    />
  );
}
