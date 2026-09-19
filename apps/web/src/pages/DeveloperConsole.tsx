import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check, Copy, Key, Bot, Plus, ShieldAlert, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyItem {
  id: string;
  name: string;
  maskedKey: string;
  scopes: string[];
  environment: string;
  createdAt: string;
  lastUsedAt?: string;
}

type ApiKeyRecord = {
  id: string;
  name: string;
  masked_key?: string;
  maskedKey?: string;
  scopes?: string[];
  environment?: string;
  created_at?: string;
  createdAt?: string;
  last_used_at?: string | null;
  lastUsedAt?: string | null;
  apiKey?: string;
};

function normalizeKey(record: ApiKeyRecord): ApiKeyItem {
  return {
    id: String(record.id),
    name: record.name,
    maskedKey: record.masked_key || record.maskedKey || "Unavailable",
    scopes: Array.isArray(record.scopes) ? record.scopes : [],
    environment: record.environment || "production",
    createdAt: record.created_at || record.createdAt || "",
    lastUsedAt: record.last_used_at || record.lastUsedAt || undefined,
  };
}

async function readError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}));
  return payload?.error || fallback;
}

export default function DeveloperConsole() {
  const { session } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["feed:read", "coupons:claim"]);
  const [creatingKey, setCreatingKey] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const availableScopes = [
    { id: "feed:read", label: "Read Feed & Promotions", desc: "Query active coupon drops, moments, and flash deals." },
    { id: "coupons:claim", label: "Claim Coupons & Actions", desc: "Execute claims and generate redemption receipts." },
    { id: "campaigns:read", label: "Read Campaign Analytics", desc: "Inspect campaign performance and participation." },
    { id: "campaigns:write", label: "Plan & Create Campaigns", desc: "Create and manage supported campaign records." },
    { id: "merchants:read", label: "Merchant Live-Ops", desc: "View supported merchant inventory and operations." },
  ];

  const loadKeys = async () => {
    if (!session?.access_token) {
      setKeys([]);
      setSourceError(null);
      setLoadingKeys(false);
      return;
    }

    setLoadingKeys(true);
    setSourceError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/keys`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Developer key source unavailable"));
      }

      const payload = await response.json();
      setKeys((payload?.data || []).map((record: ApiKeyRecord) => normalizeKey(record)));
    } catch (error) {
      setKeys([]);
      setSourceError(error instanceof Error ? error.message : "Developer key source unavailable");
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [session?.access_token]);

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((current) =>
      current.includes(scopeId) ? current.filter((scope) => scope !== scopeId) : [...current, scopeId]
    );
  };

  const handleCreateKey = async () => {
    if (!session?.access_token) {
      toast.error("Sign in before creating a developer API key");
      return;
    }
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    if (!selectedScopes.length) {
      toast.error("Choose at least one permission scope");
      return;
    }

    setCreatingKey(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: selectedScopes,
          environment: "production",
        }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "API key creation failed"));
      }

      const payload = await response.json();
      const record = payload?.data as ApiKeyRecord | undefined;
      if (!record?.id || !record?.apiKey) {
        throw new Error("API key source returned an incomplete credential");
      }

      setKeys((current) => [normalizeKey(record), ...current.filter((key) => key.id !== record.id)]);
      setRevealedKey(record.apiKey);
      setCreateModalOpen(false);
      setNewKeyName("");
      toast.success("API key created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "API key creation failed");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!session?.access_token) return;

    setRevokingKeyId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/keys/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(await readError(response, "API key revocation failed"));
      }

      setKeys((current) => current.filter((key) => key.id !== id));
      toast.success("API key revoked");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "API key revocation failed");
    } finally {
      setRevokingKeyId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-24 text-foreground">
      <SEO
        title="Developer Console & API Keys | Promorang"
        description="Manage recorded Promorang Developer API keys and scoped access for external integrations."
        type="website"
      />

      <div className="container mx-auto max-w-5xl space-y-8 px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Link to="/developers" className="text-sm text-muted-foreground hover:text-foreground">
                Developer Platform
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">Console</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">API Keys & Agent Integrations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, review, and revoke credentials that actually exist in your account.
            </p>
          </div>
          {session?.access_token ? (
            <Button onClick={() => setCreateModalOpen(true)} className="self-start rounded-xl sm:self-auto">
              <Plus className="mr-1.5 h-4 w-4" />
              Create API Key
            </Button>
          ) : (
            <Button asChild className="self-start rounded-xl sm:self-auto">
              <Link to="/auth?next=/developers/console">Sign in to manage keys</Link>
            </Button>
          )}
        </div>

        {revealedKey && (
          <Card className="space-y-4 border-amber-500/30 bg-amber-500/10 p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" />
              <div className="space-y-1">
                <h3 className="font-semibold text-amber-200">Save your secret API key now</h3>
                <p className="text-xs leading-relaxed text-amber-300/80">
                  This plaintext credential came from the server and is shown once. Store it securely; the console keeps only its masked record.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-black/60 p-3 font-mono text-xs text-amber-100">
              <span className="min-w-0 flex-1 truncate">{revealedKey}</span>
              <Button size="sm" variant="outline" className="h-8 border-amber-500/30" onClick={() => copyToClipboard(revealedKey)}>
                {copiedKey ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                {copiedKey ? "Copied" : "Copy"}
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="text-xs text-amber-300 hover:text-amber-100" onClick={() => setRevealedKey(null)}>
              I have stored this key
            </Button>
          </Card>
        )}

        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Key className="h-4 w-4 text-primary" />
              Active API Keys
            </CardTitle>
            <CardDescription>Only credentials returned by the authenticated key source appear here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!session?.access_token ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Sign in to read your developer key records. No demo credential is substituted while signed out.
              </div>
            ) : loadingKeys ? (
              <div className="space-y-3 py-4">
                {[0, 1].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted/40" />)}
              </div>
            ) : sourceError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="font-semibold text-foreground">Developer key source unavailable</p>
                <p className="mt-1 text-sm text-muted-foreground">{sourceError}</p>
                <Button type="button" variant="outline" className="mt-4" onClick={loadKeys}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retry key source
                </Button>
              </div>
            ) : keys.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No active API keys are recorded for this account.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {keys.map((key) => (
                  <div key={key.id} className="flex flex-col justify-between gap-4 py-4 md:flex-row md:items-center">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{key.name}</span>
                        <Badge variant={key.environment === "production" ? "default" : "secondary"} className="text-[10px] uppercase">
                          {key.environment}
                        </Badge>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">{key.maskedKey}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="border-border/60 font-mono text-[10px]">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Created {key.createdAt ? new Date(key.createdAt).toLocaleString() : "date unavailable"}
                        {key.lastUsedAt ? ` · Last used ${new Date(key.lastUsedAt).toLocaleString()}` : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="self-end text-xs text-destructive hover:bg-destructive/10 md:self-auto"
                      onClick={() => handleRevokeKey(key.id)}
                      disabled={revokingKeyId === key.id}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      {revokingKeyId === key.id ? "Revoking…" : "Revoke"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card/60 via-charcoal/20 to-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-lg">MCP configuration</CardTitle>
            </div>
            <CardDescription>
              Use the plaintext secret shown once after successful creation. A masked key from the list is not a usable credential.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <pre className="overflow-x-auto rounded-xl border border-border/60 bg-black/80 p-4 leading-relaxed text-cyan-300">
{`{
  "mcpServers": {
    "promorang": {
      "command": "npx",
      "args": ["-y", "@promorang/mcp-server"],
      "env": {
        "PROMORANG_API_KEY": "pk_live_your_secret_key_here",
        "PROMORANG_API_URL": "https://api.promorang.co/api/v1"
      }
    }
  }
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Developer API Key</DialogTitle>
            <DialogDescription>
              The server will create the credential and store only its hash. The plaintext secret is returned once after the write succeeds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Claude Desktop Agent"
                value={newKeyName}
                onChange={(event) => setNewKeyName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permission scopes</Label>
              <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
                {availableScopes.map((scope) => (
                  <div key={scope.id} className="flex items-start space-x-2.5">
                    <Checkbox
                      id={scope.id}
                      checked={selectedScopes.includes(scope.id)}
                      onCheckedChange={() => handleScopeToggle(scope.id)}
                      className="mt-0.5"
                    />
                    <div className="grid gap-0.5 leading-none">
                      <label htmlFor={scope.id} className="cursor-pointer text-xs font-semibold">
                        {scope.label} <span className="font-mono font-normal text-muted-foreground">({scope.id})</span>
                      </label>
                      <p className="text-[11px] text-muted-foreground">{scope.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateKey} disabled={creatingKey}>
              {creatingKey ? "Creating…" : "Create key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
