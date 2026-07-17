import React from "react";

export const DORAMetrics = ({ metrics = {} }) => {
  const items = [
    { label: "Deployment Frequency", val: `${metrics.deployment_frequency || 0} / day`, status: "Elite", color: "#22c55e" },
    { label: "Lead Time for Changes", val: `${metrics.lead_time_hours || 0} hrs`, status: "High", color: "#3b82f6" },
    { label: "Change Failure Rate", val: `${metrics.change_failure_rate || 0}%`, status: metrics.change_failure_rate > 10 ? "Medium" : "Elite", color: metrics.change_failure_rate > 10 ? "#eab308" : "#22c55e" },
    { label: "Mean Time to Recovery", val: `${metrics.mttr_minutes || 0} min`, status: "High", color: "#3b82f6" }
  ];

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>4 Key DORA Metrics</h3>
        <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "12px", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", fontWeight: 600 }}>
          Last 30 Days
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem"
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{it.label}</span>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>{it.val}</div>
            <div style={{ fontSize: "0.75rem", color: it.color, fontWeight: 600 }}>{it.status} Performance</div>
          </div>
        ))}
      </div>
    </div>
  );
};
