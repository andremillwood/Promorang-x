import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
export default function PastAftrHrs() {
  return <main className="min-h-screen bg-[#0b0b0b] px-6 py-20 text-white"><SEO title="AftrHrs — Past event" description="AftrHrs is no longer running. New RSVPs and pass claims are closed."/><div className="mx-auto max-w-xl"><p className="text-sm uppercase tracking-widest text-white/60">Past event</p><h1 className="mt-4 text-4xl font-bold">AftrHrs</h1><p className="mt-5 leading-7 text-white/75">This series is no longer running. New RSVPs and pass claims are closed. Existing event records are retained.</p><Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-orange-500 px-6 font-bold text-black" to="/live">Explore current moments</Link></div></main>;
}
