import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit2, X } from "lucide-react";

interface JsonEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function JsonEditor({ data, onChange }: JsonEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const displayText = useMemo(() => JSON.stringify(data, null, 2), [data]);

  function handleStartEdit() {
    setEditText(displayText);
    setIsEditing(true);
    setError(null);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setError(null);
  }

  function handleTextChange(newText: string) {
    setEditText(newText);
    try {
      const parsed = JSON.parse(newText);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        setError(null);
        onChange(parsed);
      } else {
        setError("Must be a JSON object");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleStartEdit}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
        <pre className="overflow-auto rounded-md border bg-muted p-4 font-mono text-sm">
          {displayText}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
          <X className="mr-2 h-4 w-4" />
          Cancel Edit
        </Button>
      </div>
      <Textarea
        className="min-h-[300px] font-mono text-sm"
        value={editText}
        onChange={(e) => handleTextChange(e.target.value)}
      />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>Parse error: {error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
