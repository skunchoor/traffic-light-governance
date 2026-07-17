import React, { useEffect } from "react";

export const Toast = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose && onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const borderColor = type === "success" ? "#22c55e" : (type === "error" ? "#ef4444" : "#3b82f6");

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "1rem 1.5rem",
        zIndex: 9999,
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: "1rem"
      }}
    >
      <span style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: "1.1rem"
        }}
      >
        ×
      </button>
    </div>
  );
};
