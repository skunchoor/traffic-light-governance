import React from "react";
import { TrafficLightBadge } from "./TrafficLightBadge";
import { formatRelativeTime } from "../../utils/formatters";

export const ModelPromotionFlow = ({ promotions = [] }) => {
  const latest = promotions.slice(0, 4);

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>MLflow Model Promotion Flow</h3>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
        Automated stage transitions (`None → Staging → Production`) gated by traffic light checks
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {latest.map((mp) => (
          <div
            key={mp.id}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem"
            }}
          >
            <div>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {mp.model_name}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#8b5cf6", marginLeft: "0.5rem", fontWeight: 600 }}>
                {mp.model_version}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <span style={{ padding: "0.15rem 0.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                  {mp.from_stage}
                </span>
                <span>→</span>
                <span style={{ padding: "0.15rem 0.5rem", background: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd", borderRadius: "4px", fontWeight: 500 }}>
                  {mp.to_stage}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Acc: <strong style={{ color: "var(--text-primary)" }}>{mp.metrics?.accuracy || "N/A"}</strong>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {formatRelativeTime(mp.promoted_at)}
                </div>
              </div>
              <TrafficLightBadge light={mp.decision} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
