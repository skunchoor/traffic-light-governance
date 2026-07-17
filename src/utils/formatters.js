export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "N/A";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Just now";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat().format(num);
};

export const formatPercentage = (num) => {
  if (num === undefined || num === null) return "0%";
  return `${Math.round(num)}%`;
};
