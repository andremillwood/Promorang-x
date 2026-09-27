import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPromorang } from "@/lib/global-search";

export function useInstantSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const search = useQuery({
    queryKey: ["instant-search", debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    queryFn: () => searchPromorang(debouncedQuery),
    staleTime: 60_000,
  });

  return {
    ...search,
    debouncedQuery,
    isSearching: query.trim().length >= 2 && (search.isFetching || debouncedQuery !== query.trim()),
  };
}
