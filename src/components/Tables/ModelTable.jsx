import React from "react";
import { TrafficLightBadge } from "../Dashboard/TrafficLightBadge";
import { formatRelativeTime } from "../../utils/formatters";

export const ModelTable = ({ models = [] }) => {
  return (
    <div className="glass-card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-card)", background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)" }}>
            <th style={{ padding: "1rem" }}>Governance Decision</th>
            <th style={{ padding: "1rem" }}>Project</th>
            <th style={{ padding: "1rem" }}>Model Name & Version</th>
            <th style={{ padding: "1rem" }}>Stage Transition</th>
            <th style={{ padding: "1rem" }}>Evaluation Metrics</th>
            <th style={{ padding: "1rem" }}>Gatekeeper Reason</th>
            <th style={{ padding: "1rem" }}>Promoted</th>
          </tr>
        </thead>
        <tbody>
          {models.map((mod) => (
            <tr key={mod.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "1rem" }}>
                <TrafficLightBadge light={mod.decision} size="sm" />
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.04)", borderRadius: "4px", color: "var(--text-primary)" }}>
                  {mod.project || "skunchoor/traffic-light-governance"}
                </span>
              </td>
              <td style={{ padding: "1rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>{mod.model_name}</strong>
                <span style={{ marginLeft: "0.5rem", padding: "0.15rem 0.5rem", background: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd", borderRadius: "4px", fontSize: "0.78rem" }}>
                  {mod.model_version}
                </span>
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>{mod.from_stage}</span>
                <span style={{ margin: "0 0.4rem", color: "#64748b" }}>→</span>
                <strong style={{ color: "#22c55e" }}>{mod.to_stage}</strong>
              </td>
              <td style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Acc: <strong style={{ color: "var(--text-primary)" }}>{mod.metrics?.accuracy || "N/A"}</strong> | F1: <strong style={{ color: "var(--text-primary)" }}>{mod.metrics?.f1_score || "N/A"}</strong>
                </div>
              </td>
              <td style={{ padding: "1rem", color: "var(--text-secondary)", maxWidth: "250px" }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {mod.decision_reason || mod.gatekeeper_reason || "Passed traffic light evaluation"}
                </div>
              </td>
              <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{formatRelativeTime(mod.promoted_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
