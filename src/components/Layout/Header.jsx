import React from "react";
import { StatusDot } from "../Common/StatusDot";

export const Header = ({ isConnected }) => {
  return (
    <header
      style={{
        height: "68px",
        borderBottom: "1px solid var(--border-card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        background: "rgba(10, 10, 15, 0.75)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "0.95rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontWeight: 600 }}>
          <span style={{ color: "#8b5cf6", fontWeight: 700, letterSpacing: "-0.05em" }}>&gt;_</span>
          <span>AI Playground</span>
        </div>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontWeight: 600 }}>
          <span style={{ fontSize: "1.15rem" }}>🚦</span>
          <span>Traffic Light Governance</span>
        </div>
        <span style={{ color: "var(--border-card)", margin: "0 0.3rem" }}>|</span>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-card)",
            padding: "0.25rem 0.65rem",
            borderRadius: "6px",
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem"
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>obs_id:</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>realtime_mlops</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div
          className="glass-card"
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.85rem",
            color: isConnected ? "#22c55e" : "#94a3b8"
          }}
        >
          <StatusDot status={isConnected ? "success" : "error"} pulsing={isConnected} />
          <span>{isConnected ? "Live SSE Stream Connected" : "Polling Mode / Reconnecting"}</span>
        </div>

        <a
          href="https://github.com/skunchoor/traffic-light-governance"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "8px",
            border: "1px solid var(--border-card)",
            background: "var(--bg-card)"
          }}
        >
          GitHub Repo
        </a>
      </div>
    </header>
  );
};
