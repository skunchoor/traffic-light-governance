import React from "react";
import { StatusDot } from "../Common/StatusDot";
import { formatRelativeTime, formatDuration } from "../../utils/formatters";

export const PipelineTimeline = ({ pipelines = [] }) => {
  if (!pipelines || pipelines.length === 0) {
    return <div style={{ color: "var(--text-muted)", padding: "1rem" }}>No recent pipeline runs</div>;
  }

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem" }}>Recent CI/CD Timeline</h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {pipelines.slice(0, 6).map((run) => (
          <div
            key={run.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              transition: "background 0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <StatusDot status={run.status} pulsing={run.status === "running"} />
              <div>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
                  {run.workflow_name} #{run.run_number || run.id}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Branch: <code style={{ color: "#3b82f6" }}>{run.branch || "main"}</code> • by {run.actor || "github-actions"}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-primary)", display: "block" }}>
                {formatDuration(run.duration_seconds)}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {formatRelativeTime(run.started_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
