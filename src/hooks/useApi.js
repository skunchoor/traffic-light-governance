import { useState, useEffect, useCallback, useRef } from "react";

export const useApi = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRef = useRef(fetchFunction);
  useEffect(() => {
    fetchRef.current = fetchFunction;
  }, [fetchFunction]);

  const reload = useCallback(async (showLoading = true) => {
    if (showLoading === true || (typeof showLoading !== "boolean")) {
      setLoading(true);
    }
    try {
      const res = await fetchRef.current();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload(true);
  }, [...dependencies]);

  return { data, loading, error, reload, setData };
};
