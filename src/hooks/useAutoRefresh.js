import { useEffect } from "react";

export const useAutoRefresh = (reloadFunction, intervalMs = 15000) => {
  useEffect(() => {
    const timer = setInterval(() => {
      reloadFunction(false);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [reloadFunction, intervalMs]);
};
