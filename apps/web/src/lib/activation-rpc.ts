import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type ActivationArgs = {
  get_campaign_workspace_detail: { p_campaign_id: string };
  fund_promopush: { p_campaign_id: string; p_quote_id: string };
  cancel_promopush: { p_campaign_id: string };
};

// Keep new migration RPCs typed locally until the full schema is regenerated.
// Adding broad Json results to the incomplete generated schema changes inference
// for unrelated legacy RPC calls that are already absent from that schema.
export function activationRpc<Name extends keyof ActivationArgs>(name: Name, args: ActivationArgs[Name]) {
  const call = supabase.rpc.bind(supabase) as unknown as (
    name: Name, args: ActivationArgs[Name]
  ) => PromiseLike<{ data: Json | null; error: PostgrestError | null }>;
  return call(name, args);
}
