import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { NightTrail, PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

export default function PeopleHome() {
  const { user, profile, activeRole } = useAuth();
  const home = useExperienceHome();
  const to = useExperiencePath();
  const data = home.data;
  const name = data?.name || profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "You";
  const role = data?.role || (["creator", "host", "promoter", "merchant", "brand"].includes(String(activeRole)) ? "contributor" : "member");
  const communityName = data?.communities?.[0]?.title || name;
  const suppliesInventory = Boolean(data?.outcomes?.suppliesInventory || ["merchant", "brand"].includes(String(activeRole)));
  const waiting = (data?.notices || []).slice(0, 2);
  const firstNotice = waiting[0];
  const buckets = data?.happened?.buckets || {};

  if (home.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0D0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  const currentMove = firstNotice
    ? {
        href: firstNotice.href || (firstNotice.type === "people_drop" ? "/card" : "/happened"),
        kicker: firstNotice.read ? "Seen" : "Waiting",
        title: firstNotice.title || "Something happened",
        detail: firstNotice.message || "Open this to see what changed.",
        stub: "Slip",
        stubLabel: "Now",
      }
    : role === "member"
      ? {
          href: "/card",
          kicker: "Your move",
          title: "Keep your perks on the card",
          detail: "Claim something, then show it when you get there.",
          stub: "Card",
          stubLabel: "Hold",
        }
      : {
          href: "/give",
          kicker: "Your move",
          title: "Give them something tonight",
          detail: "A perk on their PromoCard. They claim it. You see who showed up.",
          stub: "Give",
          stubLabel: "Tear",
        };

  return (
    <ExperienceShell
      eyebrow={role === "operator" ? "Your community" : role === "contributor" ? "Your people" : "Your night"}
      title={communityName}
      description={
        role === "member"
          ? "One move. Then a card you can show."
          : "Give something. They show up. You see it."
      }
    >
      <Link to={to(currentMove.href)} className="block">
        <TicketPass
          kicker={currentMove.kicker}
          title={currentMove.title}
          detail={currentMove.detail}
          stub={currentMove.stub}
          stubLabel={currentMove.stubLabel}
        />
      </Link>

      {role === "member" ? (
        <Link to={to("/card")} className="block">
          <PromoCardFace
            holder={name}
            available={`${Number(data?.wallet?.points || 0).toLocaleString()} pts`}
            limit={`${Number(data?.wallet?.promokeys || 0)} keys`}
            places="Your perks live here"
          />
        </Link>
      ) : (
        <PaperReceipt
          heading="This week"
          lines={[
            { label: "People", value: String(data?.people || 0), strong: true },
            { label: "Showed up", value: String(data?.happening || 0) },
            { label: "Claimed", value: String(buckets.claimed || data?.outcomes?.ledger?.claimed || 0) },
            { label: "Used", value: String(buckets.used || data?.outcomes?.ledger?.used || 0) },
            { label: "Earned", value: money(Number(data?.earned || 0)), strong: true },
          ]}
          footer={
            data?.happening
              ? `${data.happening} ${data.happening === 1 ? "person" : "people"} actually moved.`
              : "Zeros stay zeros until someone shows up."
          }
        />
      )}

      {waiting.length > 1 ? (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">Also waiting</h2>
          {waiting.slice(1).map((notice: any) => (
            <Link key={notice.id} to={to(notice.href || "/happened")} className="block">
              <TicketPass
                kicker={notice.read ? "Seen" : "New"}
                title={notice.title || "Something happened"}
                detail={notice.message || "Open this to see what changed."}
                stub="Slip"
                stubLabel="Keep"
              />
            </Link>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold">Next tickets</h2>
        {(role === "member"
          ? [
              { href: "/give", kicker: "Give", title: "Put a perk on their card", detail: "They claim it. You never explain the machinery.", stub: "Perk" },
              { href: "/happened", kicker: "This week", title: "See what already happened", detail: "Who claimed, who showed up, who brought friends.", stub: "Read" },
              { href: "/discover", kicker: "Out", title: "Find a night, a meal, a room", detail: "The world outside your people.", stub: "Go" },
            ]
          : [
              { href: "/create", kicker: "Create", title: "Ask them to show up", detail: "Go, try, answer, or put a night on the calendar.", stub: "Ask" },
              { href: "/people", kicker: "People", title: "See who you moved", detail: "Credit stays with who brought them.", stub: "List" },
              { href: "/happened", kicker: "This week", title: "Read the receipt", detail: "What your people actually did.", stub: "Read" },
              ...(suppliesInventory
                ? [{ href: "/stock", kicker: "Stock", title: "Put something up for others", detail: "They move it. You see claimed and used.", stub: "Open" }]
                : [{ href: "/earn", kicker: "Earn", title: "Take a live slip", detail: "Move someone else's inventory. Earn when they show up.", stub: "Take" }]),
            ]
        ).map((ticket) => (
          <Link key={ticket.href} to={ticket.href.startsWith("/discover") ? ticket.href : to(ticket.href)} className="block">
            <TicketPass
              kicker={ticket.kicker}
              title={ticket.title}
              detail={ticket.detail}
              stub={ticket.stub}
              stubLabel="Keep"
            />
          </Link>
        ))}
      </section>

      {role !== "member" ? (
        <NightTrail
          eyebrow="How this works"
          title="Give. They move. You see it."
          steps={[
            { label: "Give", title: "Drop a perk", text: "It lands on their PromoCard." },
            { label: "They claim", title: "They keep it", text: "You get a slip when they do." },
            { label: "They show up", title: "It counts", text: "The receipt this week updates." },
          ]}
        />
      ) : null}

      {!data?.communities?.length ? (
        <Link to={to("/start")} className="block">
          <TicketPass
            kicker="First room"
            title="Start a community — or join one"
            detail="Kingston food, a night, a campus. Then give the first people something."
            stub="Open"
            stubLabel="Start"
          />
        </Link>
      ) : (
        <Link to={`/scenes/${data.communities[0].slug}`} className="block">
          <TicketPass
            kicker="Your room"
            title={data.communities[0].title}
            detail="The people already in this community."
            stub="Room"
            stubLabel="In"
          />
        </Link>
      )}

      {role !== "member" ? (
        <Link to="/dashboard?view=studio" className="block text-center text-xs text-white/30">
          Open the older studio tools
        </Link>
      ) : null}
    </ExperienceShell>
  );
}
