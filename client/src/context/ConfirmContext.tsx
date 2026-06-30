import React, { createContext, useContext, useState, useRef } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "error";
}

type ConfirmPromiseResolver = (value: boolean) => void;

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = (): ((options: ConfirmOptions) => Promise<boolean>) => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<ConfirmPromiseResolver | null>(null);
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [isConfirmHovered, setIsConfirmHovered] = useState(false);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
    }
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
    }
  };

  const getTypeColor = () => {
    if (!options) return "var(--accent)";
    switch (options.type) {
      case "warning":
        return "#ea580c";
      case "error":
        return "#ef4444";
      case "info":
      default:
        return "var(--accent)";
    }
  };

  const getTypeIcon = () => {
    if (!options) return null;
    const color = getTypeColor();
    switch (options.type) {
      case "warning":
        return <AlertTriangle size={24} style={{ color }} />;
      case "error":
        return <XCircle size={24} style={{ color }} />;
      case "info":
      default:
        return <Info size={24} style={{ color }} />;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Global Glassmorphic Confirmation Modal */}
      {isOpen && options && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards",
          }}
          onClick={handleCancel}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "1.5rem",
              borderRadius: "14px",
              boxShadow: "var(--glass-shadow)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              margin: "0 16px",
              transform: "scale(0.95)",
              opacity: 0,
              animation: "scaleIn 0.25s cubic-bezier(0.23, 1, 0.32, 1) forwards",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Type Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor:
                    options.type === "warning" || options.type === "error"
                      ? "rgba(239, 68, 68, 0.12)"
                      : "rgba(59, 130, 246, 0.12)",
                }}
              >
                {getTypeIcon()}
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "var(--text-glass)",
                  margin: 0,
                }}
              >
                {options.title}
              </h3>
            </div>

            {/* Message Body */}
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                color: "var(--text-glass-muted)",
                margin: 0,
              }}
            >
              {options.message}
            </p>

            {/* Action Buttons Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
              <button
                onClick={handleCancel}
                onMouseEnter={() => setIsCancelHovered(true)}
                onMouseLeave={() => setIsCancelHovered(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-glass)",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: isCancelHovered ? "scale(1.02)" : "scale(1)",
                  backgroundColor: isCancelHovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
                }}
              >
                {options.cancelText || "Cancel"}
              </button>

              <button
                onClick={handleConfirm}
                onMouseEnter={() => setIsConfirmHovered(true)}
                onMouseLeave={() => setIsConfirmHovered(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "1px solid transparent",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: isConfirmHovered ? "scale(1.02)" : "scale(1)",
                  // Type specific confirm styles
                  backgroundColor:
                    options.type === "warning" || options.type === "error"
                      ? isConfirmHovered
                        ? "rgba(239, 68, 68, 0.25)"
                        : "rgba(239, 68, 68, 0.15)"
                      : isConfirmHovered
                      ? "var(--accent-hover)"
                      : "var(--accent)",
                  borderColor:
                    options.type === "warning" || options.type === "error"
                      ? "rgba(239, 68, 68, 0.3)"
                      : "transparent",
                  color:
                    options.type === "warning" || options.type === "error"
                      ? "#ef4444"
                      : "#ffffff",
                }}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
