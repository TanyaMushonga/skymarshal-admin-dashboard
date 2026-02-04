import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onClose : undefined}
      />
      <div className="bg-card w-full max-w-sm sm:max-w-md rounded-xl shadow-2xl border border-border overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 justify-center sm:justify-start">
                {variant === "destructive" && (
                  <AlertTriangle className="text-destructive" size={20} />
                )}
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-muted hover:text-muted-foreground h-10 px-4 py-2"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-white shadow hover:bg-opacity-90 ${
                  variant === "destructive"
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
