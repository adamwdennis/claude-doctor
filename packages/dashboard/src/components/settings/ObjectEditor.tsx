import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { ArrayEditor } from "./ArrayEditor";
import { useState } from "react";

interface ObjectEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  path: string;
}

export function ObjectEditor({ data, onChange, path }: ObjectEditorProps) {
  const [newKey, setNewKey] = useState("");

  function handleValueChange(key: string, value: unknown) {
    onChange({ ...data, [key]: value });
  }

  function handleRemoveKey(key: string) {
    const newData = { ...data };
    delete newData[key];
    onChange(newData);
  }

  function handleAddKey() {
    if (newKey && !(newKey in data)) {
      onChange({ ...data, [newKey]: "" });
      setNewKey("");
    }
  }

  const entries = Object.entries(data);

  return (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <div className="text-sm text-muted-foreground">No properties</div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {entries.map(([key, value]) => {
            const fullPath = path ? `${path}.${key}` : key;
            const valueType = getValueType(value);

            if (valueType === "object") {
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-mono">{key}</span>
                      <span className="text-muted-foreground">
                        ({Object.keys(value as object).length} keys)
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-4 border-l pl-4">
                      <ObjectEditor
                        data={value as Record<string, unknown>}
                        onChange={(newValue) =>
                          handleValueChange(key, newValue)
                        }
                        path={fullPath}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive"
                        onClick={() => handleRemoveKey(key)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Remove {key}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            if (valueType === "array") {
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-mono">{key}</span>
                      <span className="text-muted-foreground">
                        ({(value as unknown[]).length} items)
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-4 border-l pl-4">
                      <ArrayEditor
                        data={value as unknown[]}
                        onChange={(newValue) =>
                          handleValueChange(key, newValue)
                        }
                        path={fullPath}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive"
                        onClick={() => handleRemoveKey(key)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Remove {key}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            return (
              <div key={key} className="flex items-center gap-2 py-2">
                <span className="min-w-32 font-mono text-sm">{key}</span>
                {valueType === "boolean" ? (
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) =>
                      handleValueChange(key, checked)
                    }
                  />
                ) : (
                  <Input
                    className="flex-1"
                    type={valueType === "number" ? "number" : "text"}
                    value={String(value ?? "")}
                    onChange={(e) =>
                      handleValueChange(
                        key,
                        valueType === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleRemoveKey(key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </Accordion>
      )}
      <div className="flex items-center gap-2 pt-2">
        <Input
          placeholder="New key name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddKey()}
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={handleAddKey}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

function getValueType(
  value: unknown
): "string" | "number" | "boolean" | "object" | "array" | "null" {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "string";
}
