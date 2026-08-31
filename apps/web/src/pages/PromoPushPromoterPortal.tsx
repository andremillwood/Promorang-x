import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode, ScanLine, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromoPushPromoterAssignments } from "@/hooks/usePromoPush";
import { useI18n } from "@/i18n/I18nContext";

function downloadQr(label: string, code: string) {
  const svg = document.getElementById(`promoter-qr-${code}`);
  if (!svg) return;
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${label.toLowerCase().replace(/\s+/g, "-")}-${code}.svg`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function PromoPushPromoterPortal() {
  const { t, formatNumber } = useI18n();
  const assignmentsQuery = usePromoPushPromoterAssignments();
  const assignments = assignmentsQuery.data || [];

  const totals = assignments.reduce((acc, assignment) => {
    const metrics = assignment.channel?.metrics || {};
    return {
      scans: acc.scans + Number(metrics.clicks || 0),
      joins: acc.joins + Number(metrics.joins || 0),
      verified: acc.verified + Number(metrics.proof_verified || 0),
    };
  }, { scans: 0, joins: 0, verified: 0 });

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC300]">
            <QrCode className="h-3.5 w-3.5" />
            {t("pushPortal.badge")}
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{t("pushPortal.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">{t("pushPortal.lede")}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: t("pushPortal.scans"), value: totals.scans, icon: ScanLine },
            { label: t("pushPortal.joins"), value: totals.joins, icon: Users },
            { label: t("pushPortal.verifiedActions"), value: totals.verified, icon: ShieldCheck },
          ].map((metric) => (
            <Card key={metric.label} className="border-white/10 bg-white/[0.04] text-white">
              <CardContent className="p-4">
                <metric.icon className="mb-3 h-5 w-5 text-[#FF6A00]" />
                <p className="text-2xl font-black">{formatNumber(metric.value)}</p>
                <p className="text-xs font-medium text-white/55">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {assignmentsQuery.isLoading ? (
            <p className="text-white/60">{t("pushPortal.loading")}</p>
          ) : assignments.length === 0 ? (
            <Card className="border-dashed border-white/20 bg-white/[0.03] text-white lg:col-span-2">
              <CardContent className="p-8 text-center text-white/65">{t("pushPortal.empty")}</CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="border-white/10 bg-white/[0.04] text-white">
                <CardHeader>
                  <CardTitle>{assignment.campaign?.title || t("pushPortal.fallbackTitle")}</CardTitle>
                  <p className="text-sm text-white/55">{assignment.campaign?.geo_label || t("pushPortal.assignedZone")}</p>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  {assignment.channel?.tracking_link && (
                    <div className="rounded-md bg-white p-3">
                      <QRCodeSVG id={`promoter-qr-${assignment.channel.tracking_code}`} value={assignment.channel.tracking_link} className="h-full w-full" />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-md bg-black/35 p-3">
                        <p className="font-black">{assignment.channel?.metrics?.clicks || 0}</p>
                        <p className="text-xs text-white/55">{t("pushPortal.scans")}</p>
                      </div>
                      <div className="rounded-md bg-black/35 p-3">
                        <p className="font-black">{assignment.channel?.metrics?.joins || 0}</p>
                        <p className="text-xs text-white/55">{t("pushPortal.joins")}</p>
                      </div>
                      <div className="rounded-md bg-black/35 p-3">
                        <p className="font-black">{assignment.channel?.metrics?.proof_verified || 0}</p>
                        <p className="text-xs text-white/55">{t("pushPortal.verified")}</p>
                      </div>
                    </div>
                    <Button className="w-full bg-[#FF6A00] text-white hover:bg-[#e65f00]" onClick={() => downloadQr(assignment.channel?.label || "promopush", assignment.channel?.tracking_code)}>
                      <Download className="mr-2 h-4 w-4" />
                      {t("pushPortal.downloadQr")}
                    </Button>
                    {assignment.flyer_url && (
                      <Button asChild variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
                        <a href={assignment.flyer_url} target="_blank" rel="noreferrer">{t("pushPortal.downloadFlyer")}</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
