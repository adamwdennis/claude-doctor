import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";

export function ExportButton() {
  const [open, setOpen] = useState(false);

  function handleExportJson() {
    window.open("/api/diagnose?format=json-download", "_blank");
    setOpen(false);
  }

  function handleExportHtml() {
    window.open("/api/diagnose?format=html", "_blank");
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
            <button
              onClick={handleExportJson}
              className="flex w-full items-center rounded-sm px-3 py-2 text-sm hover:bg-accent"
            >
              Export JSON
            </button>
            <button
              onClick={handleExportHtml}
              className="flex w-full items-center rounded-sm px-3 py-2 text-sm hover:bg-accent"
            >
              Export HTML
            </button>
          </div>
        </>
      )}
    </div>
  );
}
