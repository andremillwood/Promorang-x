import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Bot,
  Terminal,
  ExternalLink,
  Code2
} from "lucide-react";
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

export default function DeveloperConsole() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: "key_demo_1",
      name: "Claude Desktop MCP Agent",
      maskedKey: "pk_live_a1b2...9f8e",
      scopes: ["feed:read", "coupons:claim", "campaigns:write"],
      environment: "production",
      createdAt: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Key creation state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"production" | "development">("production");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "feed:read",
    "coupons:claim"
  ]);

  // Newly generated key reveal state
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const availableScopes = [
    { id: "feed:read", label: "Read Feed & Promotions", desc: "Query active coupon drops, moments, and flash deals." },
    { id: "coupons:claim", label: "Claim Coupons & Actions", desc: "Execute claims and generate redemption receipts." },
    { id: "campaigns:read", label: "Read Campaign Analytics", desc: "Inspect campaign performance and participation." },
    { id: "campaigns:write", label: "Plan & Create Campaigns", desc: "Trigger AI Campaign Operator and publish drops." },
    { id: "merchants:read", label: "Merchant Live-Ops", desc: "View real-time budget, inventory, and menu items." }
  ];

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    setLoading(true);
    // Simulate generation
    setTimeout(() => {
      const prefix = newKeyEnv === "production" ? "pk_live_" : "pk_test_";
      const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const fullKey = `${prefix}${randomHex}`;
      const masked = `${fullKey.substring(0, 10)}...${fullKey.substring(fullKey.length - 4)}`;

      const newKeyItem: ApiKeyItem = {
        id: `key_${Date.now()}`,
        name: newKeyName.trim(),
        maskedKey: masked,
        scopes: selectedScopes,
        environment: newKeyEnv,
        createdAt: new Date().toISOString()
      };

      setKeys((prev) => [newKeyItem, ...prev]);
      setRevealedKey(fullKey);
      setCreateModalOpen(false);
      setNewKeyName("");
      setLoading(false);
      toast.success("API Key generated successfully");
    }, 400);
  };

  const handleRevokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success("API key revoked");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-24">
      <SEO
        title="Developer Console & API Keys | Promorang"
        description="Manage your Promorang Developer API keys, configure permission scopes, and connect AI Agents."
        type="website"
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/developers" className="text-sm text-muted-foreground hover:text-foreground">
                Developer Platform
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">Console</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">API Keys & Agent Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage authentication keys and permission scopes for third-party apps and AI agents.
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="rounded-xl gap-1.5 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Create New API Key
          </Button>
        </div>

        {/* Revealed Key Alert Dialog */}
        {revealedKey && (
          <Card className="bg-amber-500/10 border-amber-500/30 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-amber-200">Save your Secret API Key</h3>
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  This key will never be displayed again. Store it securely in your environment variables or password manager.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/60 p-3 rounded-lg border border-amber-500/20 font-mono text-xs text-amber-100">
              <span className="truncate flex-1">{revealedKey}</span>
              <Button size="sm" variant="outline" className="h-8 gap-1 border-amber-500/30" onClick={() => copyToClipboard(revealedKey)}>
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey ? "Copied" : "Copy"}
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="text-xs text-amber-300 hover:text-amber-100" onClick={() => setRevealedKey(null)}>
              I have safely stored my key
            </Button>
          </Card>
        )}

        {/* Active Keys Table */}
        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Active API Keys
            </CardTitle>
            <CardDescription>
              Keys configured with granular access permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {keys.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No active API keys found. Click "Create New API Key" above to generate one.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {keys.map((key) => (
                  <div key={key.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{key.name}</span>
                        <Badge variant={key.environment === "production" ? "default" : "secondary"} className="text-[10px] uppercase">
                          {key.environment}
                        </Badge>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                        <span>{key.maskedKey}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-[10px] font-mono border-border/60">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 h-8 gap-1 text-xs"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MCP Connect Card */}
        <Card className="border-border/60 bg-gradient-to-br from-card/60 via-charcoal/20 to-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-lg">Connect to Claude Desktop or Cursor</CardTitle>
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                Model Context Protocol
              </Badge>
            </div>
            <CardDescription>
              Copy this configuration into your Claude Desktop or Cursor MCP settings to enable autonomous Promorang tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <pre className="p-4 rounded-xl bg-black/80 border border-border/60 text-cyan-300 overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "promorang": {
      "command": "npx",
      "args": ["-y", "@promorang/mcp-server"],
      "env": {
        "PROMORANG_API_KEY": "${keys[0]?.maskedKey || 'pk_live_your_key_here'}",
        "PROMORANG_API_URL": "https://api.promorang.co/api/v1"
      }
    }
  }
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Create Key Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New Developer API Key</DialogTitle>
            <DialogDescription>
              Define the key name and choose specific permission scopes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name / Description</Label>
              <Input
                id="key-name"
                placeholder="e.g. Claude Desktop Agent, Telegram Bot, POS Integration"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permission Scopes</Label>
              <div className="space-y-2.5 border border-border/60 rounded-xl p-3 bg-muted/20">
                {availableScopes.map((scope) => (
                  <div key={scope.id} className="flex items-start space-x-2.5">
                    <Checkbox
                      id={scope.id}
                      checked={selectedScopes.includes(scope.id)}
                      onCheckedChange={() => handleScopeToggle(scope.id)}
                      className="mt-0.5"
                    />
                    <div className="grid gap-0.5 leading-none">
                      <label htmlFor={scope.id} className="text-xs font-semibold cursor-pointer">
                        {scope.label} <span className="font-mono text-muted-foreground font-normal">({scope.id})</span>
                      </label>
                      <p className="text-[11px] text-muted-foreground">{scope.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={loading}>
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
