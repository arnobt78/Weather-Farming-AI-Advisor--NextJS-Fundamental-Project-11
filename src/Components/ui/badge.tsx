import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-sky-300/35 bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-sky-500/5 px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(2,132,199,0.25)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
