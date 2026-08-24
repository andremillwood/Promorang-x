import React, { useState } from 'react';
import {
  Users,
  Music2,
  Mic2,
  Utensils,
  Camera,
  Volume2,
  Wine,
  Sparkles,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  Tag,
  CheckCircle2,
  Search,
  ShieldCheck,
  Building2,
  KeyRound,
  Flame,
  Lock
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/i18n/I18nContext';

export type CollaboratorRoleType =
  | 'dj'
  | 'artist'
  | 'comedian'
  | 'performer'
  | 'chef'
  | 'caterer'
  | 'sound_lighting'
  | 'photographer'
  | 'mixologist'
  | 'host'
  | 'sponsor';

export interface Collaborator {
  id: string;
  userId?: string;
  name: string;
  roleType: CollaboratorRoleType;
  stageName?: string;
  avatarUrl?: string;
  splitPercentage: number;
  bountyFeeAmount: number;
  customPromoCode?: string;
}

interface MomentLineupBuilderProps {
  collaborators: Collaborator[];
  onChange: (collaborators: Collaborator[]) => void;
}

const roleMeta: Record<
  CollaboratorRoleType | 'talent',
  { label: string; icon: React.ReactNode; color: string }
> = {
  dj: { label: 'DJ / Producer', icon: <Music2 className="h-4 w-4" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  artist: { label: 'Live Musician / Band', icon: <Sparkles className="h-4 w-4" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  comedian: { label: 'Comedian / MC', icon: <Mic2 className="h-4 w-4" />, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  performer: { label: 'Dancer / Performer', icon: <Sparkles className="h-4 w-4" />, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  sound_lighting: { label: 'Sound & Lighting AV', icon: <Volume2 className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  photographer: { label: 'Photo & Videographer', icon: <Camera className="h-4 w-4" />, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  chef: { label: 'Culinary Partner / Chef', icon: <Utensils className="h-4 w-4" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  caterer: { label: 'Catering / Food Vendor', icon: <Utensils className="h-4 w-4" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  mixologist: { label: 'Bar & Mixology Specialist', icon: <Wine className="h-4 w-4" />, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  host: { label: 'Co-Host / Curator', icon: <Users className="h-4 w-4" />, color: 'bg-primary/20 text-primary border-primary/30' },
  sponsor: { label: 'Brand Sponsor', icon: <Building2 className="h-4 w-4" />, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  talent: { label: 'Collaborator', icon: <Users className="h-4 w-4" />, color: 'bg-white/10 text-white/80 border-white/20' },
};

export const MomentLineupBuilder: React.FC<MomentLineupBuilderProps> = ({
  collaborators,
  onChange,
}) => {
  const { t, formatNumber } = useI18n();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');
  const [roleType, setRoleType] = useState<CollaboratorRoleType>('dj');
  const [splitPercentage, setSplitPercentage] = useState<number>(10);
  const [bountyFeeAmount, setBountyFeeAmount] = useState<number>(0);
  const [promoCode, setPromoCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // PromoKey Gating & Master Key Hub Host Controls
  const [promoKeyGated, setPromoKeyGated] = useState(false);
  const [requiredKeys, setRequiredKeys] = useState<number>(1);
  const [maxGatedCapacity, setMaxGatedCapacity] = useState<number>(25);
  const [isMasterKeyHub, setIsMasterKeyHub] = useState(false);

  // Fetch verified Promorang creators for easy 1-click roster picking
  const { data: verifiedCreators } = useQuery({
    queryKey: ['verified-creators-lineup-picker'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, display_name, avatar_url, bio')
        .not('full_name', 'is', null)
        .limit(20);
      return data || [];
    },
  });

  const totalSplit = collaborators.reduce((acc, curr) => acc + (Number(curr.splitPercentage) || 0), 0);

  const handleAddCollaborator = () => {
    if (!name.trim()) return;

    const generatedPromo = promoCode.trim() || `${(stageName || name).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}_VIP`;

    const newCollaborator: Collaborator = {
      id: `collab-${Date.now()}`,
      userId: selectedProfile?.user_id,
      name: selectedProfile?.full_name || name.trim(),
      stageName: stageName.trim() || undefined,
      roleType,
      avatarUrl: selectedProfile?.avatar_url || undefined,
      splitPercentage: Number(splitPercentage) || 0,
      bountyFeeAmount: Number(bountyFeeAmount) || 0,
      customPromoCode: generatedPromo,
    };

    onChange([...collaborators, newCollaborator]);

    // Reset Form
    setName('');
    setStageName('');
    setRoleType('dj');
    setSplitPercentage(10);
    setBountyFeeAmount(0);
    setPromoCode('');
    setSelectedProfile(null);
    setIsAddOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(collaborators.filter((c) => c.id !== id));
  };

  const handleUpdateSplit = (id: string, percentage: number) => {
    onChange(
      collaborators.map((c) => (c.id === id ? { ...c, splitPercentage: percentage } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-sans text-base font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {t("lineupBuilder.title")}
            </h3>
            <p className="text-xs text-white/60 mt-1">
              {t("lineupBuilder.subtitle")}
            </p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold px-4 py-2 self-start sm:self-auto shadow-md">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> {t("lineupBuilder.addMember")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121215] text-white border-white/15 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Add Talent or Service Partner
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Search Verified Creators */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-white/70">
                    Pick from Promorang Creators (Optional)
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search verified DJs, artists, chefs..."
                      className="pl-9 h-9 bg-white/5 border-white/10 text-xs rounded-xl text-white"
                    />
                  </div>

                  {searchQuery.trim().length > 0 && (
                    <div className="max-h-36 overflow-y-auto space-y-1 border border-white/10 rounded-xl p-2 bg-black/40">
                      {verifiedCreators
                        ?.filter((c) =>
                          (c.full_name || c.display_name || '')
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((creator) => (
                          <div
                            key={creator.id}
                            onClick={() => {
                              setSelectedProfile(creator);
                              setName(creator.full_name || creator.display_name || '');
                              setStageName(creator.display_name || '');
                              setSearchQuery('');
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 cursor-pointer text-xs"
                          >
                            <span className="font-semibold text-white">
                              {creator.full_name || creator.display_name}
                            </span>
                            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                              Verified
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Name / Stage Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-white/70">Full Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Marcus Miller"
                      className="h-10 bg-white/5 border-white/10 text-sm rounded-xl text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-white/70">Stage / Brand Name</Label>
                    <Input
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      placeholder="e.g. DJ Sparks"
                      className="h-10 bg-white/5 border-white/10 text-sm rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Role Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-white/70">Role & Category *</Label>
                  <Select value={roleType} onValueChange={(val: any) => setRoleType(val)}>
                    <SelectTrigger className="h-10 bg-white/5 border-white/10 text-sm rounded-xl text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/15 text-white">
                      {Object.entries(roleMeta).map(([key, meta]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {meta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Split % & Guaranteed Bounty */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-white/70 flex items-center gap-1">
                      <Percent className="h-3 w-3 text-primary" /> Revenue Split %
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={splitPercentage}
                      onChange={(e) => setSplitPercentage(Number(e.target.value))}
                      className="h-10 bg-white/5 border-white/10 text-sm rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-white/70 flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-emerald-400" /> Guaranteed Escrow Fee ($)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={bountyFeeAmount}
                      onChange={(e) => setBountyFeeAmount(Number(e.target.value))}
                      placeholder="0.00"
                      className="h-10 bg-white/5 border-white/10 text-sm rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Custom Promo Code */}
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-white/70 flex items-center gap-1">
                    <Tag className="h-3 w-3 text-cyan-400" /> Talent PromoKey Tracking Link
                  </Label>
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Auto-generated if blank (e.g. SPARKS_VIP)"
                    className="h-10 bg-white/5 border-white/10 text-xs rounded-xl text-white font-mono"
                  />
                  <p className="text-[10px] text-white/50">
                    Fans who RSVP using this code earn the performer attendance bonuses.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddOpen(false)}
                    className="text-xs text-white/70"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddCollaborator}
                    disabled={!name.trim()}
                    className="rounded-xl bg-primary text-white font-bold text-xs px-5"
                  >
                    Confirm & Add
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Co-ownership Allocation Meter */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/60">{t("lineupBuilder.totalSquadSplit")}</span>
            <Badge
              variant="outline"
              className={`font-mono text-xs font-bold ${
                totalSplit > 100
                  ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                  : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
              }`}
            >
              {t("lineupBuilder.poolSuffix", { percent: totalSplit.toString() })}
            </Badge>
            {totalSplit > 100 && (
              <span className="text-rose-400 text-[11px]">{t("lineupBuilder.splitExceeds")}</span>
            )}
          </div>
          <span className="text-white/40 text-[11px]">
            {t("lineupBuilder.remainingPool", { percent: Math.max(0, 100 - totalSplit).toString() })}
          </span>
        </div>
      </div>

      {/* Host Economy Controls: PromoKey Gating & Master Key Hub */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent p-4 sm:p-5 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                PromoKey Gating & Zero-Flake RSVP
              </h4>
              <p className="text-[11px] text-white/50">
                Require attendees to stake or burn PromoKeys to reserve limited seating or VIP perks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/70">
              {promoKeyGated ? 'Gated VIP' : 'Open RSVP'}
            </span>
            <Switch
              checked={promoKeyGated}
              onCheckedChange={setPromoKeyGated}
            />
          </div>
        </div>

        {promoKeyGated && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-amber-300">
                Required PromoKey Deposit
              </Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={requiredKeys}
                onChange={(e) => setRequiredKeys(Number(e.target.value))}
                className="h-9 bg-white/5 border-white/10 text-xs rounded-xl text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-amber-300">
                Max Gated Capacity (Spots)
              </Label>
              <Input
                type="number"
                min="1"
                value={maxGatedCapacity}
                onChange={(e) => setMaxGatedCapacity(Number(e.target.value))}
                className="h-9 bg-white/5 border-white/10 text-xs rounded-xl text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* Master Key Hub Toggle */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs text-white/80 font-medium">
              Designate as Official 24h Master Key Check-in Hub
            </span>
          </div>
          <Switch
            checked={isMasterKeyHub}
            onCheckedChange={setIsMasterKeyHub}
          />
        </div>
      </div>

      {/* Roster List */}
      {collaborators.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center bg-white/[0.01]">
          <Music2 className="h-8 w-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white/70">{t("lineupBuilder.emptyTitle")}</p>
          <p className="text-xs text-white/40 mt-1 max-w-md mx-auto">
            {t("lineupBuilder.emptyCopy")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {collaborators.map((collab) => {
            const meta = roleMeta[collab.roleType] || roleMeta.talent;

            return (
              <div
                key={collab.id}
                className="flex items-start justify-between rounded-xl border border-white/10 bg-[#161619] p-4 text-white shadow-sm hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary border border-white/10">
                    {meta.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">
                        {collab.stageName || collab.name}
                      </span>
                      {collab.stageName && (
                        <span className="text-[11px] text-white/40">({collab.name})</span>
                      )}
                    </div>

                    <Badge className={`mt-1 text-[10px] font-semibold border ${meta.color}`}>
                      {meta.label}
                    </Badge>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-white/60">
                      <span className="flex items-center gap-1 font-mono text-emerald-400">
                        <Percent className="h-3 w-3" /> {collab.splitPercentage}% split
                      </span>
                      {collab.bountyFeeAmount > 0 && (
                        <span className="flex items-center gap-1 text-white/80 font-mono">
                          ${collab.bountyFeeAmount} fee
                        </span>
                      )}
                      {collab.customPromoCode && (
                        <span className="flex items-center gap-1 text-cyan-300 font-mono text-[11px] bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          🔑 {collab.customPromoCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(collab.id)}
                  className="h-8 w-8 p-0 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
