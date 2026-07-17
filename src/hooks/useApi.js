import { useState, useEffect, useCallback } from "react";

export const useApi = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFunction();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    reload();
  }, [...dependencies, reload]);

  return { data, loading, error, reload, setData };
};
