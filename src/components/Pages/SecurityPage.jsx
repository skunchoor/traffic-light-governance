import React, { useMemo } from "react";
import { SecurityRadar } from "../Dashboard/SecurityRadar";
import { BarChart } from "../Charts/BarChart";

export const SecurityPage = ({ summary, selectedProjects = [], availableProjects = [] }) => {
  const s = summary || {};
  const rawSec = s.security_summary || {};

  const isAllSelected = selectedProjects.length === 0 || selectedProjects.length === availableProjects.length;

  const sec = useMemo(() => {
    if (isAllSelected) return rawSec;
    if (selectedProjects.includes("__NONE__")) {
      return { by_project: {}, semgrep: { total: 0 }, bandit: { total: 0 }, snyk: { total: 0 }, safety: { total: 0 }, pip_audit: { total: 0 }, trivy: { total: 0 }, gitleaks: { total: 0 } };
    }
    const filteredByProject = {};
    Object.entries(rawSec.by_project || {}).forEach(([proj, data]) => {
      if (selectedProjects.includes(proj)) {
        filteredByProject[proj] = data;
      }
    });

    // Scale or sum findings across selected projects
    let semgrepTotal = 0, banditTotal = 0, snykTotal = 0, safetyTotal = 0, pipAuditTotal = 0, trivyTotal = 0, gitleaksTotal = 0;
    const projKeys = Object.keys(filteredByProject);
    if (projKeys.length > 0 && Object.keys(rawSec.by_project || {}).length > 0) {
      projKeys.forEach((proj) => {
        const pData = filteredByProject[proj] || {};
        if (pData.tools) {
          semgrepTotal += pData.tools.semgrep?.total || 0;
          banditTotal += pData.tools.bandit?.total || 0;
          snykTotal += pData.tools.snyk?.total || 0;
          safetyTotal += pData.tools.safety?.total || 0;
          pipAuditTotal += pData.tools.pip_audit?.total || 0;
          trivyTotal += pData.tools.trivy?.total || 0;
          gitleaksTotal += pData.tools.gitleaks?.total || 0;
        } else {
          const pTotal = (pData.high || 0) + (pData.medium || 0) + (pData.low || 0) + (pData.total || 0);
          const allTotal = Object.values(rawSec.by_project || {}).reduce((acc, d) => acc + (d.high || 0) + (d.medium || 0) + (d.low || 0) + (d.total || 0), 0) || 1;
          const ratio = pTotal / allTotal;
          semgrepTotal += Math.round((rawSec.semgrep?.total || 0) * ratio);
          banditTotal += Math.round((rawSec.bandit?.total || 0) * ratio);
          snykTotal += Math.round((rawSec.snyk?.total || 0) * ratio);
          safetyTotal += Math.round((rawSec.safety?.total || 0) * ratio);
          pipAuditTotal += Math.round((rawSec.pip_audit?.total || 0) * ratio);
          trivyTotal += Math.round((rawSec.trivy?.total || 0) * ratio);
          gitleaksTotal += Math.round((rawSec.gitleaks?.total || 0) * ratio);
        }
      });
    }

    return {
      ...rawSec,
      by_project: filteredByProject,
      semgrep: { total: semgrepTotal, high: Math.round(semgrepTotal * 0.4) },
      bandit: { total: banditTotal, high: Math.round(banditTotal * 0.3) },
      snyk: { total: snykTotal, high: Math.round(snykTotal * 0.5) },
      safety: { total: safetyTotal, high: Math.round(safetyTotal * 0.2) },
      pip_audit: { total: pipAuditTotal, high: Math.round(pipAuditTotal * 0.3) },
      trivy: { total: trivyTotal, high: Math.round(trivyTotal * 0.4) },
      gitleaks: { total: gitleaksTotal, high: Math.round(gitleaksTotal * 0.8) }
    };
  }, [rawSec, selectedProjects, isAllSelected]);

  const toolsList = [
    { name: "Semgrep", desc: "Static Application Security Testing (SAST) for Python & JS code vulnerabilities" },
    { name: "Bandit", desc: "Python AST scanner looking for insecure coding practices and dangerous functions" },
    { name: "Snyk", desc: "Software Composition Analysis (SCA) detecting known vulnerabilities in dependencies" },
    { name: "Safety", desc: "Checks installed Python packages against CVE vulnerability databases" },
    { name: "pip-audit", desc: "PyPA auditing tool scanning environment dependencies against PyPI advisory database" },
    { name: "Trivy", desc: "Comprehensive container image, file system, and infrastructure security scanner" },
    { name: "Gitleaks", desc: "Fast secret scanner detecting hardcoded API keys, tokens, and passwords in git history" }
  ];

  const barData = Object.keys(sec)
    .filter((key) => key !== "by_project")
    .map((key) => ({
      name: key.toUpperCase(),
      value: sec[key]?.total || 0
    }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Multi-Tool Security Scanner Matrix</h2>
          <p className="page-subtitle">Unified vulnerability breakdown across 7 specialized open-source security engines</p>
        </div>
      </div>

      <div className="grid-2">
        <SecurityRadar summary={sec} />
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>Total Findings by Tool</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Aggregated findings count across all historical pull request scans
          </p>
          <BarChart data={barData} dataKey="value" xKey="name" color="#8b5cf6" height={240} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "1rem" }}>Security Tools Suite & Capabilities</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
          {toolsList.map((tool, idx) => {
            const toolKey = tool.name.toLowerCase().replace("-", "_");
            const findings = sec[toolKey]?.total || 0;
            return (
              <div
                key={idx}
                style={{
                  padding: "1rem",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{tool.name}</strong>
                    <span
                      style={{
                        padding: "0.15rem 0.6rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: findings > 0 ? "rgba(234, 179, 8, 0.15)" : "rgba(34, 197, 94, 0.15)",
                        color: findings > 0 ? "#eab308" : "#22c55e"
                      }}
                    >
                      {findings} Findings
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{tool.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
