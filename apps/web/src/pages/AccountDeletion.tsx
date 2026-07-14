import { FormEvent, useState } from "react";
import { CheckCircle2, ShieldCheck, Trash2 } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AccountDeletionPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const apiBase = import.meta.env.VITE_API_URL || "https://api.promorang.co";
      const response = await fetch(`${apiBase}/api/privacy/account-deletion-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason, company }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Your request could not be submitted.");
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Your request could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="min-h-screen bg-background">
    <SEO title="Delete your Promorang account" description="Request deletion of your Promorang account and associated personal data." />
    <main className="px-6 pb-20 pt-24">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><Trash2 className="h-6 w-6" /></div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-primary">Privacy control</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Delete your Promorang account</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">You can initiate deletion in the Promorang mobile app under Settings &amp; privacy, or use this form if you cannot access the app.</p>

        <div className="my-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-bold">What deletion covers</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Your account, profile, uploaded user-generated content, authentication record, and associated personal data will be deleted. Transaction, fraud-prevention, tax, dispute, or regulatory records may be retained only where legally required, as described in our Privacy Policy.</p></div></div>
        </div>

        {submitted ? <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6"><CheckCircle2 className="h-7 w-7 text-emerald-500" /><h2 className="mt-4 text-xl font-black">Request received</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">We may contact you at the submitted address to verify account ownership. Verified requests are normally completed within 30 days.</p></div> : <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <div><label htmlFor="deletion-email" className="mb-2 block text-sm font-bold">Account email</label><Input id="deletion-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div><label htmlFor="deletion-reason" className="mb-2 block text-sm font-bold">Anything we should know? <span className="font-normal text-muted-foreground">Optional</span></label><Textarea id="deletion-reason" maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Do not include passwords or payment details." /></div>
          <div className="hidden" aria-hidden="true"><label htmlFor="company">Company</label><Input id="company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} /></div>
          {error ? <p role="alert" className="text-sm font-semibold text-destructive">{error}</p> : null}
          <Button type="submit" variant="destructive" className="w-full" disabled={submitting}>{submitting ? "Submitting…" : "Request account deletion"}</Button>
          <p className="text-xs leading-5 text-muted-foreground">Submitting this request does not immediately remove your account. This gives us time to verify ownership and prevent unauthorized deletion.</p>
        </form>}
      </div>
    </main>
  </div>;
}
