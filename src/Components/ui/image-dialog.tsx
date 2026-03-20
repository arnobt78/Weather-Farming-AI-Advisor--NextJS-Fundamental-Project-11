"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useCallback, useEffect } from "react";

type ImageDialogProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  photographerName?: string;
};

export function ImageDialog({
  open,
  onClose,
  src,
  alt,
  photographerName,
}: ImageDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${alt || "weather-photo"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  }, [src, alt]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Top bar: X left, photographer + download right */}
          <div
            className="flex w-full max-w-[90vw] shrink-0 items-center justify-between py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              title="Close preview"
              className="rounded-full p-2 text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {photographerName && (
                <span className="text-sm text-white/80">
                  {photographerName}
                </span>
              )}
              <button
                type="button"
                onClick={() => void handleDownload()}
                title="Download image"
                className="rounded-full p-2 text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Image — natural size, capped to viewport */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="rounded-2xl object-contain shadow-2xl"
              style={{ maxWidth: "90vw", maxHeight: "80vh" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
