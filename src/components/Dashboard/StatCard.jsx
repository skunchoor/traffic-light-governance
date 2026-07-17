import React from "react";
import { Sparkline } from "../Charts/Sparkline";

export const StatCard = ({ title, value, subtitle, sparklineData = [], sparklineColor = "#3b82f6", icon }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "135px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>
            {title}
          </span>
          <div style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {value}
          </div>
        </div>
        {icon && (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem"
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "1rem" }}>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {subtitle}
        </span>
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline data={sparklineData} color={sparklineColor} />
        )}
      </div>
    </div>
  );
};
