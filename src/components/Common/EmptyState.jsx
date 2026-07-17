import React from "react";

export const EmptyState = ({ title = "No data found", description = "Get started by running your first pipeline or workflow." }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: "3rem",
        textAlign: "center",
        color: "var(--text-secondary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem"
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🚦</div>
      <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem" }}>{title}</h3>
      <p style={{ maxWidth: "400px", fontSize: "0.95rem" }}>{description}</p>
    </div>
  );
};
