import React, { useState, useCallback, useMemo } from "react";
import { useApi } from "../../hooks/useApi";
import { fetchGatekeeperReports } from "../../utils/api";
import { GatekeeperTable } from "../Tables/GatekeeperTable";
import { DonutChart } from "../Charts/DonutChart";
import { EmptyState } from "../Common/EmptyState";

export const GatekeeperPage = ({ selectedProjects = [], availableProjects = [] }) => {
  const [lightFilter, setLightFilter] = useState("");
  const fetcher = useCallback(() => fetchGatekeeperReports(lightFilter), [lightFilter]);
  const { data: reports, loading, error, reload } = useApi(fetcher, [lightFilter]);

  const isAllSelected = selectedProjects.length === 0 || selectedProjects.length === availableProjects.length;
  const filteredReports = (reports || []).filter((rep) => {
    if (isAllSelected) return true;
    if (selectedProjects.includes("__NONE__")) return false;
    return selectedProjects.includes(rep.project || "skunchoor/traffic-light-governance");
  });

  const chartData = useMemo(() => {
    const counts = { GREEN: 0, YELLOW: 0, RED: 0 };
    filteredReports.forEach((r) => {
      if (r.traffic_light && counts[r.traffic_light] !== undefined) {
        counts[r.traffic_light]++;
      }
    });
    return counts;
  }, [filteredReports]);

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

      {loading && !reports ? (
        <div style={{ color: "var(--text-secondary)", padding: "3rem", textAlign: "center" }}>Loading gatekeeper reports...</div>
      ) : error && !reports ? (
        <div style={{ color: "#ef4444", padding: "2rem" }}>Error loading reports: {error}</div>
      ) : filteredReports.length === 0 ? (
        <EmptyState title="No governance reports found" description="No gatekeeper reports match the current project or traffic light filter." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem", maxWidth: "420px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.3rem" }}>PR Decision Ratio</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              Automated governance decision distribution across selected projects
            </p>
            <DonutChart data={chartData} height={180} />
          </div>
          <GatekeeperTable reports={filteredReports} />
        </div>
      )}
    </div>
  );
};
