import React from "react";
import { AreaChart } from "../Charts/AreaChart";

export const DeploymentChart = ({ deployments = [] }) => {
  // Build a 7-day or 14-day frequency series
  const dateCounts = {};
  deployments.forEach((dep) => {
    if (dep.deployed_at) {
      const dateStr = new Date(dep.deployed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    }
  });

  const data = Object.keys(dateCounts).map((date) => ({
    date,
    deploys: dateCounts[date]
  })).slice(-10);

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>Azure Deployment Velocity</h3>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
        Production & Staging rollouts to Azure Container Apps
      </p>
      <AreaChart data={data} dataKey="deploys" xKey="date" color="#3b82f6" name="Deployments" height={220} />
    </div>
  );
};
