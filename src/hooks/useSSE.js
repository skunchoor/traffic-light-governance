import { useState, useEffect } from "react";
import { API_BASE_URL } from "../utils/constants";

export const useSSE = () => {
  const [lastEvent, setLastEvent] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const sseUrl = `${API_BASE_URL}/api/v1/metrics/events/stream`;
    let eventSource;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLastEvent(parsed);
        } catch (err) {
          // heartbeat or raw text
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      setIsConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { lastEvent, isConnected };
};
