import React, { useState, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { fetchModels } from "../../utils/api";
import { ModelTable } from "../Tables/ModelTable";
import { EmptyState } from "../Common/EmptyState";

export const ModelsPage = () => {
  const [decisionFilter, setDecisionFilter] = useState("");
  const fetcher = useCallback(() => fetchModels(decisionFilter), [decisionFilter]);
  const { data: models, loading, error, reload } = useApi(fetcher, [decisionFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">MLflow Model Registry & Promotions</h2>
          <p className="page-subtitle">Governance log of ML model stage transitions and automated approval metrics</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border-card)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "0.88rem"
            }}
          >
            <option value="">All Decisions</option>
            <option value="GREEN">GREEN (Approved)</option>
            <option value="YELLOW">YELLOW (Review)</option>
            <option value="RED">RED (Blocked)</option>
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

      {loading && !models ? (
        <div style={{ color: "var(--text-secondary)", padding: "3rem", textAlign: "center" }}>Loading model promotions...</div>
      ) : error && !models ? (
        <div style={{ color: "#ef4444", padding: "2rem" }}>Error loading model promotions: {error}</div>
      ) : !models || models.length === 0 ? (
        <EmptyState title="No models promoted" description="Train and evaluate models via Databricks / MLflow pipelines to record promotions." />
      ) : (
        <ModelTable models={models} />
      )}
    </div>
  );
};
