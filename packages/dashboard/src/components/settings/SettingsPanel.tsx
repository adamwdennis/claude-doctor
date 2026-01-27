import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { Spinner } from "@/components/ui/spinner";
import { JsonEditor } from "./JsonEditor";
import { SettingsFormTab } from "./SettingsFormTab";
import { EffectiveConfigPanel } from "./EffectiveConfigPanel";
import { Save, RotateCcw } from "lucide-react";

interface SettingsPanelProps {
  layer: string;
  title: string;
}

export function SettingsPanel({ layer, title }: SettingsPanelProps) {
  const { data, isLoading, error, save, isSaving } = useSettings(layer);
  const [localData, setLocalData] = useState<Record<string, unknown> | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("form");

  const currentData = localData ?? data?.data ?? {};

  function handleChange(newData: Record<string, unknown>) {
    setLocalData(newData);
  }

  function handleSave() {
    if (localData) {
      save(localData);
      setLocalData(null);
    }
  }

  function handleReset() {
    setLocalData(null);
  }

  const hasChanges = localData !== null;

  if (isLoading) {
    return <CardLoader />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load settings: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset} aria-label="Reset changes">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            aria-label="Save settings"
          >
            {isSaving ? (
              <Spinner className="mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="effective">Effective</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-4">
            <SettingsFormTab data={currentData} onChange={handleChange} />
          </TabsContent>
          <TabsContent value="json" className="mt-4">
            <JsonEditor data={currentData} onChange={handleChange} />
          </TabsContent>
          <TabsContent value="effective" className="mt-4">
            <EffectiveConfigPanel />
          </TabsContent>
        </Tabs>
        {data?.path && (
          <div className="mt-4 text-xs text-muted-foreground">
            Path: {data.path}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
