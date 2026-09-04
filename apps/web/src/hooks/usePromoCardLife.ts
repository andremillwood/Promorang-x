import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePromoCard } from "@/hooks/usePromoCard";
import {
  readPromoCardMarks,
  writePromoCardMark,
  type ImminentWrite,
  type PromoCardMark,
  type PromoCardMarkKind,
} from "@/lib/promocard/life";

type WriteInput = {
  kind: PromoCardMarkKind;
  place: string;
  amount?: number;
  id?: string;
};

export function usePromoCardLife(imminent?: ImminentWrite | null) {
  const { user, profile } = useAuth();
  const cardQuery = usePromoCard(user?.id);
  const [marks, setMarks] = useState<PromoCardMark[]>(() => readPromoCardMarks(user?.id));
  const [writingId, setWritingId] = useState<string | null>(null);

  useEffect(() => {
    setMarks(readPromoCardMarks(user?.id));
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => setMarks(readPromoCardMarks(user?.id));
    window.addEventListener("promorang:promocard-write", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("promorang:promocard-write", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [user?.id]);

  const write = useCallback(
    (input: WriteInput) => {
      if (!user?.id) return null;
      const mark = writePromoCardMark(user.id, input);
      setMarks(readPromoCardMarks(user.id));
      setWritingId(mark.id);
      window.setTimeout(() => setWritingId((current) => (current === mark.id ? null : current)), 2200);
      return mark;
    },
    [user?.id],
  );

  const holder =
    profile?.display_name ||
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Member";

  const card = cardQuery.data;
  const last4 = card?.cardNumber?.replace(/\D/g, "").slice(-4) || "0842";
  const writingMark = marks.find((mark) => mark.id === writingId) || null;

  return useMemo(
    () => ({
      userId: user?.id,
      holder,
      last4,
      available: card?.availableBalance ?? null,
      limit: card?.monthlyLimit ?? null,
      places: card?.acceptedLocationsCount ?? 0,
      marks,
      writingMark,
      imminent: imminent || null,
      write,
      isLive: Boolean(card),
    }),
    [card, holder, imminent, last4, marks, user?.id, write, writingMark],
  );
}
