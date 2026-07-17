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
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1e1e2d 0%, #2d2d44 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }}
        >
          🚦
        </div>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Traffic Light Governance
          </h1>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
            Real-Time MLOps & CI/CD Observability
          </span>
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
