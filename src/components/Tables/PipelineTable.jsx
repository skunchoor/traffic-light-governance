import React from "react";
import { StatusDot } from "../Common/StatusDot";
import { formatDuration, formatRelativeTime } from "../../utils/formatters";

export const PipelineTable = ({ pipelines = [] }) => {
  return (
    <div className="glass-card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-card)", background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)" }}>
            <th style={{ padding: "1rem" }}>Status</th>
            <th style={{ padding: "1rem" }}>Project</th>
            <th style={{ padding: "1rem" }}>Workflow / Run</th>
            <th style={{ padding: "1rem" }}>Branch & Commit</th>
            <th style={{ padding: "1rem" }}>Trigger / Actor</th>
            <th style={{ padding: "1rem" }}>Duration</th>
            <th style={{ padding: "1rem" }}>Started</th>
          </tr>
        </thead>
        <tbody>
          {pipelines.map((run) => (
            <tr key={run.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "1rem" }}>
                <StatusDot status={run.status} pulsing={run.status === "running"} />
                <span style={{ marginLeft: "0.5rem", textTransform: "capitalize", fontWeight: 500 }}>{run.status}</span>
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.04)", borderRadius: "4px", color: "var(--text-primary)" }}>
                  {run.project || "skunchoor/traffic-light-governance"}
                </span>
              </td>
              <td style={{ padding: "1rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>{run.workflow_name}</strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {run.run_id}</div>
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{ padding: "0.15rem 0.5rem", background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderRadius: "4px" }}>{run.branch || "main"}</span>
                <code style={{ marginLeft: "0.5rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>{run.commit_sha?.substring(0, 7) || "N/A"}</code>
              </td>
              <td style={{ padding: "1rem" }}>
                <div>{run.actor || "github-actions"}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{run.trigger || "push"}</div>
              </td>
              <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{formatDuration(run.duration_seconds)}</td>
              <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{formatRelativeTime(run.started_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
