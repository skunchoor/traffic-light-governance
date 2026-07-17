import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useSSE } from "../../hooks/useSSE";
import { Toast } from "../Common/Toast";

export const Layout = ({ children, activeTab, setActiveTab }) => {
  const { lastEvent, isConnected } = useSSE();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (lastEvent && lastEvent.event_type && lastEvent.event_type !== "heartbeat") {
      const typeLabel = lastEvent.event_type.replace("_update", "").toUpperCase();
      setToastMessage(`⚡ New real-time event received: [${typeLabel}]`);
    }
  }, [lastEvent]);

  return (
    <div className="app-container" style={{ flexDirection: "column" }}>
      <Header isConnected={isConnected} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          <div className="page-content animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
