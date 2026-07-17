import React, { useState, useEffect, useRef } from "react";
import { StatusDot } from "../Common/StatusDot";

export const Header = ({ isConnected, selectedProjects = [], setSelectedProjects, availableProjects = [] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAllSelected = selectedProjects.length === 0 || selectedProjects.length === availableProjects.length;

  const toggleProject = (project) => {
    if (isAllSelected) {
      // If currently all selected, clicking one unselects it (or selects only others)
      const next = availableProjects.filter((p) => p !== project);
      setSelectedProjects(next);
    } else if (selectedProjects.includes(project)) {
      const next = selectedProjects.filter((p) => p !== project);
      setSelectedProjects(next.length === 0 ? ["__NONE__"] : next);
    } else {
      const next = selectedProjects.filter((p) => p !== "__NONE__").concat(project);
      if (next.length === availableProjects.length) {
        setSelectedProjects([]);
      } else {
        setSelectedProjects(next);
      }
    }
  };

  const handleSelectAll = () => {
    setSelectedProjects([]);
  };

  const handleClearAll = () => {
    setSelectedProjects(["__NONE__"]);
  };

  const getDropdownLabel = () => {
    if (isAllSelected) return `Projects: All (${availableProjects.length})`;
    if (selectedProjects.includes("__NONE__") || selectedProjects.length === 0) return "Projects: None";
    if (selectedProjects.length === 1) return `Project: ${selectedProjects[0].replace("skunchoor/", "")}`;
    return `Projects: ${selectedProjects.length} Selected`;
  };

  return (
    <header
      style={{
        height: "68px",
        borderBottom: "1px solid var(--border-card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        background: "rgba(10, 10, 15, 0.75)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "0.95rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontWeight: 600 }}>
          <span style={{ color: "#8b5cf6", fontWeight: 700, letterSpacing: "-0.05em" }}>&gt;_</span>
          <span>AI Playground</span>
        </div>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontWeight: 600 }}>
          <span style={{ fontSize: "1.15rem" }}>🚦</span>
          <span>Traffic Light Governance</span>
        </div>
        <span style={{ color: "var(--border-card)", margin: "0 0.3rem" }}>|</span>

        {/* Multi-Select Project Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: isDropdownOpen ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.04)",
              border: isDropdownOpen ? "1px solid #8b5cf6" : "1px solid var(--border-card)",
              padding: "0.3rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.82rem",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              transition: "all 0.2s ease"
            }}
          >
            <span>📦</span>
            <span>{getDropdownLabel()}</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{isDropdownOpen ? "▲" : "▼"}</span>
          </button>

          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                background: "#12121d",
                border: "1px solid var(--border-card)",
                borderRadius: "10px",
                padding: "0.8rem",
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                width: "300px",
                zIndex: 1000
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  paddingBottom: "0.6rem",
                  marginBottom: "0.6rem"
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>Filter by Project</span>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button
                    onClick={handleSelectAll}
                    style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                  >
                    Select All
                  </button>
                  <span style={{ color: "var(--border-card)" }}>|</span>
                  <button
                    onClick={handleClearAll}
                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {availableProjects.map((project) => {
                  const isChecked = isAllSelected || selectedProjects.includes(project);
                  return (
                    <label
                      key={project}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.4rem 0.5rem",
                        borderRadius: "6px",
                        background: isChecked ? "rgba(139, 92, 246, 0.08)" : "transparent",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        color: isChecked ? "var(--text-primary)" : "var(--text-secondary)",
                        transition: "background 0.15s ease"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProject(project)}
                        style={{ accentColor: "#8b5cf6", cursor: "pointer" }}
                      />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{project}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div
          className="glass-card"
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.85rem",
            color: isConnected ? "#22c55e" : "#94a3b8"
          }}
        >
          <StatusDot status={isConnected ? "success" : "error"} pulsing={isConnected} />
          <span>{isConnected ? "Live SSE Stream Connected" : "Polling Mode / Reconnecting"}</span>
        </div>
      </div>
    </header>
  );
};

