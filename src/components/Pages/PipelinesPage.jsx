import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { fetchPipelines } from "../../utils/api";
import { PipelineTable } from "../Tables/PipelineTable";
import { EmptyState } from "../Common/EmptyState";

export const PipelinesPage = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: pipelines, loading, error, reload } = useApi(() => fetchPipelines(statusFilter), [statusFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">CI/CD Pipeline Execution Logs</h2>
          <p className="page-subtitle">Historical GitHub Actions runs for code checks, security scans, and ML model builds</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border-card)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "0.88rem"
            }}
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
          <button
            onClick={reload}
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

      {loading ? (
        <div style={{ color: "var(--text-secondary)", padding: "3rem", textAlign: "center" }}>Loading pipelines...</div>
      ) : error ? (
        <div style={{ color: "#ef4444", padding: "2rem" }}>Error loading pipelines: {error}</div>
      ) : !pipelines || pipelines.length === 0 ? (
        <EmptyState title="No pipeline runs found" description="Push commits to GitHub or run automated workflows to see execution history." />
      ) : (
        <PipelineTable pipelines={pipelines} />
      )}
    </div>
  );
};
