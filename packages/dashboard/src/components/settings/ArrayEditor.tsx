import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ArrayEditorProps {
  data: unknown[];
  onChange: (data: unknown[]) => void;
  path: string;
}

export function ArrayEditor({ data, onChange }: ArrayEditorProps) {
  function handleItemChange(index: number, value: unknown) {
    const newData = [...data];
    newData[index] = value;
    onChange(newData);
  }

  function handleRemoveItem(index: number) {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  }

  function handleAddItem() {
    onChange([...data, ""]);
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
            <span className="min-w-8 text-sm text-muted-foreground">
              [{index}]
            </span>
            {typeof item === "object" && item !== null ? (
              <div className="flex-1 rounded border bg-muted/50 p-2 font-mono text-xs">
                {JSON.stringify(item)}
              </div>
            ) : (
              <Input
                className="flex-1"
                value={String(item ?? "")}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => handleRemoveItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button variant="outline" size="sm" onClick={handleAddItem}>
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
}
