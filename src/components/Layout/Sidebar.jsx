import React from "react";
import { NAVIGATION_ITEMS } from "../../utils/constants";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside
      style={{
        width: "250px",
        borderRight: "1px solid var(--border-card)",
        background: "rgba(10, 10, 15, 0.9)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 1rem",
        height: "calc(100vh - 68px)",
        position: "sticky",
        top: "68px"
      }}
    >
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 0.75rem", marginBottom: "0.75rem" }}>
        Navigation
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "none",
                background: isActive ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)" : "transparent",
                color: isActive ? "#3b82f6" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.92rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent"
              }}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div
        className="glass-card"
        style={{
          padding: "1rem",
          marginTop: "auto",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem"
        }}
      >
        <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Traffic Light Matrix</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ color: "#22c55e" }}>🟢</span> Auto-Approve (Config)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ color: "#eab308" }}>🟡</span> Review (Core Logic)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ color: "#ef4444" }}>🔴</span> Blocked (Sec/Fail)
        </div>
      </div>
    </aside>
  );
};
