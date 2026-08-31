import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicDrop, useExperienceActions } from "@/hooks/usePeopleExperience";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

export default function DropClaim() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const drop = usePublicDrop(slug);
  const { claimDrop } = useExperienceActions();
  const { toast } = useToast();
  const data = drop.data;

  const claim = async () => {
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent(`/drop/${slug}`)}`);
      return;
    }
    try {
      await claimDrop.mutateAsync(slug!);
      toast({ title: "It’s on your PromoCard", description: "Show it when you get there." });
      navigate("/card");
    } catch (error) {
      toast({ title: "Could not claim this", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (drop.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-black text-white"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></main>;
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div>
          <h1 className="font-serif text-4xl font-bold">This drop is gone</h1>
          <Link to="/discover" className="mt-6 inline-block text-primary">See what’s happening</Link>
        </div>
      </main>
    );
  }

  const remaining = data.remaining;
  const claimed = data.claimedCount || 0;
  const total = remaining == null ? null : remaining + claimed;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <SEO title={`${data.creatorName} has something for you`} description={data.title} />
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">{data.creatorName}</p>
        <h1 className="mt-3 font-serif text-5xl font-bold leading-[0.9]">has something for you.</h1>
        <article className="mt-8 overflow-hidden rounded-[2rem] border border-white/10">
          {data.image_url ? <img src={data.image_url} alt="" className="h-52 w-full object-cover" /> : <div className="h-24 bg-gradient-to-r from-primary/40 to-transparent" />}
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{data.perk_kind?.replace("_", " ")}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">{data.title}</h2>
            {data.description ? <p className="mt-2 text-sm text-white/55">{data.description}</p> : null}
            {total != null ? <p className="mt-4 text-sm text-primary">{remaining} / {total} remaining</p> : null}
          </div>
        </article>
        <button
          type="button"
          disabled={claimDrop.isPending}
          onClick={claim}
          className="mt-6 min-h-14 rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
        >
          {user ? "Claim" : "Join the network to claim"}
        </button>
        <p className="mt-4 text-center text-xs text-white/35">Powered by PROMORANG</p>
      </div>
    </main>
  );
}
