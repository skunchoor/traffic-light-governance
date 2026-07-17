import React from "react";
import { RadarChart } from "../Charts/RadarChart";

export const SecurityRadar = ({ summary = {} }) => {
  const radarData = Object.keys(summary).map((toolName) => ({
    subject: toolName.toUpperCase(),
    val: summary[toolName]?.total || 0,
    high: summary[toolName]?.high || 0
  }));

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
    </div>
  );
};
