import { Link } from "react-router-dom";
import { ArrowRight, Camera, Music2, Radio, Search, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";

export default function Creators() {
  const { t } = useI18n();
  const creatorsQuery = useQuery({
    queryKey: ["verified-creator-directory"],
    queryFn: async () => {
      const { data: roleRows, error: roleError } = await supabase.from("user_roles").select("user_id").eq("role", "creator");
      if (roleError) throw roleError;
      const ids = Array.from(new Set((roleRows || []).map((row) => row.user_id)));
      if (!ids.length) return [];
      const { data, error } = await supabase.from("profiles").select("user_id,full_name,avatar_url,bio,location").in("user_id", ids).not("full_name", "is", null).order("full_name");
      if (error) throw error;
      return data || [];
    },
  });
  const creators = creatorsQuery.data || [];
  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={t("creators.seoTitle")}
        description={t("creators.seoCopy")}
      />
      <section className="relative min-h-[560px] overflow-hidden border-b border-white/10 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(249,115,22,.3),transparent_32%),linear-gradient(135deg,#25170f,#050505_64%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
        <div className="container relative flex min-h-[464px] items-end px-6 pb-12">
          <div className="grid w-full gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("creators.eyebrow")}</p>
              <h1 className="mt-4 max-w-5xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.07em] md:text-8xl">{t("creators.hero1")}<br /><span className="text-primary">{t("creators.hero2")}</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">{t("creators.heroCopy")}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-xl">
              <Link to="/search" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/50"><Search className="h-4 w-4 text-primary" />{t("creators.search")}</Link>
              <div className="mt-3 flex flex-wrap gap-2">
                {["DJs", "Hosts", "Visual", "Promoters", "Nearby"].map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55">{tag}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-6 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{t("creators.directory")}</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{t("creators.following")}</h2>
          </div>
          <Link to="/discover/content" className="hidden items-center gap-2 text-sm font-bold text-white/55 hover:text-primary sm:inline-flex">
            {t("creators.content")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {creatorsQuery.isLoading ? <p className="py-12 text-center text-sm text-white/45">{t("creators.loading")}</p> : creators.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {creators.map((creator) => (
              <Link key={creator.user_id} to={`/profile/${creator.user_id}`} className="group flex min-h-48 gap-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-primary/50">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-2xl font-black text-black">{creator.avatar_url ? <img src={creator.avatar_url} alt="" className="h-full w-full object-cover" /> : creator.full_name?.charAt(0)}</div>
                <div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("creators.creator")}</p><h3 className="mt-2 text-2xl font-black group-hover:text-primary">{creator.full_name}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-white/50">{creator.bio || t("creators.noBio")}</p>{creator.location ? <p className="mt-3 text-xs text-white/35">{creator.location}</p> : null}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center"><Users className="mx-auto h-9 w-9 text-primary" /><h3 className="mt-5 text-3xl font-black">{t("creators.empty")}</h3><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">{t("creators.emptyCopy")}</p></div>
        )}
      </section>

      <section className="container px-6 py-8">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5 md:grid-cols-4">
          {[
            { icon: Music2, title: "Perform", text: "Appearances, lineups, and bookings." },
            { icon: Camera, title: "Publish", text: "Content drops that move people." },
            { icon: Radio, title: "Promote", text: "Promoshare, referrals, and campaigns." },
            { icon: Users, title: "Build", text: "Communities that remember who showed up." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <item.icon className="mb-4 h-6 w-6 text-primary" />
              <h3 className="font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
