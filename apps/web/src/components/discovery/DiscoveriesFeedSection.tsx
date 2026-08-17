import { Link } from "react-router-dom";
import { Compass, Plus, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { formatDiscoveryCategory, discoveryLocation } from "@promorang/shared";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { SubmitDiscoveryModal } from "./SubmitDiscoveryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DiscoveriesFeedSection() {
  const { data: discoveries, isLoading } = useDiscoveries({ limit: 6 });

  return (
    <section className="my-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Compass className="h-3.5 w-3.5" /> Scout Network
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Fresh Cultural Discoveries
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Places worth finding—not scheduled events. Save one, visit it, or add a local find of your own.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SubmitDiscoveryModal
            trigger={
              <Button size="sm" className="gap-2 rounded-full bg-primary font-bold text-black hover:bg-orange-400">
                <Plus className="h-4 w-4" />
                Submit Discovery (+100 Points)
              </Button>
            }
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
        </div>
      ) : discoveries && discoveries.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discoveries.map((item) => (
            <Link
              key={item.id}
              to={`/discoveries/${item.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-primary/50 hover:bg-white/[0.08]"
            >
              <div className="h-36 w-full overflow-hidden bg-white/5">
                {item.cover_image ? (
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-white/5">
                    <Compass className="h-8 w-8 text-white/20" />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <Badge className="border-cyan-300/30 bg-black/70 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300 backdrop-blur-md">
                    Discovery
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-black/40 bg-black/60 text-[10px] font-bold text-primary backdrop-blur-md"
                  >
                    {formatDiscoveryCategory(item.category)}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-serif text-lg font-bold text-white transition group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
                  <MapPin className="h-3 w-3 text-primary" />
                  {discoveryLocation(item)}
                </p>
                {item.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/60">
                    {item.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-white/40">
                  <span>{item.checkin_count || 0} visits</span>
                  <span className="flex items-center gap-1 font-bold text-primary">
                    View Discovery <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-2 text-sm font-bold text-white">Be the first Scout to log a Discovery!</h3>
          <p className="mt-1 text-xs text-white/50">Recommend your favorite local dining, beaches, trails, or spots.</p>
          <div className="mt-4">
            <SubmitDiscoveryModal />
          </div>
        </div>
      )}
    </section>
  );
}
