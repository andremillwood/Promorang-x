import { QRCodeSVG } from "qrcode.react";
import { BadgeDollarSign, CheckCircle2, Copy, Link2, Megaphone, MousePointerClick, Plus, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCreatePromoPushCreatorLink,
  usePromoPushActiveCampaigns,
  usePromoPushCreatorLinks,
} from "@/hooks/usePromoPush";

function money(value: number) {
  return `JMD ${Number(value || 0).toLocaleString()}`;
}

export default function PromoPushCreator() {
  const activeCampaignsQuery = usePromoPushActiveCampaigns();
  const creatorLinksQuery = usePromoPushCreatorLinks();
  const createLink = useCreatePromoPushCreatorLink();

  const creatorLinks = creatorLinksQuery.data || [];
  const linkedCampaignIds = new Set(creatorLinks.map((link) => link.campaign_id));
  const availableCampaigns = (activeCampaignsQuery.data || []).filter((campaign) => !linkedCampaignIds.has(campaign.id));

  const totals = creatorLinks.reduce((acc, link) => ({
    clicks: acc.clicks + Number(link.metrics?.clicks || 0),
    joins: acc.joins + Number(link.metrics?.joins || 0),
    proof_verified: acc.proof_verified + Number(link.metrics?.proof_verified || 0),
    earnings: acc.earnings + Number(link.earnings?.total || 0),
  }), { clicks: 0, joins: 0, proof_verified: 0, earnings: 0 });

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC300]">
              <Megaphone className="h-3.5 w-3.5" />
              Creator Distribution
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Turn attention into verified earnings</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
              Claim creator links for active PromoPush campaigns, share them anywhere, and earn when your traffic produces verified proof.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Clicks", value: totals.clicks.toLocaleString(), icon: MousePointerClick },
            { label: "Joins", value: totals.joins.toLocaleString(), icon: Users },
            { label: "Verified Actions", value: totals.proof_verified.toLocaleString(), icon: ShieldCheck },
            { label: "Earnings", value: money(totals.earnings), icon: BadgeDollarSign },
          ].map((metric) => (
            <Card key={metric.label} className="border-white/10 bg-white/[0.04] text-white">
              <CardContent className="p-4">
                <metric.icon className="mb-3 h-5 w-5 text-[#FF6A00]" />
                <p className="text-2xl font-black">{metric.value}</p>
                <p className="text-xs font-medium text-white/55">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-white/10 bg-white/[0.04] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#FFC300]" />
                Available Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeCampaignsQuery.isLoading ? (
                <p className="text-sm text-white/60">Loading active campaigns...</p>
              ) : availableCampaigns.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/20 p-6 text-center text-sm text-white/60">
                  No unclaimed creator campaigns are active right now.
                </div>
              ) : (
                availableCampaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-lg border border-white/10 bg-black/35 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold">{campaign.title}</p>
                        <p className="mt-1 text-sm text-white/55">
                          {campaign.geo_label || "Geo campaign"} · {campaign.geo_radius_meters}m radius
                        </p>
                        <p className="mt-2 text-sm text-[#FFC300]">
                          {money(Number(campaign.reward_rules?.creator_verified_action_jmd || 0))} per verified action
                        </p>
                      </div>
                      <Button
                        disabled={createLink.isPending}
                        onClick={() => createLink.mutate(campaign.id)}
                        className="bg-[#FF6A00] text-white hover:bg-[#e65f00]"
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Claim Link
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#FFC300]" />
                My Creator Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {creatorLinksQuery.isLoading ? (
                <p className="text-sm text-white/60">Loading creator links...</p>
              ) : creatorLinks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/20 p-6 text-center text-sm text-white/60">
                  Claim a campaign link to start tracking clicks, joins, conversions, and earnings.
                </div>
              ) : (
                creatorLinks.map((link) => (
                  <div key={link.id} className="grid gap-4 rounded-lg border border-white/10 bg-black/35 p-4 md:grid-cols-[150px_1fr]">
                    <div className="rounded-md bg-white p-3">
                      <QRCodeSVG value={link.tracking_link} className="h-full w-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-bold">{link.campaign?.title || link.label}</p>
                          <p className="mt-1 break-all text-sm text-white/55">{link.tracking_link}</p>
                        </div>
                        <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10" onClick={() => navigator.clipboard.writeText(link.tracking_link)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                        <div className="rounded-md bg-white/[0.04] p-3">
                          <p className="font-black">{link.metrics?.clicks || 0}</p>
                          <p className="text-xs text-white/50">Clicks</p>
                        </div>
                        <div className="rounded-md bg-white/[0.04] p-3">
                          <p className="font-black">{link.metrics?.joins || 0}</p>
                          <p className="text-xs text-white/50">Joins</p>
                        </div>
                        <div className="rounded-md bg-white/[0.04] p-3">
                          <p className="font-black">{link.metrics?.proof_verified || 0}</p>
                          <p className="text-xs text-white/50">Verified</p>
                        </div>
                        <div className="rounded-md bg-white/[0.04] p-3">
                          <p className="font-black">{money(link.earnings?.pending || 0)}</p>
                          <p className="text-xs text-white/50">Pending</p>
                        </div>
                        <div className="rounded-md bg-[#FFC300]/10 p-3">
                          <p className="font-black text-[#FFC300]">{money(link.earnings?.total || 0)}</p>
                          <p className="text-xs text-[#FFC300]/70">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
