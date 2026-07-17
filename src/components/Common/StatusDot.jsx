import React from "react";

export const StatusDot = ({ status = "success", pulsing = false }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case "success":
      case "green":
      case "healthy":
        return { bg: "#22c55e", glow: "rgba(34, 197, 94, 0.5)" };
      case "warning":
      case "yellow":
      case "running":
        return { bg: "#eab308", glow: "rgba(234, 179, 8, 0.5)" };
      case "error":
      case "failed":
      case "red":
      case "rolled-back":
        return { bg: "#ef4444", glow: "rgba(239, 68, 68, 0.5)" };
      default:
        return { bg: "#64748b", glow: "transparent" };
    }
  };

  const { bg, glow } = getColors();

  return (
    <span style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
      {pulsing && (
        <span
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: bg,
            opacity: 0.6,
            animation: "pulseDot 2s infinite ease-in-out"
          }}
        />
      )}
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: bg,
          boxShadow: `0 0 8px ${glow}`,
          display: "inline-block"
        }}
      />
    </span>
  );
};
