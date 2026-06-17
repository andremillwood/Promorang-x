import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeDollarSign, Clock, MapPin, Megaphone, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitPromoPushApplication } from "@/hooks/usePromoPush";

const roleCopy = {
  promoters: {
    applicant_role: "promoter",
    title: "Street Activation Promoter",
    description: "Distribute QR flyers, activate local foot traffic, and track scans, joins, and verified actions from your assigned area.",
    earnings: "Performance-based: scan/signup payouts plus verified action bonuses by campaign.",
    icon: Megaphone,
  },
  creators: {
    applicant_role: "creator",
    title: "Creator / Clipper",
    description: "Share referral links, publish clips around Moments, and earn when your traffic produces verified action.",
    earnings: "Performance-based: creator links pay per verified action.",
    icon: Share2,
  },
  marketing: {
    applicant_role: "marketing",
    title: "PromoPush Marketing Support",
    description: "Support flyer design, QR layout, ad creative, and campaign setup requests for active Moment distribution.",
    earnings: "Project and performance-based assignments by campaign scope.",
    icon: BadgeDollarSign,
  },
} as const;

export default function PromoPushCareers() {
  const { role = "promoters" } = useParams<{ role: keyof typeof roleCopy }>();
  const application = useSubmitPromoPushApplication();
  const current = roleCopy[role as keyof typeof roleCopy] || roleCopy.promoters;
  const Icon = current.icon;
  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    email: "",
    availability: "",
    area_coverage: "",
  });

  const submitted = useMemo(() => application.isSuccess, [application.isSuccess]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await application.mutateAsync({
      applicant_role: current.applicant_role,
      ...form,
    });
    setForm({ name: "", location: "", phone: "", email: "", availability: "", area_coverage: "" });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC300]">
            <Icon className="h-3.5 w-3.5" />
            Careers
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{current.title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/65">{current.description}</p>
          <div className="mt-6 grid gap-3">
            <Card className="border-white/10 bg-white/[0.04] text-white">
              <CardContent className="flex gap-3 p-4">
                <BadgeDollarSign className="mt-0.5 h-5 w-5 text-[#FFC300]" />
                <div>
                  <p className="font-bold">Earnings model</p>
                  <p className="mt-1 text-sm text-white/60">{current.earnings}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/[0.04] text-white">
              <CardContent className="flex gap-3 p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-[#FF6A00]" />
                <div>
                  <p className="font-bold">Campaign assignment</p>
                  <p className="mt-1 text-sm text-white/60">Assignments include QR access, printable flyer files, and a personal performance dashboard.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-2xl font-black">Signup form</h2>
          <p className="mt-2 text-sm text-white/60">Name, location, phone, availability, and coverage area are required for workforce assignment.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-2 bg-black/40" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" required value={form.location} onChange={(e) => update("location", e.target.value)} className="mt-2 bg-black/40" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-2 bg-black/40" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-2 bg-black/40" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea id="availability" value={form.availability} onChange={(e) => update("availability", e.target.value)} className="mt-2 bg-black/40" placeholder="Weekdays after 4pm, Saturdays, event nights..." />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="coverage">Area coverage</Label>
              <Textarea id="coverage" value={form.area_coverage} onChange={(e) => update("area_coverage", e.target.value)} className="mt-2 bg-black/40" placeholder="New Kingston, Half Way Tree, UWI, Portmore..." />
            </div>
          </div>
          <Button disabled={application.isPending} className="mt-5 w-full bg-[#FF6A00] text-white hover:bg-[#e65f00]">
            {application.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Submitting
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
          {submitted && <p className="mt-3 text-sm font-medium text-[#FFC300]">Application submitted.</p>}
        </form>
      </div>
    </div>
  );
}
