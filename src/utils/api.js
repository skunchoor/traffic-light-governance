import { API_BASE_URL } from "./constants";

export const fetchSummary = async () => {
  const res = await fetch(`${API_BASE_URL}/api/v1/metrics/summary`);
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
};

export const fetchPipelines = async (status = "", workflow = "") => {
  let url = `${API_BASE_URL}/api/v1/pipelines?limit=50`;
  if (status) url += `&status=${status}`;
  if (workflow) url += `&workflow_name=${encodeURIComponent(workflow)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch pipelines");
  return res.json();
};

export const fetchDeployments = async (env = "") => {
  let url = `${API_BASE_URL}/api/v1/deployments?limit=50`;
  if (env) url += `&environment=${env}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch deployments");
  return res.json();
};

export const fetchModels = async (decision = "") => {
  let url = `${API_BASE_URL}/api/v1/models?limit=50`;
  if (decision) url += `&decision=${decision}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
};

export const fetchGatekeeperReports = async (light = "") => {
  let url = `${API_BASE_URL}/api/v1/gatekeeper?limit=50`;
  if (light) url += `&traffic_light=${light}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch gatekeeper reports");
  return res.json();
};
