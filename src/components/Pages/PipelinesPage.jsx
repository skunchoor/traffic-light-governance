import React, { useState, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { fetchPipelines } from "../../utils/api";
import { PipelineTable } from "../Tables/PipelineTable";
import { EmptyState } from "../Common/EmptyState";

export const PipelinesPage = ({ selectedProjects = [], availableProjects = [] }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const fetcher = useCallback(() => fetchPipelines(statusFilter), [statusFilter]);
  const { data: pipelines, loading, error, reload } = useApi(fetcher, [statusFilter]);

  const isAllSelected = selectedProjects.length === 0 || selectedProjects.length === availableProjects.length;
  const filteredPipelines = (pipelines || []).filter((run) => {
    if (isAllSelected) return true;
    if (selectedProjects.includes("__NONE__")) return false;
    return selectedProjects.includes(run.project || "skunchoor/traffic-light-governance");
  });

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

      {loading && !pipelines ? (
        <div style={{ color: "var(--text-secondary)", padding: "3rem", textAlign: "center" }}>Loading pipelines...</div>
      ) : error && !pipelines ? (
        <div style={{ color: "#ef4444", padding: "2rem" }}>Error loading pipelines: {error}</div>
      ) : filteredPipelines.length === 0 ? (
        <EmptyState title="No pipeline runs found" description="No CI/CD pipeline runs match the current project or status filter." />
      ) : (
        <PipelineTable pipelines={filteredPipelines} />
      )}
    </div>
  );
};
