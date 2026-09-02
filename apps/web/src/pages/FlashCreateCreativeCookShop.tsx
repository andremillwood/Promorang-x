import { FormEvent, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { trackMetaEvent } from "@/components/MetaPixel";
import {
  COOK_SHOP_BRAND,
  COOK_SHOP_OFFERS,
  CREATIVE_COOK_SHOP_SEASON,
  CREATIVE_COOK_SHOP_WEEKS,
  cookShopOffer,
  formatWeekDate,
  nextSeasonWeek,
  seasonPassCreditsToward,
} from "@promorang/shared";

type Door = "season_pass" | "retainer";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.promorang.co";

export default function FlashCreateCreativeCookShop() {
  const nextWeek = useMemo(() => nextSeasonWeek(), []);
  const season = cookShopOffer("season_pass");
  const retainer = cookShopOffer("retainer");
  const webinar = cookShopOffer("acquisition_webinar");
  const [door, setDoor] = useState<Door>("season_pass");
  const [submitted, setSubmitted] = useState<Door | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
  });

  const selected = door === "season_pass" ? season : retainer;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(/\s+/);
      const lastName = rest.join(" ") || "Cook Shop";
      const response = await fetch(`${API_BASE}/api/email/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: form.email,
          topic: door === "season_pass" ? "creative-cook-shop-season" : "cook-shop-retainer",
          subject:
            door === "season_pass"
              ? "Creative Cook Shop season pass — $30 tripwire"
              : "Customer Cook Shop retainer — season included",
          message: [
            `Door: ${selected.name}`,
            `SKU: ${selected.sku}`,
            `Business: ${form.business || "not given"}`,
            `WhatsApp: ${form.phone || "not given"}`,
            `Credit: $${seasonPassCreditsToward(door === "season_pass" ? "retainer" : "retainer")} toward kitchen offers if they upgrade in 14 days.`,
            door === "season_pass"
              ? "Collect USD $30. Season access + replay. Credit toward Core / retainer / Grand Slam."
              : "Retainer inquiry. Include the 15-week Creative Cook Shop at $0.",
          ].join("\n"),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || "We could not reserve that seat. Try again or WhatsApp the kitchen.");
      }
      trackMetaEvent("Lead", {
        content_name: selected.name,
        content_ids: [selected.sku],
        value: selected.priceUsd,
        currency: "USD",
        lead_type: door,
      });
      setSubmitted(door);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Reservation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="fc-cook-shop min-h-screen bg-[#06122b] text-[#f6efd8]">
      <SEO
        name="FlashCreate"
        title="The Creative Cook Shop — 15-week season"
        description="A 15-week Tuesday webinar season to attract, convert, and keep more customers. $30 tripwire, free with the Customer Cook Shop retainer. The weekly Why Funnels Fail masterclass stays the free acquisition tool."
        schema={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: COOK_SHOP_BRAND.seasonName,
          description: COOK_SHOP_BRAND.tagline,
          provider: { "@type": "Organization", name: "FlashCreate", url: CREATIVE_COOK_SHOP_SEASON.flashcreateUrl },
          startDate: CREATIVE_COOK_SHOP_SEASON.startDate,
          endDate: CREATIVE_COOK_SHOP_SEASON.endDate,
          offers: [
            { "@type": "Offer", price: "30", priceCurrency: "USD", name: season.name },
            { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Included with Customer Cook Shop retainer" },
          ],
        }}
      />

      <style>{`
        .fc-cook-shop {
          --gold: #e3b23c;
          --navy: #06122b;
          --paper: #f6efd8;
          font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
        }
        .fc-cook-shop .ticket {
          background:
            radial-gradient(circle at 0 50%, transparent 14px, #f6efd8 15px) left / 18px 100% no-repeat,
            radial-gradient(circle at 100% 50%, transparent 14px, #f6efd8 15px) right / 18px 100% no-repeat,
            linear-gradient(#f6efd8, #f6efd8);
          color: #06122b;
        }
        @media (prefers-reduced-motion: reduce) {
          .fc-cook-shop * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <header className="border-b border-[#e3b23c]/25 bg-[#081833]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 text-xs uppercase tracking-[0.28em] text-[#e3b23c]">
          <p>FlashCreate · Strategy. Creative. Results.</p>
          <a className="hover:text-[#f6efd8]" href={webinar.destination}>
            Free weekly teardown
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#e3b23c]">
            {COOK_SHOP_BRAND.seasonName} · 15 weeks
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.92] tracking-[-0.04em] text-[#f6efd8] sm:text-6xl">
            {COOK_SHOP_BRAND.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-[#f6efd8]/75">
            A Tuesday season to attract, convert, and keep more customers. This is the product. The free weekly
            masterclass stays the client-acquisition tool.
          </p>
          <dl className="mt-8 grid gap-3 text-sm text-[#f6efd8]/80 sm:grid-cols-2">
            <div className="border border-[#e3b23c]/30 bg-[#0b1d3d] px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.22em] text-[#e3b23c]">When</dt>
              <dd className="mt-1 font-semibold">Tuesdays · {CREATIVE_COOK_SHOP_SEASON.timeLabel}</dd>
            </div>
            <div className="border border-[#e3b23c]/30 bg-[#0b1d3d] px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.22em] text-[#e3b23c]">Season</dt>
              <dd className="mt-1 font-semibold">Sept 8 – Dec 15, 2026 · Zoom</dd>
            </div>
            <div className="border border-[#e3b23c]/30 bg-[#0b1d3d] px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.22em] text-[#e3b23c]">Next class</dt>
              <dd className="mt-1 font-semibold">
                {nextWeek
                  ? `Week ${nextWeek.week} · ${formatWeekDate(nextWeek.date)} · ${nextWeek.title}`
                  : "Season complete"}
              </dd>
            </div>
            <div className="border border-[#e3b23c]/30 bg-[#0b1d3d] px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.22em] text-[#e3b23c]">Not this</dt>
              <dd className="mt-1 font-semibold">
                <a className="underline decoration-[#e3b23c]/60 underline-offset-4" href={webinar.destination}>
                  Why Funnels Fail — free weekly
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <aside className="ticket p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8a6a1a]">Guest check</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Choose your door</h2>
          <p className="mt-2 text-sm leading-6 text-[#3d2f12]/80">
            $30 is a reservation fee, not the value of 15 weeks. Retainers get the season included.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => setDoor("season_pass")}
              className={`border px-4 py-3 text-left ${
                door === "season_pass" ? "border-[#06122b] bg-[#06122b] text-[#f6efd8]" : "border-[#06122b]/20"
              }`}
            >
              <span className="block text-[11px] uppercase tracking-[0.22em]">Tripwire</span>
              <span className="mt-1 block text-lg font-black">USD $30 season pass</span>
              <span className="mt-1 block text-sm opacity-80">Credits toward retainer, $300 Core, or Grand Slam in 14 days.</span>
            </button>
            <button
              type="button"
              onClick={() => setDoor("retainer")}
              className={`border px-4 py-3 text-left ${
                door === "retainer" ? "border-[#06122b] bg-[#06122b] text-[#f6efd8]" : "border-[#06122b]/20"
              }`}
            >
              <span className="block text-[11px] uppercase tracking-[0.22em]">Kitchen</span>
              <span className="mt-1 block text-lg font-black">Retainer · season included</span>
              <span className="mt-1 block text-sm opacity-80">
                JMD $30,000 / month. The 15-week series pairs free with the Customer Cook Shop.
              </span>
            </button>
          </div>

          {submitted ? (
            <div className="mt-6 border border-[#06122b]/20 bg-white/70 p-4 text-sm leading-6" role="status">
              {submitted === "season_pass"
                ? "Season pass reserved. We will send the $30 payment link and Zoom calendar. That $30 credits toward a kitchen offer for 14 days."
                : "Retainer request received. The Creative Cook Shop season is already on your ticket. The kitchen will confirm onboarding."}
            </div>
          ) : (
            <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
              <label className="block text-xs font-bold uppercase tracking-[0.18em]">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="mt-1 w-full border border-[#06122b]/20 bg-white px-3 py-2 text-base font-normal"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-[0.18em]">
                Work email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  className="mt-1 w-full border border-[#06122b]/20 bg-white px-3 py-2 text-base font-normal"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-[0.18em]">
                WhatsApp
                <input
                  value={form.phone}
                  onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                  className="mt-1 w-full border border-[#06122b]/20 bg-white px-3 py-2 text-base font-normal"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-[0.18em]">
                Business
                <input
                  value={form.business}
                  onChange={(e) => setForm((current) => ({ ...current, business: e.target.value }))}
                  className="mt-1 w-full border border-[#06122b]/20 bg-white px-3 py-2 text-base font-normal"
                />
              </label>
              {error ? (
                <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#e3b23c] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#06122b] disabled:opacity-60"
              >
                {busy ? "Sending the ticket…" : door === "season_pass" ? "Reserve the $30 season" : "Ask for retainer + season"}
              </button>
            </form>
          )}
        </aside>
      </section>

      <section className="border-y border-[#e3b23c]/20 bg-[#081833]">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-3xl font-black tracking-[-0.03em]">The 15-week menu</h2>
          <p className="mt-2 max-w-2xl text-[#f6efd8]/70">
            Same Tuesday slot as the free teardown. Different product. Week 15 is the close: build the 2027 customer
            acquisition plan.
          </p>
          <ol className="mt-8 grid gap-3 md:grid-cols-2">
            {CREATIVE_COOK_SHOP_WEEKS.map((week) => (
              <li key={week.week} className="flex gap-4 border border-[#e3b23c]/20 bg-[#06122b] px-4 py-4">
                <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-[#e3b23c]">
                  {formatWeekDate(week.date)}
                </span>
                <span>
                  <span className="block text-sm font-black">{week.title}</span>
                  {week.subtitle ? <span className="block text-sm text-[#f6efd8]/60">{week.subtitle}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-3xl font-black tracking-[-0.03em]">How the ladder works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {COOK_SHOP_OFFERS.filter((offer) => offer.id !== "core_300" && offer.id !== "grand_slam").map((offer) => (
            <article key={offer.id} className="border border-[#e3b23c]/25 bg-[#0b1d3d] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#e3b23c]">{offer.sku}</p>
              <h3 className="mt-2 text-xl font-black">{offer.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#f6efd8]/70">{offer.job}</p>
              <p className="mt-4 text-lg font-black text-[#e3b23c]">
                {offer.priceUsd === 0 ? "Free" : `USD $${offer.priceUsd}${offer.billing === "monthly" ? " / mo" : ""}`}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-[#f6efd8]/55">
          $300 Core and Grand Slam stay on{" "}
          <a className="underline decoration-[#e3b23c]/50" href={CREATIVE_COOK_SHOP_SEASON.coreOfferUrl}>
            flashcreate.co/cook-shop-a
          </a>
          . Grand Slam includes this season. Core does not.
        </p>
      </section>
    </main>
  );
}
