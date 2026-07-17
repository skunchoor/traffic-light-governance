// API URL configuration
// During GitHub Pages deployment, VITE_API_URL is injected via GitHub Actions environment variable
// Fallback to Vercel backend if hosted on github.io or localhost:8000 locally
export const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.includes("github.io") ? "https://traffic-light-governance.vercel.app" : "http://localhost:8000");

export const COLORS = {
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  RED: "#ef4444",
  BLUE: "#3b82f6",
  PURPLE: "#8b5cf6",
  TEXT_PRIMARY: "#f8fafc",
  TEXT_SECONDARY: "#94a3b8",
  BG_CARD: "rgba(255, 255, 255, 0.03)",
  BORDER: "rgba(255, 255, 255, 0.08)"
};

export const TRAFFIC_LIGHT_LABELS = {
  GREEN: "Auto-Approve & Merge",
  YELLOW: "Manual Peer Review Required",
  RED: "Merge & Deploy Blocked"
};

export const NAVIGATION_ITEMS = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "pipelines", label: "CI/CD Pipeline Logs", icon: "GitBranch" },
  { id: "deployments", label: "Deployments", icon: "CloudUpload" },
  { id: "models", label: "Model Registry", icon: "Cpu" },
  { id: "gatekeeper", label: "Traffic Light PRs", icon: "ShieldCheck" },
  { id: "security", label: "Security Radar", icon: "Lock" }
];
