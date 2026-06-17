import { ArrowRight, CheckCircle2, Repeat2, ScanSearch, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommercialProofLoopProps {
  eyebrow: string;
  title: string;
  action: string;
  verification: string;
  outcome: string;
  repeatability: string;
}

export function CommercialProofLoop({
  eyebrow,
  title,
  action,
  verification,
  outcome,
  repeatability,
}: CommercialProofLoopProps) {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
      <CardHeader className="pb-3">
        <Badge variant="outline" className="w-fit border-primary/20 text-primary">
          {eyebrow}
        </Badge>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Action", value: action, icon: Target },
            { label: "Verified", value: verification, icon: ScanSearch },
            { label: "Outcome", value: outcome, icon: CheckCircle2 },
            { label: "Repeat", value: repeatability, icon: Repeat2 },
          ].map((item, index) => (
            <div key={item.label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <p className="mt-3 text-sm text-foreground">{item.value}</p>
              {index < 3 ? <ArrowRight className="mt-4 hidden h-4 w-4 text-muted-foreground md:block" /> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CommercialProofLoop;
