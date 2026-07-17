import React from "react";
import { RadarChart } from "../Charts/RadarChart";

export const SecurityRadar = ({ summary = {} }) => {
  const radarData = Object.keys(summary)
    .filter((toolName) => toolName !== "by_project")
    .map((toolName) => ({
      subject: toolName.toUpperCase(),
      val: summary[toolName]?.total || 0,
      high: summary[toolName]?.high || 0
    }));

  const byProject = summary.by_project || {};
  const projects = Object.keys(byProject);

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>Security Radar (7 Tools Matrix)</h3>
        <span style={{ fontSize: "0.75rem", color: "#8b5cf6", fontWeight: 600 }}>SAST / SCA / Secrets</span>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
        Vulnerabilities detected across Semgrep, Bandit, Snyk, Safety, pip-audit, Trivy, and Gitleaks
      </p>
      <RadarChart data={radarData} dataKey="val" angleKey="subject" color="#8b5cf6" height={240} />

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "1.25rem 0 1rem 0", paddingTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>Project-Level Security Findings</h4>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Across monitored repositories</span>
        </div>
        {projects.length === 0 ? (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No project findings recorded yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {projects.map((proj) => {
              const data = byProject[proj] || {};
              return (
                <div
                  key={proj}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.8rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    fontSize: "0.82rem"
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-primary)" }}>{proj}</span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ padding: "0.15rem 0.45rem", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                      High: {data.high || 0}
                    </span>
                    <span style={{ padding: "0.15rem 0.45rem", background: "rgba(234, 179, 8, 0.15)", color: "#facc15", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                      Med: {data.medium || 0}
                    </span>
                    <span style={{ padding: "0.15rem 0.45rem", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                      Low: {data.low || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
