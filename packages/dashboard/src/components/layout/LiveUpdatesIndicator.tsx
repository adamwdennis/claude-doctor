import { Radio, WifiOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLiveUpdatesContext } from "@/contexts/liveUpdatesContext";

export function LiveUpdatesIndicator() {
  const { isConnected, isEnabled, setEnabled } = useLiveUpdatesContext();

  function handleToggle() {
    setEnabled(!isEnabled);
  }

  const statusText = !isEnabled
    ? "Live updates disabled"
    : isConnected
      ? "Live updates active"
      : "Connecting...";

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={handleToggle}
        aria-label={statusText}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        {isEnabled ? (
          <>
            <Radio className="h-4 w-4" />
            <span
              className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              }`}
            />
          </>
        ) : (
          <WifiOff className="h-4 w-4 text-muted-foreground" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{statusText}</p>
        <p className="text-xs text-muted-foreground">Click to toggle</p>
      </TooltipContent>
    </Tooltip>
  );
}
