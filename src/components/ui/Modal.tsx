import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`bg-card w-full rounded-2xl shadow-2xl border border-border overflow-hidden relative animate-in fade-in zoom-in duration-200 ${
          size === "sm"
            ? "max-w-sm"
            : size === "md"
              ? "max-w-md"
              : size === "lg"
                ? "max-w-lg"
                : size === "xl"
                  ? "max-w-xl"
                  : size === "2xl"
                    ? "max-w-2xl"
                    : size === "4xl"
                      ? "max-w-4xl"
                      : "max-w-md"
        }`}
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
