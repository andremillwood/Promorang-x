import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type LinkTarget = {
  id: string;
  label: string;
  kind: 'merchant_listing' | 'offer';
  source: string;
};

type ExperienceSurface = {
  id: string;
  label: string;
  type: 'moment' | 'content' | 'mission' | 'campaign';
  meta?: string | null;
};

const sourceLabels: Record<ExperienceSurface['type'], string> = {
  moment: 'Moment',
  content: 'Piece/content',
  mission: 'Mission',
  campaign: 'Campaign',
};

const relationshipFor = (targetType: LinkTarget['kind'], sourceType: ExperienceSurface['type']) => {
  if (sourceType === 'mission') return 'rewards';
  if (sourceType === 'campaign') return 'sponsors';
  return targetType === 'offer' ? 'rewards' : 'features';
};

const humanize = (value: string) => value.split('_').join(' ');

export default function ExperienceAttachmentManager() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [targetId, setTargetId] = useState('');
  const [surfaceId, setSurfaceId] = useState('');

  const products = useQuery({
    queryKey: ['merchant-link-products', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_products')
        .select('id,name,discount_value,price,is_redeemable_with_points')
        .eq('merchant_id', user!.id)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const coupons = useQuery({
    queryKey: ['merchant-link-coupons', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('coupons')
        .select('id,name,discount_value,discount_type,is_active,merchant_stores!inner(user_id)')
        .eq('merchant_stores.user_id', user!.id)
        .eq('is_active', true)
        .limit(80);
      if (error) throw error;
      return data || [];
    },
  });

  const surfaces = useQuery({
    queryKey: ['linkable-experience-surfaces'],
    queryFn: async () => {
      const [moments, content, missions, campaigns] = await Promise.all([
        supabase.from('moments').select('id,title,location').eq('status', 'active').limit(80),
        (supabase as any).from('content_pieces').select('id,title,creator_name,platform').order('created_at', { ascending: false }).limit(60),
        (supabase as any).from('content_missions').select('id,title,status').in('status', ['live', 'draft', 'paused']).limit(60),
        supabase.from('campaigns').select('id,title,is_active').eq('is_active', true).limit(60),
      ]);

      const out: ExperienceSurface[] = [];
      (moments.data || []).forEach((x: any) => out.push({ id: x.id, label: x.title || 'Untitled Moment', type: 'moment', meta: x.location }));
      (content.data || []).forEach((x: any) => out.push({ id: x.id, label: x.title || `${x.platform || 'Content'} piece`, type: 'content', meta: x.creator_name }));
      (missions.data || []).forEach((x: any) => out.push({ id: x.id, label: x.title || 'Mission', type: 'mission', meta: x.status }));
      (campaigns.data || []).forEach((x: any) => out.push({ id: x.id, label: x.title || 'Campaign', type: 'campaign', meta: 'active' }));
      return out;
    },
  });

  const links = useQuery({
    queryKey: ['merchant-experience-links', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('experience_commerce_links')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const targets = useMemo<LinkTarget[]>(() => {
    const productTargets = (products.data || []).map((x: any) => ({
      id: x.id,
      label: `${x.name}${x.discount_value ? ' · discounted' : ''}`,
      kind: (x.discount_value ? 'offer' : 'merchant_listing') as LinkTarget['kind'],
      source: 'Product catalog',
    }));
    const couponTargets = (coupons.data || []).map((x: any) => ({
      id: x.id,
      label: `${x.name || 'Coupon'}${x.discount_value ? ` · ${x.discount_value}${x.discount_type === 'percentage' ? '%' : ''}` : ''}`,
      kind: 'offer' as LinkTarget['kind'],
      source: 'Coupon',
    }));
    return [...productTargets, ...couponTargets];
  }, [products.data, coupons.data]);

  const attach = async () => {
    if (!targetId || !surfaceId || !user) return;
    const target = targets.find((x) => x.id === targetId);
    const surface = (surfaces.data || []).find((x) => `${x.type}:${x.id}` === surfaceId);
    if (!target || !surface) return;

    const { error } = await (supabase as any).from('experience_commerce_links').upsert({
      source_type: surface.type,
      source_id: surface.id,
      target_type: target.kind,
      target_id: target.id,
      relationship: relationshipFor(target.kind, surface.type),
      created_by: user.id,
      attribution: {
        source: 'merchant_control_room',
        target_label: target.label,
        surface_label: surface.label,
      },
    }, { onConflict: 'source_type,source_id,target_type,target_id,relationship' });

    if (error) {
      toast({ title: 'Could not connect', description: error.message, variant: 'destructive' });
      return;
    }

    setTargetId('');
    setSurfaceId('');
    qc.invalidateQueries({ queryKey: ['merchant-experience-links'] });
    toast({ title: 'Connected to the experience' });
  };

  const remove = async (id: string) => {
    await (supabase as any).from('experience_commerce_links').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['merchant-experience-links'] });
  };

  return (
    <Card className="border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-emerald-500" />
          Experience connections
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Place products, offers, and coupons inside Moments, content, missions, or campaigns.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger><SelectValue placeholder="Product, offer, or coupon" /></SelectTrigger>
            <SelectContent>
              {targets.map((x) => <SelectItem key={`${x.kind}-${x.id}`} value={x.id}>{x.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={surfaceId} onValueChange={setSurfaceId}>
            <SelectTrigger><SelectValue placeholder="Moment, mission, content, campaign" /></SelectTrigger>
            <SelectContent>
              {(surfaces.data || []).map((x) => (
                <SelectItem key={`${x.type}-${x.id}`} value={`${x.type}:${x.id}`}>
                  {sourceLabels[x.type]} · {x.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={attach} disabled={!targetId || !surfaceId}>
            <Plus className="mr-2 h-4 w-4" />
            Connect
          </Button>
        </div>
        <div className="mt-5 space-y-2">
          {(links.data || []).map((x: any) => (
            <div key={x.id} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium capitalize">{humanize(x.target_type)} {humanize(x.relationship)}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {humanize(x.source_type)} · {x.attribution?.surface_label || x.source_id}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(x.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
