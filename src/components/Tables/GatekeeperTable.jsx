import React from "react";
import { TrafficLightBadge } from "../Dashboard/TrafficLightBadge";
import { formatRelativeTime } from "../../utils/formatters";

export const GatekeeperTable = ({ reports = [] }) => {
  return (
    <div className="glass-card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-card)", background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)" }}>
            <th style={{ padding: "1rem" }}>Decision</th>
            <th style={{ padding: "1rem" }}>Project</th>
            <th style={{ padding: "1rem" }}>Pull Request</th>
            <th style={{ padding: "1rem" }}>Tests Status</th>
            <th style={{ padding: "1rem" }}>Security Findings</th>
            <th style={{ padding: "1rem" }}>Risk Assessment / Reason</th>
            <th style={{ padding: "1rem" }}>Evaluated</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((rep) => {
            const sec = rep.security_findings || {};
            const totalFindings = Object.values(sec).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
            return (
              <tr key={rep.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "1rem" }}>
                  <TrafficLightBadge light={rep.traffic_light} size="sm" />
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.04)", borderRadius: "4px", color: "var(--text-primary)" }}>
                    {rep.repo || "skunchoor/traffic-light-governance"}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <strong style={{ color: "var(--text-primary)" }}>#{rep.pr_number} {rep.pr_title}</strong>
                </td>
                <td style={{ padding: "1rem" }}>
                  {rep.test_passed ? (
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>✔ Passed</span>
                  ) : (
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>✘ Failed ({rep.test_failures || 0})</span>
                  )}
                </td>
                <td style={{ padding: "1rem" }}>
                  {totalFindings === 0 ? (
                    <span style={{ color: "#22c55e" }}>Clean (0 findings)</span>
                  ) : (
                    <span style={{ color: totalFindings > 5 ? "#ef4444" : "#eab308", fontWeight: 600 }}>
                      {totalFindings} issues detected
                    </span>
                  )}
                </td>
                <td style={{ padding: "1rem", maxWidth: "280px" }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {rep.risk_reason || "Standard risk check"}
                  </div>
                </td>
                <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{formatRelativeTime(rep.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
