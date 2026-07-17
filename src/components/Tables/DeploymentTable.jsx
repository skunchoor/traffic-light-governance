import React from "react";
import { StatusDot } from "../Common/StatusDot";
import { formatRelativeTime } from "../../utils/formatters";

export const DeploymentTable = ({ deployments = [] }) => {
  return (
    <div className="glass-card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-card)", background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)" }}>
            <th style={{ padding: "1rem" }}>Status</th>
            <th style={{ padding: "1rem" }}>Project</th>
            <th style={{ padding: "1rem" }}>Component</th>
            <th style={{ padding: "1rem" }}>Service / Version</th>
            <th style={{ padding: "1rem" }}>Environment</th>
            <th style={{ padding: "1rem" }}>Target / Azure Resource</th>
            <th style={{ padding: "1rem" }}>Deployer</th>
            <th style={{ padding: "1rem" }}>Deployed</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((dep) => (
            <tr key={dep.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "1rem" }}>
                <StatusDot status={dep.status} pulsing={dep.status === "in-progress" || dep.status === "deploying"} />
                <span style={{ marginLeft: "0.5rem", textTransform: "capitalize", fontWeight: 500 }}>{dep.status}</span>
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.04)", borderRadius: "4px", color: "var(--text-primary)" }}>
                  {dep.project || "skunchoor/traffic-light-governance"}
                </span>
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  background: dep.component === "Databricks" ? "rgba(239,68,68,0.15)" : (dep.component === "Azure AKS" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)"),
                  color: dep.component === "Databricks" ? "#f87171" : (dep.component === "Azure AKS" ? "#c084fc" : "#60a5fa")
                }}>
                  {dep.component || "Azure Container Registry"}
                </span>
              </td>
              <td style={{ padding: "1rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>{dep.version || dep.service_name || "v1.0.0"}</strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{dep.image_tag || dep.azure_resource || "Azure App"}</div>
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{ padding: "0.2rem 0.6rem", background: dep.environment === "production" ? "rgba(34, 197, 94, 0.15)" : "rgba(59, 130, 246, 0.15)", color: dep.environment === "production" ? "#22c55e" : "#3b82f6", borderRadius: "6px", fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>
                  {dep.environment}
                </span>
              </td>
              <td style={{ padding: "1rem" }}>
                {dep.target_url ? (
                  <a href={dep.target_url} target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>
                    {dep.target_url}
                  </a>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>{dep.azure_resource || "Azure Container App"}</span>
                )}
              </td>
              <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{dep.deployed_by || dep.deployer || "github-actions"}</td>
              <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{formatRelativeTime(dep.deployed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
