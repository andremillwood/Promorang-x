import { Link } from "react-router-dom";
import {
  releaseFromDrop,
  releaseSignalCopy,
  selectLiveReleaseSignal,
  type ReleaseLikeDrop,
} from "@promorang/shared";
import { TicketPass } from "@/components/promorang/SignatureObjects";

export function LiveReleaseSignal({
  drops,
  className,
}: {
  drops?: ReleaseLikeDrop[] | null;
  className?: string;
}) {
  const release = selectLiveReleaseSignal((drops || []).map((drop) => releaseFromDrop(drop)));
  if (!release) return null;
  const copy = releaseSignalCopy(release);
  return (
    <Link to={copy.href} className={className || "block"}>
      <TicketPass
        kicker={copy.eyebrow}
        title={copy.title}
        detail={copy.detail}
        stub="LIVE"
        stubLabel={copy.verb}
        imageUrl={release.mediaUrl || undefined}
        imageAlt={release.title}
      />
    </Link>
  );
}
