import SEO from "@/components/SEO";
import ConsumerHomePreview from "@/pages/ConsumerHomePreview";
import ConsumerMomentPreview from "@/pages/ConsumerMomentPreview";
import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const consumerMomentId = searchParams.get("moment");

  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  if (consumerMomentId && new URLSearchParams(window.location.search).get("preview") === "consumer") {
    return <ConsumerMomentPreview />;
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="Today — Promorang"
        description="Find what is worth moving for tonight. Moments, passes, and proof — not a directory of deals."
      />
      <ConsumerHomePreview />
      <p className="border-t border-border bg-background px-4 py-4 text-center text-xs text-muted-foreground">
        New here?{" "}
        <Link to="/welcome" className="font-bold text-foreground underline-offset-4 hover:underline">
          How Promorang works
        </Link>
      </p>
    </div>
  );
};

export default Index;
