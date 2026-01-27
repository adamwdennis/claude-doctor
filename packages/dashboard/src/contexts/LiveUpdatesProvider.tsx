import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LiveUpdatesContext } from "./liveUpdatesContext";

const MAX_RETRIES = 10;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;

export function LiveUpdatesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource("/api/events");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        retryCountRef.current = 0;
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const filePath = data.filePath as string | undefined;
          if (data.type === "settings-changed") {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            queryClient.invalidateQueries({ queryKey: ["context"] });
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
            queryClient.invalidateQueries({ queryKey: ["hooks"] });
            queryClient.invalidateQueries({ queryKey: ["effective-config"] });
            toast.info(`Settings updated: ${filePath}`, { duration: 3000 });
          } else if (data.type === "mcp-changed") {
            queryClient.invalidateQueries({ queryKey: ["mcp"] });
            queryClient.invalidateQueries({ queryKey: ["context"] });
            toast.info(`MCP config updated: ${filePath}`, { duration: 3000 });
          } else if (data.type === "issues-changed") {
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            queryClient.invalidateQueries({ queryKey: ["context"] });
            queryClient.invalidateQueries({ queryKey: ["instructions"] });
            toast.info(`Issues updated: ${filePath}`, { duration: 3000 });
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        setIsConnected(false);

        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.min(
            INITIAL_DELAY * Math.pow(2, retryCountRef.current),
            MAX_DELAY
          );
          retryCountRef.current++;
          retryTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [isEnabled, queryClient]);

  return (
    <LiveUpdatesContext.Provider
      value={{ isConnected, isEnabled, setEnabled: setIsEnabled }}
    >
      {children}
    </LiveUpdatesContext.Provider>
  );
}
