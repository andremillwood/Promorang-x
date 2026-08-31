import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, ExternalLink, Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getDiscoveryAdmin,
  getDiscoveryAnalytics,
  listDiscoveriesAdmin,
  upsertDiscoveryAdmin,
} from "@/lib/discovery-acquisition";
import { getSiteUrl } from "@/lib/discovery";
import { useI18n } from "@/i18n/I18nContext";

type ChoiceDraft = {
  id?: string;
  label: string;
  description?: string;
  imageUrl?: string;
  momentId?: string;
};

const emptyForm = () => ({
  id: "" as string,
  title: "",
  slug: "",
  eyebrow: "",
  description: "",
  coverImageUrl: "",
  discoveryType: "single_choice",
  maxSelections: 1,
  status: "draft",
  captureRequired: true,
  resultsVisibility: "after_capture",
  primaryNextAction: "express_interest",
  nextActionLabel: "Are you going?",
  nextActionDestination: "",
  nextActionPrompt: "Going?",
  rewardPoints: 10,
  shareCopyTemplate: "I chose {{choice}} 😂 What are you picking?",
  partnerLine: "",
  indexable: true,
  choices: [
    { label: "", imageUrl: "" },
    { label: "", imageUrl: "" },
  ] as ChoiceDraft[],
});

export function AdminDiscoveryAcquisitionTab() {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [mode, setMode] = useState<"list" | "edit" | "analytics">("list");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listDiscoveriesAdmin();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function openEdit(idOrSlug: string) {
    setError(null);
    setLoading(true);
    try {
      const data = await getDiscoveryAdmin(idOrSlug);
      const d = data.discovery;
      setForm({
        id: d.id,
        title: d.title || "",
        slug: d.slug || "",
        eyebrow: d.eyebrow || "",
        description: d.description || "",
        coverImageUrl: d.cover_image_url || "",
        discoveryType: d.discovery_type || "single_choice",
        maxSelections: d.max_selections || 1,
        status: d.status || "draft",
        captureRequired: d.capture_required !== false,
        resultsVisibility: d.results_visibility || "after_capture",
        primaryNextAction: d.primary_next_action || "express_interest",
        nextActionLabel: d.next_action_label || "",
        nextActionDestination: d.next_action_destination || "",
        nextActionPrompt: d.next_action_config?.prompt || "",
        rewardPoints: d.reward_points ?? 10,
        shareCopyTemplate: d.share_copy_template || "",
        partnerLine: d.partner_attribution?.attribution_line || "",
        indexable: d.indexable !== false,
        choices: (data.choices || []).map((c: any) => ({
          id: c.id,
          label: c.label,
          description: c.description || "",
          imageUrl: c.image_url || "",
          momentId: c.moment_id || "",
        })),
      });
      setMode("edit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open Discovery");
    } finally {
      setLoading(false);
    }
  }

  async function openAnalytics(id: string) {
    setError(null);
    setLoading(true);
    try {
      const data = await getDiscoveryAnalytics(id);
      setAnalytics(data);
      setMode("analytics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await upsertDiscoveryAdmin({
        id: form.id || undefined,
        title: form.title,
        slug: form.slug,
        eyebrow: form.eyebrow,
        description: form.description,
        coverImageUrl: form.coverImageUrl,
        discoveryType: form.discoveryType,
        maxSelections: form.maxSelections,
        status: form.status,
        captureRequired: form.captureRequired,
        resultsVisibility: form.resultsVisibility,
        primaryNextAction: form.primaryNextAction,
        nextActionLabel: form.nextActionLabel,
        nextActionDestination: form.nextActionDestination,
        nextActionConfig: {
          prompt: form.nextActionPrompt || form.nextActionLabel,
          options: [
            { value: "going", label: "I'm going" },
            { value: "maybe", label: "Maybe" },
            { value: "not_this_week", label: "Not this week" },
          ],
          going_routes_to_moment: true,
        },
        rewardPoints: form.rewardPoints,
        shareCopyTemplate: form.shareCopyTemplate,
        partnerAttribution: form.partnerLine ? { attribution_line: form.partnerLine } : {},
        indexable: form.indexable,
        choices: form.choices.filter((c) => c.label.trim()),
      });
      await refresh();
      setMode("list");
      setForm(emptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const site = getSiteUrl();

  if (mode === "analytics" && analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{analytics.discovery?.title}</h2>
            <p className="text-sm text-muted-foreground">/{analytics.discovery?.slug}</p>
          </div>
          <Button variant="outline" onClick={() => setMode("list")}>
            {t("discAcq.back")}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            [t("discAcq.visitors"), analytics.reach?.uniqueVisitors],
            [t("discAcq.votesLbl"), analytics.participation?.totalVotes],
            [t("discAcq.capturesLbl"), analytics.capture?.capturedParticipants],
            [t("discAcq.voteCapture"), `${analytics.capture?.voteToCaptureRate || 0}%`],
            [t("discAcq.shares"), analytics.sharing?.shareButtonClicks],
            [t("discAcq.refVisits"), analytics.sharing?.referredVisits],
            [t("discAcq.refVotes"), analytics.sharing?.referredVotes],
            [t("discAcq.refCaptures"), analytics.sharing?.referredCaptures],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-card p-3">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="text-xl font-semibold mt-1">{value ?? 0}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  t("discAcq.colSource"),
                  t("discAcq.colVisitors"),
                  t("discAcq.colVotes"),
                  t("discAcq.colCaptures"),
                  t("discAcq.colRate"),
                  t("discAcq.colRefs"),
                  t("discAcq.colIntent"),
                ].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(analytics.sourcePerformance || []).map((row: any) => (
                <tr key={row.source} className="border-t">
                  <td className="px-3 py-2">{row.source}</td>
                  <td className="px-3 py-2">{row.visitors}</td>
                  <td className="px-3 py-2">{row.votes}</td>
                  <td className="px-3 py-2">{row.captures}</td>
                  <td className="px-3 py-2">{row.captureRate}%</td>
                  <td className="px-3 py-2">{row.referrals}</td>
                  <td className="px-3 py-2">{row.intentActions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{form.id ? t("discAcq.editTitle") : t("discAcq.newTitle")}</h2>
          <Button variant="outline" onClick={() => { setMode("list"); setForm(emptyForm()); }}>
            {t("discAcq.cancel")}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid gap-3">
          <div>
            <Label>{t("discAcq.qTitle")}</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("discAcq.slug")}</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={t("discAcq.slugPh")} />
            </div>
            <div>
              <Label>{t("discAcq.status")}</Label>
              <select
                className="w-full h-10 rounded-md border px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["draft", "scheduled", "live", "closed", "archived"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>{t("discAcq.eyebrow")}</Label>
            <Input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
          </div>
          <div>
            <Label>{t("discAcq.desc")}</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>{t("discAcq.cover")}</Label>
            <Input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("discAcq.type")}</Label>
              <select
                className="w-full h-10 rounded-md border px-3 text-sm"
                value={form.discoveryType}
                onChange={(e) => setForm({ ...form, discoveryType: e.target.value })}
              >
                {["single_choice", "binary", "multi_select", "ranking", "nomination", "interest", "demand_signal"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("discAcq.maxSel")}</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={form.maxSelections}
                onChange={(e) => setForm({ ...form, maxSelections: Number(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("discAcq.rewardPts")}</Label>
              <Input
                type="number"
                value={form.rewardPoints}
                onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>{t("discAcq.resultsVis")}</Label>
              <select
                className="w-full h-10 rounded-md border px-3 text-sm"
                value={form.resultsVisibility}
                onChange={(e) => setForm({ ...form, resultsVisibility: e.target.value })}
              >
                {["after_capture", "after_vote", "public", "hidden"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>{t("discAcq.nextPrompt")}</Label>
            <Input value={form.nextActionPrompt} onChange={(e) => setForm({ ...form, nextActionPrompt: e.target.value })} />
          </div>
          <div>
            <Label>{t("discAcq.nextDest")}</Label>
            <Input value={form.nextActionDestination} onChange={(e) => setForm({ ...form, nextActionDestination: e.target.value })} placeholder={t("discAcq.destPh")} />
          </div>
          <div>
            <Label>{t("discAcq.partner")}</Label>
            <Input value={form.partnerLine} onChange={(e) => setForm({ ...form, partnerLine: e.target.value })} />
          </div>
          <div>
            <Label>{t("discAcq.shareTpl")}</Label>
            <Input value={form.shareCopyTemplate} onChange={(e) => setForm({ ...form, shareCopyTemplate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.captureRequired} onChange={(e) => setForm({ ...form, captureRequired: e.target.checked })} />
            {t("discAcq.captureReq")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.indexable} onChange={(e) => setForm({ ...form, indexable: e.target.checked })} />
            {t("discAcq.indexable")}
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("discAcq.choices")}</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={form.choices.length >= 8}
                onClick={() => setForm({ ...form, choices: [...form.choices, { label: "", imageUrl: "" }] })}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> {t("discAcq.add")}
              </Button>
            </div>
            {form.choices.map((choice, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-lg p-3">
                <Input
                  placeholder={t("discAcq.choicePh")}
                  value={choice.label}
                  onChange={(e) => {
                    const choices = [...form.choices];
                    choices[idx] = { ...choice, label: e.target.value };
                    setForm({ ...form, choices });
                  }}
                />
                <Input
                  placeholder={t("discAcq.imagePh")}
                  value={choice.imageUrl || ""}
                  onChange={(e) => {
                    const choices = [...form.choices];
                    choices[idx] = { ...choice, imageUrl: e.target.value };
                    setForm({ ...form, choices });
                  }}
                />
                <Input
                  placeholder={t("discAcq.momentPh")}
                  value={choice.momentId || ""}
                  onChange={(e) => {
                    const choices = [...form.choices];
                    choices[idx] = { ...choice, momentId: e.target.value };
                    setForm({ ...form, choices });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={form.choices.length <= 2}
                  onClick={() => setForm({ ...form, choices: form.choices.filter((_, i) => i !== idx) })}
                >
                  {t("discAcq.remove")}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={save} disabled={saving || !form.title}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {t("discAcq.save")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("discAcq.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("discAcq.copy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> {t("discAcq.refresh")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setForm(emptyForm());
              setMode("edit");
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> {t("discAcq.new")}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border divide-y">
          {list.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">{t("discAcq.empty")}</p>
          )}
          {list.map((row) => (
            <div key={row.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{row.title}</div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                  <span className="uppercase tracking-wide">{row.status}</span>
                  <span>·</span>
                  <span>/{row.slug}</span>
                  <span>·</span>
                  <span>{t("discAcq.votes", { n: row.total_votes || 0 })}</span>
                  <span>·</span>
                  <span>{t("discAcq.captures", { n: row.total_captures || 0 })}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/d/${row.slug}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> {t("discAcq.open")}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => openAnalytics(row.id)}>
                  <BarChart3 className="h-3.5 w-3.5 mr-1" /> {t("discAcq.analytics")}
                </Button>
                <Button size="sm" onClick={() => openEdit(row.id)}>
                  {t("discAcq.edit")}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground sm:hidden">
                {site}/d/{row.slug}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
