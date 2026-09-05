"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Loader2, Save } from "lucide-react";
import { saveIntegrationTokenAction, testIntegrationConnectionAction } from "@/features/settings/actions";
import { toast } from "sonner";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isConfigured: boolean;
  connected: boolean;
  accessToken?: string | null;
  syncStatus: string;
  lastSyncedAt: Date | null;
  syncError: string | null;
}

interface IntegrationsContentProps {
  integrations: IntegrationItem[];
}

export function IntegrationsContent({ integrations }: IntegrationsContentProps) {
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    try {
      const res = await testIntegrationConnectionAction(providerId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to test connection");
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveToken = async (providerId: string) => {
    if (!tokenInput.trim()) {
      toast.error("Please enter a valid API key / token");
      return;
    }
    setSaving(true);
    try {
      const res = await saveIntegrationTokenAction(providerId, tokenInput.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Successfully connected ${providerId.toUpperCase()} API key!`);
        setEditingProvider(null);
        setTokenInput("");
      }
    } catch {
      toast.error("Failed to save integration key");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-3">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Plug className="w-5 h-5 text-emerald-500" /> External App & Mobile Integrations
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage API keys for Todoist, Habitica, USDA Food Database, and WGER Exercise DB.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((item) => (
          <Card key={item.id} className="p-4 flex flex-col justify-between border-border bg-card shadow-xs space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plug className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-base">{item.name}</span>
                </div>
                <Badge variant={item.connected ? "default" : "secondary"} className={`text-[10px] ${item.connected ? "bg-emerald-600 text-white" : ""}`}>
                  {item.connected ? "Connected" : item.isConfigured ? "Composio Ready" : "Disconnected"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">{item.description}</p>

              {item.accessToken && (
                <div className="px-2.5 py-1 rounded bg-muted/60 text-[11px] font-mono text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-emerald-400" /> Active Token: {item.accessToken}
                </div>
              )}
            </div>

            {editingProvider === item.id ? (
              <div className="space-y-2 pt-2 border-t">
                <input
                  type="password"
                  placeholder={`Enter ${item.name} API Key...`}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-border bg-background"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={saving}
                    onClick={() => handleSaveToken(item.id)}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save API Key
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingProvider(null);
                      setTokenInput("");
                    }}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {item.connected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  {item.connected ? "Active & Syncing" : "Not Configured"}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 gap-1"
                    onClick={() => setEditingProvider(item.id)}
                  >
                    <KeyRound className="w-3 h-3 text-emerald-500" /> {item.connected ? "Edit Key" : "Add Key"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={testingId === item.id}
                    className="text-xs h-7 gap-1 text-muted-foreground"
                    onClick={() => handleTestConnection(item.id)}
                  >
                    {testingId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Test
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
