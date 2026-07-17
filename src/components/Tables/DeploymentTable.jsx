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
            <th style={{ padding: "1rem" }}>Service / Component</th>
            <th style={{ padding: "1rem" }}>Environment</th>
            <th style={{ padding: "1rem" }}>Target URL / Host</th>
            <th style={{ padding: "1rem" }}>Deployer</th>
            <th style={{ padding: "1rem" }}>Deployed</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((dep) => (
            <tr key={dep.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "1rem" }}>
                <StatusDot status={dep.status} pulsing={dep.status === "in-progress"} />
                <span style={{ marginLeft: "0.5rem", textTransform: "capitalize", fontWeight: 500 }}>{dep.status}</span>
              </td>
              <td style={{ padding: "1rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>{dep.service_name}</strong>
                <code style={{ display: "block", fontSize: "0.75rem", color: "#3b82f6" }}>{dep.commit_sha?.substring(0, 7)}</code>
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
                  <span style={{ color: "var(--text-muted)" }}>Azure Container App</span>
                )}
              </td>
              <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{dep.deployer || "github-actions"}</td>
              <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{formatRelativeTime(dep.deployed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
