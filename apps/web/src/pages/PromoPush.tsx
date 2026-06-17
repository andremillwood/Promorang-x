import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Copy,
  Crosshair,
  Download,
  Link2,
  MapPin,
  Megaphone,
  MousePointerClick,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  PromoPushCampaign,
  useCreatePromoPushCampaign,
  usePromoPushCampaigns,
  usePromoPushMoments,
} from "@/hooks/usePromoPush";
import { cn } from "@/lib/utils";

const defaultForm = {
  title: "",
  linked_moment_id: "",
  geo_label: "",
  geo_center_lat: "18.0179",
  geo_center_lng: "-76.8099",
  geo_radius_meters: "1500",
  start_time: "",
  end_time: "",
  budget: "",
  creator_verified_action_jmd: "250",
  proof_verified_reward: "Reward after verified proof only",
  request_creative_support: false,
};

function sumMetric(campaigns: PromoPushCampaign[], metric: keyof NonNullable<PromoPushCampaign["channels"]>[number]["metrics"]) {
  return campaigns.reduce((campaignTotal, campaign) => {
    return campaignTotal + (campaign.channels || []).reduce((channelTotal, channel) => {
      return channelTotal + Number(channel.metrics?.[metric] || 0);
    }, 0);
  }, 0);
}

function downloadQr(channelLabel: string, code: string) {
  const svg = document.getElementById(`qr-${code}`);
  if (!svg) return;
  const serializer = new XMLSerializer();
  const blob = new Blob([serializer.serializeToString(svg)], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${channelLabel.toLowerCase().replace(/\s+/g, "-")}-${code}.svg`;
  link.click();
  URL.revokeObjectURL(link.href);
}

const metricCards = [
  { label: "Clicks / Scans", key: "clicks", icon: MousePointerClick },
  { label: "Moment Joins", key: "joins", icon: Users },
  { label: "Moves Completed", key: "moves_completed", icon: CheckCircle2 },
  { label: "Proof Verified", key: "proof_verified", icon: ShieldCheck },
] as const;

export default function PromoPush() {
  const campaignsQuery = usePromoPushCampaigns();
  const momentsQuery = usePromoPushMoments();
  const createCampaign = useCreatePromoPushCampaign();
  const [form, setForm] = useState(defaultForm);

  const campaigns = campaignsQuery.data || [];
  const selectedMoment = momentsQuery.data?.find((moment) => moment.id === form.linked_moment_id);

  const totals = useMemo(() => ({
    clicks: sumMetric(campaigns, "clicks"),
    joins: sumMetric(campaigns, "joins"),
    moves_completed: sumMetric(campaigns, "moves_completed"),
    proof_verified: sumMetric(campaigns, "proof_verified"),
    rewards_issued: sumMetric(campaigns, "rewards_issued"),
  }), [campaigns]);

  const updateForm = (key: keyof typeof defaultForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createCampaign.mutateAsync({
      title: form.title,
      linked_moment_id: form.linked_moment_id,
      geo_label: form.geo_label,
      geo_center_lat: Number(form.geo_center_lat),
      geo_center_lng: Number(form.geo_center_lng),
      geo_radius_meters: Number(form.geo_radius_meters),
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      budget: form.budget ? Number(form.budget) : null,
      request_creative_support: form.request_creative_support,
      reward_rules: {
        creator_verified_action_jmd: Number(form.creator_verified_action_jmd || 0),
        proof_verified_reward: form.proof_verified_reward,
      },
      status: "active",
    });
    setForm(defaultForm);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC300]">
              <Megaphone className="h-3.5 w-3.5" />
              PromoPush
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Geo-distribution into verified action</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
              QR, Meta, creator, direct, and street traffic all route to one Moment loop: join, execute the Move, submit Proof, then release the Reward.
            </p>
          </div>
          <Button asChild className="bg-[#FF6A00] text-white hover:bg-[#e65f00]">
            <Link to="/promopush/promoter">
              <QrCode className="mr-2 h-4 w-4" />
              Promoter Portal
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((metric) => (
            <Card key={metric.key} className="border-white/10 bg-white/[0.04] text-white">
              <CardContent className="p-4">
                <metric.icon className="mb-3 h-5 w-5 text-[#FF6A00]" />
                <p className="text-2xl font-black">{totals[metric.key].toLocaleString()}</p>
                <p className="text-xs font-medium text-white/55">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-[#FFC300]/30 bg-[#FFC300]/10 text-white">
            <CardContent className="p-4">
              <BadgeDollarSign className="mb-3 h-5 w-5 text-[#FFC300]" />
              <p className="text-2xl font-black">{totals.rewards_issued.toLocaleString()}</p>
              <p className="text-xs font-medium text-[#FFC300]/80">Rewards Issued</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="create" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 sm:w-[420px]">
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
            <TabsTrigger value="track">Track Channels</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <Card className="border-white/10 bg-white/[0.04] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-[#FF6A00]" />
                    Campaign Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="title">Campaign title</Label>
                    <Input id="title" required value={form.title} onChange={(e) => updateForm("title", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Linked Moment</Label>
                    <Select required value={form.linked_moment_id} onValueChange={(value) => updateForm("linked_moment_id", value)}>
                      <SelectTrigger className="mt-2 bg-black/40">
                        <SelectValue placeholder="Select the Moment all traffic enters" />
                      </SelectTrigger>
                      <SelectContent>
                        {(momentsQuery.data || []).map((moment) => (
                          <SelectItem key={moment.id} value={moment.id}>{moment.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="geo_label">Location label</Label>
                    <Input id="geo_label" required value={form.geo_label} onChange={(e) => updateForm("geo_label", e.target.value)} className="mt-2 bg-black/40" placeholder="Half Way Tree, Kingston" />
                  </div>
                  <div>
                    <Label htmlFor="radius">Radius meters</Label>
                    <Input id="radius" type="number" min="1" required value={form.geo_radius_meters} onChange={(e) => updateForm("geo_radius_meters", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input id="lat" type="number" step="0.0000001" required value={form.geo_center_lat} onChange={(e) => updateForm("geo_center_lat", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <Input id="lng" type="number" step="0.0000001" required value={form.geo_center_lng} onChange={(e) => updateForm("geo_center_lng", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div>
                    <Label htmlFor="start">Start time</Label>
                    <Input id="start" type="datetime-local" required value={form.start_time} onChange={(e) => updateForm("start_time", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div>
                    <Label htmlFor="end">End time</Label>
                    <Input id="end" type="datetime-local" required value={form.end_time} onChange={(e) => updateForm("end_time", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div>
                    <Label htmlFor="budget">Ad budget optional</Label>
                    <Input id="budget" type="number" min="0" value={form.budget} onChange={(e) => updateForm("budget", e.target.value)} className="mt-2 bg-black/40" placeholder="JMD" />
                  </div>
                  <div>
                    <Label htmlFor="creator_reward">Creator verified action payout</Label>
                    <Input id="creator_reward" type="number" min="0" value={form.creator_verified_action_jmd} onChange={(e) => updateForm("creator_verified_action_jmd", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="rules">Reward rule</Label>
                    <Textarea id="rules" value={form.proof_verified_reward} onChange={(e) => updateForm("proof_verified_reward", e.target.value)} className="mt-2 bg-black/40" />
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Checkbox id="creative" checked={form.request_creative_support} onCheckedChange={(value) => updateForm("request_creative_support", value === true)} />
                    <Label htmlFor="creative" className="text-sm text-white/80">Request creative support for flyer design, QR layout, and ad creatives</Label>
                  </div>
                  <Button disabled={createCampaign.isPending} className="sm:col-span-2 bg-[#FF6A00] text-white hover:bg-[#e65f00]">
                    {createCampaign.isPending ? "Creating..." : "Generate tracked channels"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.04] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crosshair className="h-5 w-5 text-[#FFC300]" />
                    V1 Guardrails
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-white/70">
                  {[
                    "No campaign launches without a linked Moment.",
                    "Every channel receives a unique tracking link.",
                    "All links resolve to the Moment entry endpoint.",
                    "Geo validation logs soft distance and radius status.",
                    "Rewards are tied to verified proof events.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC300]" />
                      <span>{item}</span>
                    </div>
                  ))}
                  <div className="rounded-lg border border-[#FF6A00]/30 bg-[#FF6A00]/10 p-4">
                    <p className="font-bold text-white">Selected Moment</p>
                    <p className="mt-1 text-white/65">{selectedMoment?.title || "Choose a Moment to unlock distribution."}</p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="track" className="mt-6 space-y-5">
            {campaignsQuery.isLoading ? (
              <p className="text-white/60">Loading PromoPush campaigns...</p>
            ) : campaigns.length === 0 ? (
              <Card className="border-dashed border-white/20 bg-white/[0.03] text-white">
                <CardContent className="p-8 text-center text-white/65">Create a campaign to generate QR, Meta, creator, direct, and street activation links.</CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => (
                <Card key={campaign.id} className="border-white/10 bg-white/[0.04] text-white">
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>{campaign.title}</CardTitle>
                        <p className="mt-1 flex items-center gap-2 text-sm text-white/55">
                          <MapPin className="h-4 w-4 text-[#FF6A00]" />
                          {campaign.geo_label || "Geo zone"} · {campaign.geo_radius_meters}m radius
                        </p>
                      </div>
                      <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", campaign.status === "active" ? "bg-[#FF6A00] text-white" : "bg-white/10 text-white/70")}>
                        {campaign.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      {(campaign.channels || []).map((channel) => (
                        <div key={channel.id} className="rounded-lg border border-white/10 bg-black/35 p-3">
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <p className="text-sm font-bold">{channel.label}</p>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70" onClick={() => navigator.clipboard.writeText(channel.tracking_link)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="rounded-md bg-white p-2">
                            <QRCodeSVG id={`qr-${channel.tracking_code}`} value={channel.tracking_link} className="h-full w-full" />
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/65">
                            <span>Clicks {channel.metrics?.clicks || 0}</span>
                            <span>Joins {channel.metrics?.joins || 0}</span>
                            <span>Moves {channel.metrics?.moves_completed || 0}</span>
                            <span>Proof {channel.metrics?.proof_verified || 0}</span>
                          </div>
                          <Button size="sm" variant="outline" className="mt-3 w-full border-white/15 bg-transparent text-white hover:bg-white/10" onClick={() => downloadQr(channel.label, channel.tracking_code)}>
                            <Download className="mr-2 h-4 w-4" />
                            QR SVG
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
