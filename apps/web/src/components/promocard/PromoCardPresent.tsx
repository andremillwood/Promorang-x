import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { PROMOCARD_COPY, type PromoCardSurface } from "@promorang/shared";
import { PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PromoCardPresentProps = {
  surface: PromoCardSurface;
  compact?: boolean;
  className?: string;
};

export function PromoCardPresent({ surface, compact = false, className }: PromoCardPresentProps) {
  const [presentOpen, setPresentOpen] = useState(false);

  if (surface.mode === "offer") {
    return (
      <div className={cn("space-y-4", className)}>
        <Link to={surface.offer.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <TicketPass
            kicker={surface.offer.place || "Tonight"}
            title={surface.offer.title}
            detail={surface.offer.detail}
            stub={surface.offer.stub}
            stubLabel="Go"
          />
        </Link>
        <TactileButton variant="primary" size="lg" fullWidth asChild>
          <Link to={surface.offer.href}>{surface.presentLabel}</Link>
        </TactileButton>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <PromoCardFace
        holder={surface.holder}
        available={surface.available}
        limit={surface.limit}
        caption={surface.caption}
        places={surface.places}
        serial={surface.serial}
      />
      <TactileButton variant="primary" size="lg" fullWidth type="button" onClick={() => setPresentOpen(true)}>
        {surface.presentLabel}
      </TactileButton>

      {!compact && surface.perks.length ? (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">On you tonight</h2>
          {surface.perks.map((perk) => (
            <TicketPass
              key={perk.id}
              kicker="Perk"
              title={perk.title}
              detail={perk.detail || "Show this with your PromoCard."}
              stub="Keep"
              stubLabel="Hold"
            />
          ))}
        </section>
      ) : null}

      {!compact ? (
        <PaperReceipt
          heading="How it refills"
          lines={[
            { label: "Show the card", value: "Comes off the bill" },
            { label: "Show up again", value: "Value can return" },
            { label: "Points & Keys", value: "Stay in refill" },
          ]}
          footer={PROMOCARD_COPY.refillHint}
        />
      ) : null}

      <Dialog open={presentOpen} onOpenChange={setPresentOpen}>
        <DialogContent className="max-w-sm border-white/10 bg-[#0D0D0E] text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{PROMOCARD_COPY.presentDialog.heading}</DialogTitle>
            <DialogDescription className="text-white/55">{PROMOCARD_COPY.presentDialog.body}</DialogDescription>
          </DialogHeader>
          <div className="mx-auto w-full max-w-[220px] rounded-[1.4rem] bg-white p-4">
            <QRCodeSVG
              value={`promorang:card:${surface.serial.replace(/\s/g, "")}:${surface.available}`}
              className="h-full w-full"
            />
          </div>
          <p className="text-center font-mono text-sm tracking-widest text-white/70">{surface.serial}</p>
          <p className="text-center font-serif text-3xl font-bold text-amber-100">{surface.available}</p>
          <TactileButton variant="obsidian" fullWidth type="button" onClick={() => setPresentOpen(false)}>
            Done
          </TactileButton>
        </DialogContent>
      </Dialog>
    </div>
  );
}
