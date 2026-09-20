import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import foodImage from "@/assets/moment-food-festival.jpg";
import cultureImage from "@/assets/moment-concert.jpg";
import coffeeImage from "@/assets/moments/coffee-code.jpg";
import streetImage from "@/assets/moments/street-art.jpg";
import outdoorImage from "@/assets/moments/hiking.jpg";
import makingImage from "@/assets/moments/pottery.jpg";

const lenses = [
  { label: "Food & taste", note: "Places, flavours, openings", image: foodImage },
  { label: "Culture", note: "Music, scenes, ideas", image: cultureImage },
  { label: "Local finds", note: "Things worth knowing nearby", image: coffeeImage },
  { label: "Creative", note: "Makers, artists, expression", image: streetImage },
  { label: "Move", note: "Outdoors, activity, escape", image: outdoorImage },
  { label: "Make & learn", note: "Classes, skills, hands-on", image: makingImage },
];

export function EditorialWorldRail() {
  return (
    <section aria-labelledby="editorial-world-heading">
      <div className="marketing-section-head">
        <div>
          <p className="marketing-kicker">Find your way in</p>
          <h2 id="editorial-world-heading" className="mt-3 text-4xl font-black sm:text-5xl">What could move you?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
            Start anywhere. Follow a craving, a place, a scene, something creative, or something new to learn.
          </p>
        </div>
        <Link to="/discover" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">
          Explore the market <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="marketing-world-rail" aria-label="Ways to explore PROMORANG">
        {lenses.map((lens) => (
          <Link key={lens.label} to="/discover" className="marketing-world-card group">
            <img src={lens.image} alt="" aria-hidden="true" />
            <span className="marketing-world-card__veil" />
            <span className="marketing-world-card__copy">
              <span className="marketing-world-card__eyebrow">Explore</span>
              <strong>{lens.label}</strong>
              <small>{lens.note}</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
