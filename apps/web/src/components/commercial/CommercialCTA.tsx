import { Link } from "react-router-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { rememberMarketingIntent } from "@/lib/marketing-attribution";

type CommercialCTAProps = ButtonProps & {
  to: string;
  action: string;
  audience: "brand" | "merchant" | "host" | "participant" | "creator";
  metadata?: Record<string, string | number | boolean>;
};

export function CommercialCTA({ to, action, audience, metadata, children, ...buttonProps }: CommercialCTAProps) {
  return (
    <Button {...buttonProps} asChild>
      <Link
        to={to}
        onClick={() => rememberMarketingIntent(action, to, audience, metadata)}
      >
        {children}
      </Link>
    </Button>
  );
}
