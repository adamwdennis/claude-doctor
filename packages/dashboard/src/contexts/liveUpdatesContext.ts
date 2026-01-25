import { createContext, useContext } from "react";

export interface LiveUpdatesContextValue {
  isConnected: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const LiveUpdatesContext =
  createContext<LiveUpdatesContextValue | null>(null);

export function useLiveUpdatesContext() {
  const context = useContext(LiveUpdatesContext);
  if (!context) {
    throw new Error(
      "useLiveUpdatesContext must be used within LiveUpdatesProvider"
    );
  }
  return context;
}
