"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Loader2, Check } from "lucide-react";
import { cn, componentStyles } from "@/lib/design-system";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant?: ConfirmVariant;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function ConfirmDialog({
  title,
  description,
  confirmText,
  cancelText,
  variant = "danger",
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => dialogRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = "";
      previouslyFocusedRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements?.length) return;
        const first = focusableElements[0] as HTMLElement;
        const last = focusableElements[focusableElements.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  const variantStyles = {
    danger: {
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      buttonBg: "bg-red-500 hover:bg-red-600",
      buttonText: "text-white",
      border: "border-red-500/30",
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      buttonBg: "bg-amber-500 hover:bg-amber-600",
      buttonText: "text-white",
      border: "border-amber-500/30",
    },
    info: {
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      buttonBg: "bg-blue-500 hover:bg-blue-600",
      buttonText: "text-white",
      border: "border-blue-500/30",
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      {children}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={onCancel}
              aria-hidden="true"
            />
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4",
                "focus:outline-none"
              )}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-description"
            >
              <div className={cn(
                componentStyles.card.base,
                componentStyles.card.elevated,
                "rounded-2xl overflow-hidden",
                styles.border
              )}>
                <div className="flex items-start gap-4 p-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    styles.iconBg
                  )}>
                    {styles.icon}
                  </div>
                  <div className="flex-1">
                    <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">
                      {title}
                    </h2>
                    <p id="confirm-dialog-description" className="mt-2 text-sm text-zinc-400">
                      {description}
                    </p>
                  </div>
                  <motion.button
                    onClick={onCancel}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="px-6 pb-6 pt-0">
                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onCancel}
                      disabled={isLoading}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        "text-zinc-300 hover:text-white border border-white/10 hover:bg-white/5",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {cancelText}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onConfirm}
                      disabled={isLoading}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        styles.buttonBg,
                        styles.buttonText,
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {confirmText}
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}