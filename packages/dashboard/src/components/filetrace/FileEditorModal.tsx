import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useFileRead, useFileSave } from "@/hooks/useFileTrace";
import { Save, X } from "lucide-react";

interface FileEditorModalProps {
  path: string | null;
  onClose: () => void;
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function isJsonFile(path: string): boolean {
  return path.endsWith(".json");
}

export function FileEditorModal({ path, onClose }: FileEditorModalProps) {
  const { data, isLoading, error } = useFileRead(path);
  const saveMutation = useFileSave();
  // Track edits separately - null means use server content
  const [editedContent, setEditedContent] = useState<string | null>(null);

  // Derive actual content - edited or server
  const content = editedContent ?? data?.content ?? "";
  const hasChanges = editedContent !== null && editedContent !== data?.content;

  // Validate JSON
  const jsonError = useMemo(() => {
    if (!path || !isJsonFile(path) || !content) return null;
    try {
      JSON.parse(content);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, [path, content]);

  function handleContentChange(newContent: string) {
    setEditedContent(newContent);
  }

  function handleSave() {
    if (!path || !hasChanges) return;
    saveMutation.mutate(
      { path, content },
      {
        onSuccess: () => {
          toast.success("File saved");
          setEditedContent(null);
        },
        onError: (err) => {
          toast.error(`Save failed: ${err.message}`);
        },
      }
    );
  }

  function handleClose() {
    if (hasChanges) {
      if (!confirm("Discard unsaved changes?")) return;
    }
    setEditedContent(null);
    onClose();
  }

  const fileName = path ? getFileName(path) : "";
  const canSave = hasChanges && !jsonError && !saveMutation.isPending;

  return (
    <Dialog open={!!path} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">{fileName}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>Failed to load file: {error.message}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <div className="space-y-2">
            <Textarea
              className="min-h-[300px] font-mono text-sm"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="File content..."
            />
            {jsonError && (
              <Alert variant="destructive">
                <AlertDescription>JSON error: {jsonError}</AlertDescription>
              </Alert>
            )}
            <div className="text-xs text-muted-foreground">{path}</div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!canSave}>
            {saveMutation.isPending ? (
              <Spinner className="mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
