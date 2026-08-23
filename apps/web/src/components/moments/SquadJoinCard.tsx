import { useMemo, useState } from "react";
import { Users, Share2, Copy, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";

interface SquadJoinCardProps {
  momentId: string;
  momentTitle: string;
  inviterId?: string;
  participantCount?: number;
}

export function SquadJoinCard({ momentId, momentTitle, inviterId, participantCount = 0 }: SquadJoinCardProps) {
  const { t, formatNumber } = useI18n();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const squadLink = useMemo(() => {
    const url = new URL(`/moments/${momentId}`, window.location.origin);
    if (inviterId) url.searchParams.set("invitedBy", inviterId);
    return url.toString();
  }, [inviterId, momentId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(squadLink);
    setCopied(true);
    toast({
      title: t("squadJoin.copiedToast"),
      description: inviterId ? t("squadJoin.copiedToastCredited") : t("squadJoin.copiedToastGeneric"),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("squadJoin.inviteTitle", { title: momentTitle }),
          text: t("squadJoin.inviteText", { title: momentTitle }),
          url: squadLink,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5 overflow-hidden shadow-soft-xl group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
            <Link2 className="w-3 h-3" />
            {inviterId ? t("squadJoin.yourInviteLink") : t("squadJoin.readyToShare")}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">{t("squadJoin.bringSomeone")}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {inviterId
            ? t("squadJoin.sendConnected", { title: momentTitle })
            : t("squadJoin.sendGeneric", { title: momentTitle })}
        </p>

        <div className="flex gap-2">
          <Button 
            variant="hero" 
            className="flex-1 font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t("squadJoin.inviteButton")}
          </Button>
          <Button 
            variant="outline" 
            className="bg-background border-border"
            size="icon"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="mt-6 border-t border-primary/10 pt-6">
          <p className="text-xs font-medium text-muted-foreground">
            {participantCount > 0 ? (
              <>
                <span className="font-bold text-foreground">
                  {participantCount === 1
                    ? t("squadJoin.personJoining", { count: formatNumber(participantCount) })
                    : t("squadJoin.peopleJoining", { count: formatNumber(participantCount) })}{" "}
                </span>
                {t("squadJoin.inviteRecommendation")}
              </>
            ) : (
              t("squadJoin.firstToBring")
            )}
          </p>
        </div>
      </CardContent>
      <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
    </Card>
  );
}
