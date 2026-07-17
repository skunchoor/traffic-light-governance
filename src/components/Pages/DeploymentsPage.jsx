import React, { useState, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { fetchDeployments } from "../../utils/api";
import { DeploymentTable } from "../Tables/DeploymentTable";
import { EmptyState } from "../Common/EmptyState";

export const DeploymentsPage = () => {
  const [envFilter, setEnvFilter] = useState("");
  const fetcher = useCallback(() => fetchDeployments(envFilter), [envFilter]);
  const { data: deployments, loading, error, reload } = useApi(fetcher, [envFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Azure & Databricks Deployment History</h2>
          <p className="page-subtitle">Track service rollouts, staging verifications, and production container updates</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border-card)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "0.88rem"
            }}
          >
            <option value="">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
          </select>
          <button
            onClick={() => reload(true)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: "#3b82f6",
              color: "#f8fafc",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.88rem"
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && !deployments ? (
        <div style={{ color: "var(--text-secondary)", padding: "3rem", textAlign: "center" }}>Loading deployments...</div>
      ) : error && !deployments ? (
        <div style={{ color: "#ef4444", padding: "2rem" }}>Error loading deployments: {error}</div>
      ) : !deployments || deployments.length === 0 ? (
        <EmptyState title="No deployments recorded" description="Deployments to Azure or Databricks will appear here once executed." />
      ) : (
        <DeploymentTable deployments={deployments} />
      )}
    </div>
  );
};
