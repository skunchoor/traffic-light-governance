import React from "react";
import { COLORS } from "../../utils/constants";

export const TrafficLightBadge = ({ light = "GREEN", size = "md" }) => {
  const getLightConfig = () => {
    switch (light?.toUpperCase()) {
      case "GREEN":
        return { bg: COLORS.GREEN, label: "GREEN — Auto-Approved", glow: "rgba(34, 197, 94, 0.4)", icon: "🟢" };
      case "YELLOW":
        return { bg: COLORS.YELLOW, label: "YELLOW — Review Required", glow: "rgba(234, 179, 8, 0.4)", icon: "🟡" };
      case "RED":
        return { bg: COLORS.RED, label: "RED — Blocked", glow: "rgba(239, 68, 68, 0.4)", icon: "🔴" };
      default:
        return { bg: "#64748b", label: light || "UNKNOWN", glow: "transparent", icon: "⚪" };
    }
  };

  const { bg, label, glow, icon } = getLightConfig();
  const isSm = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: isSm ? "0.2rem 0.6rem" : "0.35rem 0.85rem",
        borderRadius: "20px",
        backgroundColor: "rgba(10, 10, 15, 0.6)",
        border: `1px solid ${bg}`,
        boxShadow: `0 0 12px ${glow}`,
        fontSize: isSm ? "0.75rem" : "0.82rem",
        fontWeight: 600,
        color: bg
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};
