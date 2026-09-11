import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  AFTRHRS_ADMIN_COPY as copy,
  AFTRHRS_ADMIN_FUNNEL,
  AFTRHRS_PATHS,
  adminPassStatus,
  ambassadorInviteProgress,
  guestPassType,
  readAftrHrsAdminEdition,
  type AftrHrsFaq,
} from "@promorang/shared";
import { useAftrHrsAdmin } from "@/hooks/useAftrHrs";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

type AdminPass = {
  id: string;
  unique_code?: string;
  uniqueCode?: string;
  status: string;
  pass_type?: string;
  passType?: string;
};

type AdminAmbassador = {
  name: string;
  allocation: number;
  distributed: number;
  tracking_code?: string;
  trackingCode?: string;
};

function Field({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  children: ReactNode;
}) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-white">
        {label}
      </label>
      {help ? (
        <p id={helpId} className="text-sm leading-6 text-white/60">
          {help}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export default function AftrHrsAdmin() {
  const { data, isError, isLoading, token, update, updatePass } = useAftrHrsAdmin();
  const [allocation, setAllocation] = useState("");
  const [claimsOpen, setClaimsOpen] = useState(true);
  const [published, setPublished] = useState(true);
  const [pageMode, setPageMode] = useState<"live" | "post-event">("live");
  const [policy, setPolicy] = useState("");
  const [faqs, setFaqs] = useState<AftrHrsFaq[]>([]);

  useEffect(() => {
    if (!data) return;
    const edition = readAftrHrsAdminEdition((data.edition || {}) as Record<string, unknown>);
    setAllocation(edition.allocation);
    setClaimsOpen(edition.claimsOpen);
    setPublished(edition.published);
    setPageMode(edition.pageMode);
    setPolicy(edition.policy);
    setFaqs(edition.faqs.length ? edition.faqs : [{ question: "", answer: "" }]);
  }, [data]);

  if (isLoading) {
    return <main className="rounded-2xl bg-zinc-950 px-4 py-10 font-sans text-white">{copy.loading}</main>;
  }
  if (isError || !data) {
    return (
      <main className="rounded-2xl bg-zinc-950 px-4 py-10 text-center font-sans text-white">
        <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">{copy.accessTitle}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60 sm:text-base">{copy.accessBody}</p>
      </main>
    );
  }

  const funnel = (data.funnel || {}) as Record<string, number>;
  const passes = (data.passes || []) as AdminPass[];
  const ambassadors = (data.ambassadors || []) as AdminAmbassador[];
  const remaining = Number(data.remaining || 0);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await update.mutateAsync({
        digitalAllocation: allocation ? Number(allocation) : undefined,
        claimsOpen,
        published,
        pageMode,
        faqs: faqs.filter((item) => item.question.trim() || item.answer.trim()),
        venuePolicies: { entry_policy: policy.trim() },
      });
      toast.success(copy.saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.saveFailed);
    }
  };

  const downloadGuestList = () => {
    fetch(`${API_BASE_URL}/aftrhrs/admin/guest-list.csv`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "aftrhrs-guest-list.csv";
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error(copy.saveFailed));
  };

  return (
    <main className="rounded-2xl bg-zinc-950 px-4 py-6 font-sans text-white sm:px-5 sm:py-8">
      <SEO title="AftrHrs night desk" description="Run the AftrHrs pass release and Sea Deck night." />
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <header>
          <p className="text-sm font-semibold text-cyan-300">{copy.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">{copy.title}</h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-white/70">{copy.remaining(remaining)}</p>
        </header>

        <section aria-label="How the night is going" className="grid gap-3 sm:grid-cols-4">
          {AFTRHRS_ADMIN_FUNNEL.map((item) => (
            <div key={item.key} className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-normal">{funnel[item.key] || 0}</p>
              <p className="mt-1 text-sm leading-6 text-white/50">{item.hint}</p>
            </div>
          ))}
        </section>

        <form onSubmit={save} className="space-y-6 rounded-3xl border border-white/10 p-5">
          <div>
            <h2 className="text-xl font-bold tracking-normal">{copy.settingsTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-white/60">{copy.settingsHelp}</p>
          </div>

          <Field id="aftrhrs-allocation" label={copy.allocationLabel} help={copy.allocationHelp}>
            <input
              id="aftrhrs-allocation"
              type="number"
              min="0"
              inputMode="numeric"
              value={allocation}
              onChange={(event) => setAllocation(event.target.value)}
              aria-describedby="aftrhrs-allocation-help"
              className="h-12 w-full rounded-xl border border-white/15 bg-black px-3 text-base"
            />
          </Field>

          <fieldset className="space-y-4">
            <legend className="sr-only">{copy.settingsTitle}</legend>
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0"
                checked={claimsOpen}
                onChange={(event) => setClaimsOpen(event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-white">{copy.claimsLabel}</span>
                <span className="block text-white/60">{copy.claimsHelp}</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-white">{copy.publishedLabel}</span>
                <span className="block text-white/60">{copy.publishedHelp}</span>
              </span>
            </label>
          </fieldset>

          <Field id="aftrhrs-page-mode" label={copy.pageModeLabel}>
            <select
              id="aftrhrs-page-mode"
              value={pageMode}
              onChange={(event) => setPageMode(event.target.value as "live" | "post-event")}
              className="h-12 w-full rounded-xl border border-white/15 bg-black px-3 text-base"
            >
              <option value="live">{copy.pageModeLive}</option>
              <option value="post-event">{copy.pageModeAfter}</option>
            </select>
          </Field>

          <Field id="aftrhrs-policy" label={copy.policyLabel} help={copy.policyHelp}>
            <textarea
              id="aftrhrs-policy"
              value={policy}
              onChange={(event) => setPolicy(event.target.value)}
              placeholder={copy.policyPlaceholder}
              aria-describedby="aftrhrs-policy-help"
              className="min-h-28 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-base leading-6"
            />
          </Field>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-white">{copy.faqsTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-white/60">{copy.faqsHelp}</p>
            </div>
            <ul className="space-y-4">
              {faqs.map((faq, index) => (
                <li key={`faq-${index}`} className="space-y-3 rounded-2xl border border-white/10 p-4">
                  <Field id={`aftrhrs-faq-q-${index}`} label={`${copy.faqQuestion} ${index + 1}`}>
                    <input
                      id={`aftrhrs-faq-q-${index}`}
                      value={faq.question}
                      onChange={(event) => {
                        const next = [...faqs];
                        next[index] = { ...faq, question: event.target.value };
                        setFaqs(next);
                      }}
                      placeholder={copy.faqQuestionPlaceholder}
                      className="h-12 w-full rounded-xl border border-white/15 bg-black px-3 text-base"
                    />
                  </Field>
                  <Field id={`aftrhrs-faq-a-${index}`} label={copy.faqAnswer}>
                    <textarea
                      id={`aftrhrs-faq-a-${index}`}
                      value={faq.answer}
                      onChange={(event) => {
                        const next = [...faqs];
                        next[index] = { ...faq, answer: event.target.value };
                        setFaqs(next);
                      }}
                      placeholder={copy.faqAnswerPlaceholder}
                      className="min-h-24 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-base leading-6"
                    />
                  </Field>
                  {faqs.length > 1 ? (
                    <button
                      type="button"
                      className="text-sm text-white/55 underline-offset-4 hover:underline"
                      onClick={() => setFaqs(faqs.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      {copy.removeFaq}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="text-sm font-semibold text-cyan-300"
              onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
            >
              {copy.addFaq}
            </button>
          </div>

          <button
            type="submit"
            className="h-12 rounded-full bg-white px-6 text-sm font-bold text-black"
          >
            {copy.save}
          </button>
        </form>

        <section className="rounded-3xl border border-white/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-normal">{copy.guestListTitle}</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-white/60">{copy.guestListHelp}</p>
            </div>
            <button
              type="button"
              onClick={downloadGuestList}
              className="text-sm font-semibold text-cyan-300"
              title={copy.downloadHint}
            >
              {copy.downloadList}
            </button>
          </div>
          {passes.length === 0 ? (
            <p className="mt-4 text-sm text-white/55">{copy.emptyGuests}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {passes.map((pass) => {
                const code = pass.unique_code || pass.uniqueCode || "";
                const kind = guestPassType(pass.pass_type || pass.passType);
                const cancelled = pass.status === "cancelled" || pass.status === "expired";
                return (
                  <li key={pass.id} className="rounded-2xl border border-white/10 px-4 py-3">
                    <p className="font-semibold">{kind}</p>
                    <p className="mt-1 text-sm text-white/70">{adminPassStatus(pass.status)}</p>
                    {code ? (
                      <p className="mt-1 text-sm text-white/45">
                        {copy.passCode} {code}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-4">
                      {cancelled ? (
                        <button
                          type="button"
                          className="text-sm font-semibold text-cyan-300"
                          onClick={() => updatePass.mutate({ id: pass.id, status: "active" })}
                        >
                          {copy.restorePass}
                        </button>
                      ) : pass.status !== "redeemed" ? (
                        <button
                          type="button"
                          className="text-sm text-white/60"
                          onClick={() => {
                            if (!window.confirm(copy.cancelConfirm)) return;
                            updatePass.mutate({ id: pass.id, status: "cancelled" });
                          }}
                        >
                          {copy.cancelPass}
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 p-5">
          <h2 className="text-xl font-bold tracking-normal">{copy.ambassadorsTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-white/60">{copy.ambassadorsHelp}</p>
          {ambassadors.length === 0 ? (
            <p className="mt-4 text-sm text-white/55">{copy.emptyAmbassadors}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {ambassadors.map((row, index) => {
                const code = row.tracking_code || row.trackingCode || "";
                return (
                  <li key={code || `${row.name}-${index}`} className="rounded-2xl border border-white/10 px-4 py-3">
                    <p className="font-semibold">{row.name}</p>
                    <p className="mt-1 text-sm text-white/70">{ambassadorInviteProgress(row.distributed, row.allocation)}</p>
                    {code ? (
                      <p className="mt-1 text-sm text-white/45">
                        {copy.doorCode} {code}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <nav aria-label="Related AftrHrs pages" className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/55">
          <Link to={AFTRHRS_PATHS.moment} className="underline-offset-4 hover:text-white hover:underline">
            {copy.publicPage}
          </Link>
          <Link to={AFTRHRS_PATHS.door} className="underline-offset-4 hover:text-white hover:underline">
            {copy.doorPage}
          </Link>
          <Link to={AFTRHRS_PATHS.venue} className="underline-offset-4 hover:text-white hover:underline">
            {copy.venuePage}
          </Link>
          <Link to="/admin?tab=moments" className="underline-offset-4 hover:text-white hover:underline">
            {copy.momentsAdmin}
          </Link>
        </nav>
      </div>
    </main>
  );
}
