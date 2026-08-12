import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingResult() {
  const [params] = useSearchParams();
  const success = params.get("status") === "success";
  return <main className="grid min-h-screen place-items-center bg-[#090909] px-5 text-white"><section className="max-w-xl rounded-[2rem] border border-white/10 bg-[#141414] p-8 text-center md:p-12"><CheckCircle2 className="mx-auto h-12 w-12 text-primary" /><h1 className="mt-6 text-4xl font-black tracking-[-.04em]">{success ? "Payment received" : "Billing update"}</h1><p className="mt-4 text-sm leading-7 text-white/55">{success ? "Stripe has received your checkout. Promorang activates paid benefits only after the signed payment event is verified." : "Review your membership and billing status from your account."}</p><Button className="mt-7" asChild><Link to="/wallet">Open your wallet</Link></Button></section></main>;
}
