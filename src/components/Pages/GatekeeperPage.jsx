import React, { useState, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { fetchGatekeeperReports } from "../../utils/api";
import { GatekeeperTable } from "../Tables/GatekeeperTable";
import { EmptyState } from "../Common/EmptyState";

export const GatekeeperPage = () => {
  const [lightFilter, setLightFilter] = useState("");
  const fetcher = useCallback(() => fetchGatekeeperReports(lightFilter), [lightFilter]);
  const { data: reports, loading, error, reload } = useApi(fetcher, [lightFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Traffic Light Gatekeeper Governance Reports</h2>
          <p className="page-subtitle">Detailed assessment matrix for Pull Requests based on security scans and test coverage</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select
            value={lightFilter}
            onChange={(e) => setLightFilter(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border-card)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "0.88rem"
            }}
          >
            <option value="">All Traffic Lights</option>
            <option value="GREEN">GREEN (Approved)</option>
            <option value="YELLOW">YELLOW (Review)</option>
            <option value="RED">RED (Blocked)</option>
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
        <div style={{ color: "var(--text-secondary)", padding: "3rem", textAlign: "center" }}>Loading gatekeeper reports...</div>
      ) : error ? (
        <div style={{ color: "#ef4444", padding: "2rem" }}>Error loading reports: {error}</div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState title="No governance evaluations yet" description="Submit Pull Requests to trigger the automated Traffic Light evaluation." />
      ) : (
        <GatekeeperTable reports={reports} />
      )}
    </div>
  );
};
