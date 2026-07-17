import React from "react";
import { formatRelativeTime } from "../../utils/formatters";

export const LiveActivityFeed = ({ events = [] }) => {
  const getIcon = (type, status) => {
    if (status === "green" || status === "success") return "🟢";
    if (status === "yellow") return "🟡";
    if (status === "red" || status === "failed") return "🔴";
    return "⚡";
  };

  return (
    <div className="glass-card" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>Live Activity Feed</h3>
        <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "12px", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", fontWeight: 600 }}>
          SSE Streaming
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto", flex: 1, maxHeight: "350px" }}>
        {events.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>
            Waiting for live events...
          </div>
        ) : (
          events.map((ev, idx) => (
            <div
              key={ev.id || idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                background: idx === 0 ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.015)",
                border: idx === 0 ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid transparent",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "1.1rem", marginTop: "2px" }}>{getIcon(ev.type, ev.status)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "0.86rem", fontWeight: 500, color: "var(--text-primary)", display: "block", wordBreak: "break-word" }}>
                  {ev.title || "Unknown event"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {ev.type?.toUpperCase()} • {formatRelativeTime(ev.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
