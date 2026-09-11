type GoingClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
  from: (table: string) => {
    select: (columns: string, options?: { count?: string; head?: boolean }) => {
      eq: (column: string, value: string) => PromiseLike<{ count: number | null; error: { message?: string } | null }>;
    };
  };
};

export async function fetchMomentGoingCount(client: GoingClient, momentId: string): Promise<number> {
  if (!momentId) return 0;
  const { data, error } = await client.rpc("moment_going_count", { p_moment_id: momentId });
  if (!error && data != null && Number.isFinite(Number(data))) {
    return Number(data);
  }

  const { count } = await client
    .from("moment_participants")
    .select("*", { count: "exact", head: true })
    .eq("moment_id", momentId);
  return count || 0;
}
