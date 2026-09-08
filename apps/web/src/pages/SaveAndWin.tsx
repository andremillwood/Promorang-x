import SEO from "@/components/SEO";
import { PromorangNodeHub } from "@/components/nodes/PromorangNodeHub";
import { VALUE_INSTRUMENTS, VALUE_STORY } from "@promorang/shared";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PlainEnglish } from "@/components/promorang/SignatureObjects";

export default function SaveAndWin() {
  const pot = VALUE_INSTRUMENTS["save-and-win"];

  return (
    <div className="min-h-screen bg-[#090909] pb-20 pt-24 text-white">
      <SEO title={`${pot.name} · Promorang`} description={VALUE_STORY.saveAndWin} />
      <div className="container mb-8 px-4 md:px-6">
        <p className="text-xs font-bold tracking-[0.2em] text-amber-300">{pot.name}</p>
        <div className="mt-4 max-w-2xl">
          <PlainEnglish>{VALUE_STORY.saveAndWin}</PlainEnglish>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">{pot.isNot}</p>
        <Link
          to="/economy/save-and-win"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white"
        >
          Why this is the PromoShare money draw
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <PromorangNodeHub />
    </div>
  );
}
