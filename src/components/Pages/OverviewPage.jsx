import React from "react";
import { StatCard } from "../Dashboard/StatCard";
import { DORAMetrics } from "../Dashboard/DORAMetrics";
import { SecurityRadar } from "../Dashboard/SecurityRadar";
import { PipelineTimeline } from "../Dashboard/PipelineTimeline";
import { DeploymentChart } from "../Dashboard/DeploymentChart";
import { ModelPromotionFlow } from "../Dashboard/ModelPromotionFlow";
import { LiveActivityFeed } from "../Dashboard/LiveActivityFeed";
import { DonutChart } from "../Charts/DonutChart";

export const OverviewPage = ({ summary, liveEvents }) => {
  const s = summary || {};
  const dora = s.dora_metrics || {};
  const gatekeeper = s.gatekeeper_summary || {};
  const sec = s.security_summary || {};

  const filteredDeployments = s.recent_deployments || [];
  const filteredPipelines = s.recent_pipelines || [];
  const filteredModels = s.recent_models || [];
  const filteredEvents = liveEvents || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">MLOps Observability & Governance Overview</h2>
          <p className="page-subtitle">Real-time telemetry across pipelines, security checks, and traffic light governance</p>
        </div>
      </div>

      <div className="grid-4">
        <StatCard
          title="Total CI/CD Pipelines"
          value={s.total_pipeline_runs || 0}
          subtitle="All automated workflow runs"
          icon="🚀"
          sparklineData={[{ val: 10 }, { val: 15 }, { val: 18 }, { val: 24 }, { val: s.total_pipeline_runs || 30 }]}
          sparklineColor="#3b82f6"
        />
        <StatCard
          title="Azure Deployments"
          value={s.total_deployments || 0}
          subtitle="Container Apps rollouts"
          icon="☁️"
          sparklineData={[{ val: 2 }, { val: 4 }, { val: 5 }, { val: 8 }, { val: s.total_deployments || 12 }]}
          sparklineColor="#22c55e"
        />
        <StatCard
          title="Promoted ML Models"
          value={s.total_model_promotions || 0}
          subtitle="Staging / Prod MLflow targets"
          icon="🧠"
          sparklineData={[{ val: 1 }, { val: 2 }, { val: 3 }, { val: s.total_model_promotions || 5 }]}
          sparklineColor="#8b5cf6"
        />
        <StatCard
          title="Traffic Light Gatekeeper"
          value={s.total_gatekeeper_reports || 0}
          subtitle="PR governance evaluations"
          icon="🚦"
          sparklineData={[{ val: 5 }, { val: 12 }, { val: 19 }, { val: s.total_gatekeeper_reports || 28 }]}
          sparklineColor="#eab308"
        />
      </div>

      <div className="grid-3-1">
        <DORAMetrics metrics={dora} />
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>PR Decision Ratio</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
            Automated governance split
          </p>
          <DonutChart data={gatekeeper} height={180} />
        </div>
      </div>

      <div className="grid-2">
        <DeploymentChart deployments={filteredDeployments} />
        <SecurityRadar summary={sec} />
      </div>

      <div className="grid-2">
        <PipelineTimeline pipelines={filteredPipelines} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <ModelPromotionFlow promotions={filteredModels} />
          <LiveActivityFeed events={filteredEvents} />
        </div>
      </div>
    </div>
  );
};
