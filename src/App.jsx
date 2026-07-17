import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout/Layout";
import { OverviewPage } from "./components/Pages/OverviewPage";
import { PipelinesPage } from "./components/Pages/PipelinesPage";
import { DeploymentsPage } from "./components/Pages/DeploymentsPage";
import { ModelsPage } from "./components/Pages/ModelsPage";
import { GatekeeperPage } from "./components/Pages/GatekeeperPage";
import { SecurityPage } from "./components/Pages/SecurityPage";
import { useApi } from "./hooks/useApi";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { useSSE } from "./hooks/useSSE";
import { fetchSummary } from "./utils/api";
import "./App.css";

export function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: summary, loading, error, reload, setData: setSummary } = useApi(fetchSummary, []);
  const { lastEvent } = useSSE();
  const [liveEvents, setLiveEvents] = useState([]);

  // Auto refresh summary every 30 seconds
  useAutoRefresh(reload, 30000);

  // Append incoming real-time SSE events to feed & refresh data
  useEffect(() => {
    if (lastEvent && lastEvent.event_type && lastEvent.event_type !== "heartbeat") {
      const newEv = {
        id: Date.now(),
        type: lastEvent.event_type,
        title: lastEvent.data?.pr_title || lastEvent.data?.workflow_name || lastEvent.data?.service_name || lastEvent.data?.model_name || "New activity detected",
        status: lastEvent.data?.traffic_light || lastEvent.data?.status || lastEvent.data?.decision || "info",
        timestamp: new Date().toISOString()
      };
      setLiveEvents((prev) => [newEv, ...prev.slice(0, 15)]);
      // Trigger a silent reload of summary data
      reload();
    }
  }, [lastEvent, reload]);

  const renderContent = () => {
    if (loading && !summary) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--text-secondary)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚦</div>
            <p>Connecting to Traffic Light Governance Backend...</p>
          </div>
        </div>
      );
    }

    if (error && !summary) {
      return (
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "#ef4444", margin: "2rem auto", maxWidth: "600px" }}>
          <h3>Unable to Connect to API</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>{error}</p>
          <button
            onClick={reload}
            style={{
              marginTop: "1.5rem",
              padding: "0.6rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: "#3b82f6",
              color: "#f8fafc",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Retry Connection
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <OverviewPage summary={summary} liveEvents={liveEvents} />;
      case "pipelines":
        return <PipelinesPage />;
      case "deployments":
        return <DeploymentsPage />;
      case "models":
        return <ModelsPage />;
      case "gatekeeper":
        return <GatekeeperPage />;
      case "security":
        return <SecurityPage summary={summary} />;
      default:
        return <OverviewPage summary={summary} liveEvents={liveEvents} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
