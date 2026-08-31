import { useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, Plus, RefreshCw, Save, ShieldCheck, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/I18nContext";

type AccessRule = {
  id: string;
  object_type: string;
  object_id: string;
  access_type: string;
  base_key_cost: number;
  min_tier_key: string | null;
  requires_cash_gem_eligible: boolean;
  capacity_limit: number | null;
  sponsor_subsidy_keys: number;
  pricing_config: {
    scarcity_cost?: number;
    reward_value_cost?: number;
    demand_cost?: number;
  };
  metadata?: Record<string, unknown>;
  is_active: boolean;
  updated_at: string;
};

type AccessRulePreset = Omit<AccessRule, "id" | "object_id" | "capacity_limit" | "is_active" | "updated_at"> & {
  preset_key: string;
  display_name: string;
};

type FormState = {
  id?: string;
  object_type: string;
  object_id: string;
  access_type: string;
  base_key_cost: string;
  min_tier_key: string;
  requires_cash_gem_eligible: boolean;
  capacity_limit: string;
  sponsor_subsidy_keys: string;
  scarcity_cost: string;
  reward_value_cost: string;
  demand_cost: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  object_type: "moment",
  object_id: "",
  access_type: "join",
  base_key_cost: "0",
  min_tier_key: "none",
  requires_cash_gem_eligible: false,
  capacity_limit: "",
  sponsor_subsidy_keys: "0",
  scarcity_cost: "0",
  reward_value_cost: "0",
  demand_cost: "0",
  is_active: true,
};

const objectTypes = ["moment", "drop", "reward", "campaign", "promoshare_pool", "event", "content", "offer"];
const accessTypes = ["view", "join", "apply", "redeem", "boost", "reserve", "check_in", "claim"];
const tierKeys = ["none", "free", "plus", "pro", "elite"];

function toForm(rule: AccessRule): FormState {
  return {
    id: rule.id,
    object_type: rule.object_type,
    object_id: rule.object_id,
    access_type: rule.access_type,
    base_key_cost: String(rule.base_key_cost ?? 0),
    min_tier_key: rule.min_tier_key || "none",
    requires_cash_gem_eligible: Boolean(rule.requires_cash_gem_eligible),
    capacity_limit: rule.capacity_limit == null ? "" : String(rule.capacity_limit),
    sponsor_subsidy_keys: String(rule.sponsor_subsidy_keys ?? 0),
    scarcity_cost: String(rule.pricing_config?.scarcity_cost ?? 0),
    reward_value_cost: String(rule.pricing_config?.reward_value_cost ?? 0),
    demand_cost: String(rule.pricing_config?.demand_cost ?? 0),
    is_active: Boolean(rule.is_active),
  };
}

function presetToForm(preset: AccessRulePreset, currentObjectId: string): FormState {
  return {
    ...emptyForm,
    object_type: preset.object_type,
    object_id: currentObjectId,
    access_type: preset.access_type,
    base_key_cost: String(preset.base_key_cost ?? 0),
    min_tier_key: preset.min_tier_key || "none",
    requires_cash_gem_eligible: Boolean(preset.requires_cash_gem_eligible),
    sponsor_subsidy_keys: String(preset.sponsor_subsidy_keys ?? 0),
    scarcity_cost: String(preset.pricing_config?.scarcity_cost ?? 0),
    reward_value_cost: String(preset.pricing_config?.reward_value_cost ?? 0),
    demand_cost: String(preset.pricing_config?.demand_cost ?? 0),
  };
}

function formPayload(form: FormState) {
  return {
    object_type: form.object_type,
    object_id: form.object_id,
    access_type: form.access_type,
    base_key_cost: Number(form.base_key_cost || 0),
    min_tier_key: form.min_tier_key === "none" ? null : form.min_tier_key,
    requires_cash_gem_eligible: form.requires_cash_gem_eligible,
    capacity_limit: form.capacity_limit ? Number(form.capacity_limit) : null,
    sponsor_subsidy_keys: Number(form.sponsor_subsidy_keys || 0),
    pricing_config: {
      scarcity_cost: Number(form.scarcity_cost || 0),
      reward_value_cost: Number(form.reward_value_cost || 0),
      demand_cost: Number(form.demand_cost || 0),
    },
    is_active: form.is_active,
  };
}

export function AdminAccessRulesTab() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [presets, setPresets] = useState<AccessRulePreset[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${session?.access_token || ""}`,
      "Content-Type": "application/json",
    }),
    [session?.access_token],
  );

  async function fetchRules() {
    if (!session?.access_token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/access-rules`, { headers });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to load access rules");
      setRules(payload.rules || []);
      setPresets(payload.presets || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load access rules");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchRules();
  }, [session?.access_token]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(presetKey: string) {
    setSelectedPreset(presetKey);
    const preset = presets.find((item) => item.preset_key === presetKey);
    if (!preset) return;
    setForm(presetToForm(preset, form.object_id));
  }

  async function saveRule() {
    if (!form.object_id.trim()) {
      toast({ title: t("accRule.needId"), variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        form.id ? `${API_BASE_URL}/admin/access-rules/${form.id}` : `${API_BASE_URL}/admin/access-rules`,
        {
          method: form.id ? "PATCH" : "POST",
          headers,
          body: JSON.stringify(formPayload(form)),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to save access rule");
      toast({ title: t("accRule.toastSaved") });
      setForm(emptyForm);
      setSelectedPreset("");
      await fetchRules();
    } catch (saveError) {
      toast({
        title: t("accRule.toastFail"),
        description: saveError instanceof Error ? saveError.message : "Failed to save access rule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deactivateRule(ruleId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/access-rules/${ruleId}/deactivate`, {
        method: "POST",
        headers,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to deactivate rule");
      toast({ title: t("accRule.toastDeact") });
      await fetchRules();
    } catch (deactivateError) {
      toast({
        title: t("accRule.toastDeactFail"),
        description: deactivateError instanceof Error ? deactivateError.message : "Failed to deactivate rule",
        variant: "destructive",
      });
    }
  }

  const effectiveCost = Math.max(
    0,
    Number(form.base_key_cost || 0)
      + Number(form.scarcity_cost || 0)
      + Number(form.reward_value_cost || 0)
      + Number(form.demand_cost || 0)
      - Number(form.sponsor_subsidy_keys || 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("accRule.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("accRule.copy")}</p>
        </div>
        <Button variant="outline" onClick={() => fetchRules()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {t("accRule.refresh")}
        </Button>
      </div>

      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-primary" />
              {t("accRule.editor")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("accRule.preset")}</Label>
              <Select value={selectedPreset} onValueChange={applyPreset}>
                <SelectTrigger>
                  <SelectValue placeholder={t("accRule.presetPh")} />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.preset_key} value={preset.preset_key}>
                      {preset.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("accRule.objectType")}</Label>
                <Select value={form.object_type} onValueChange={(value) => updateForm("object_type", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {objectTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("accRule.accessType")}</Label>
                <Select value={form.access_type} onValueChange={(value) => updateForm("access_type", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {accessTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("accRule.objectId")}</Label>
              <Input value={form.object_id} onChange={(event) => updateForm("object_id", event.target.value)} placeholder={t("accRule.objectIdPh")} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("accRule.baseKeys")}</Label>
                <Input type="number" min="0" value={form.base_key_cost} onChange={(event) => updateForm("base_key_cost", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("accRule.minTier")}</Label>
                <Select value={form.min_tier_key} onValueChange={(value) => updateForm("min_tier_key", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tierKeys.map((tier) => <SelectItem key={tier} value={tier}>{tier}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("accRule.scarcity")}</Label>
                <Input type="number" min="0" value={form.scarcity_cost} onChange={(event) => updateForm("scarcity_cost", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("accRule.rewardVal")}</Label>
                <Input type="number" min="0" value={form.reward_value_cost} onChange={(event) => updateForm("reward_value_cost", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("accRule.demand")}</Label>
                <Input type="number" min="0" value={form.demand_cost} onChange={(event) => updateForm("demand_cost", event.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("accRule.subsidy")}</Label>
                <Input type="number" min="0" value={form.sponsor_subsidy_keys} onChange={(event) => updateForm("sponsor_subsidy_keys", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("accRule.capacity")}</Label>
                <Input type="number" min="0" value={form.capacity_limit} onChange={(event) => updateForm("capacity_limit", event.target.value)} placeholder={t("accRule.noLimit")} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-lg border p-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.requires_cash_gem_eligible} onCheckedChange={(checked) => updateForm("requires_cash_gem_eligible", checked === true)} />
                {t("accRule.cashGem")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.is_active} onCheckedChange={(checked) => updateForm("is_active", checked === true)} />
                {t("accRule.active")}
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <span className="text-sm text-muted-foreground">{t("accRule.rawCost")}</span>
              <Badge variant="secondary">{t("accRule.rawBadge", { n: effectiveCost })}</Badge>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveRule} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t("accRule.save")}
              </Button>
              <Button variant="outline" onClick={() => { setForm(emptyForm); setSelectedPreset(""); }}>
                <Plus className="mr-2 h-4 w-4" />
                {t("accRule.new")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {t("accRule.activeSet")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-lg" />)}
              </div>
            ) : rules.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{t("accRule.empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2 pr-3">{t("accRule.colTarget")}</th>
                      <th className="py-2 pr-3">{t("accRule.colAction")}</th>
                      <th className="py-2 pr-3">{t("accRule.colRaw")}</th>
                      <th className="py-2 pr-3">{t("accRule.colTier")}</th>
                      <th className="py-2 pr-3">{t("accRule.colCap")}</th>
                      <th className="py-2 pr-3">{t("accRule.colStatus")}</th>
                      <th className="py-2 text-right">{t("accRule.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => {
                      const rawCost = Math.max(
                        0,
                        Number(rule.base_key_cost || 0)
                          + Number(rule.pricing_config?.scarcity_cost || 0)
                          + Number(rule.pricing_config?.reward_value_cost || 0)
                          + Number(rule.pricing_config?.demand_cost || 0)
                          - Number(rule.sponsor_subsidy_keys || 0),
                      );

                      return (
                        <tr key={rule.id} className="border-b last:border-0">
                          <td className="py-3 pr-3">
                            <div className="font-medium">{rule.object_type}</div>
                            <div className="max-w-[220px] truncate text-xs text-muted-foreground">{rule.object_id}</div>
                          </td>
                          <td className="py-3 pr-3">{rule.access_type}</td>
                          <td className="py-3 pr-3">{t("accRule.keys", { n: rawCost })}</td>
                          <td className="py-3 pr-3">{rule.min_tier_key || t("accRule.none")}</td>
                          <td className="py-3 pr-3">{rule.capacity_limit ?? t("accRule.none")}</td>
                          <td className="py-3 pr-3">
                            <Badge variant={rule.is_active ? "default" : "secondary"}>{rule.is_active ? t("accRule.stActive") : t("accRule.stInactive")}</Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setForm(toForm(rule))}>{t("accRule.edit")}</Button>
                              {rule.is_active ? (
                                <Button variant="ghost" size="icon" onClick={() => deactivateRule(rule.id)}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminAccessRulesTab;
