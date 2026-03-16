"use client";

import { Loader2, AlertCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "danger" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 h-screen flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-6 py-6 border-b border-black/5 flex items-start gap-4">
          <div
            className={`mt-1 p-2 rounded-lg cursor-pointer shrink-0 ${variant === "danger"
              ? "bg-red-50 text-red-500 border border-red-100"
              : "bg-blue-50 text-blue-500 border border-blue-100"
              }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-sora font-semibold text-[#111] leading-tight">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors text-black/20 hover:text-black/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 cursor-pointer text-sm font-semibold text-muted hover:text-[#111] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${variant === "danger"
              ? "bg-red-500 text-white hover:bg-red-600 active:scale-95"
              : "bg-black text-white hover:bg-black/80 active:scale-95"
              } disabled:opacity-50 disabled:active:scale-100`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
