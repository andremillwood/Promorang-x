import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function VerifiedPioneerBadge({ beneficiaryType, beneficiaryId }: { beneficiaryType: "user" | "venue"; beneficiaryId?: string | null }) {
  const query = useQuery({
    queryKey: ["pioneer-public-status", beneficiaryType, beneficiaryId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/pioneer-points/public/status/${beneficiaryType}/${beneficiaryId}`);
      if (!response.ok) throw new Error("Unavailable");
      return response.json() as Promise<{ verified_points: number }>;
    },
    enabled: Boolean(beneficiaryId),
  });
  if (!query.data?.verified_points) return null;
  return <Link to="/pioneers" title="Verified Genesis Season contributor" className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary"><Sparkles className="h-3 w-3" />Pioneer contribution · {Number(query.data.verified_points).toLocaleString()}</Link>;
}
