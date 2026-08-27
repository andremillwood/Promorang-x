import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Crown, 
  DollarSign, 
  Users, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Sliders, 
  Award, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { TiltCard3D } from '@/components/ui/TiltCard3D';

interface Shareholder {
  id: string;
  name: string;
  avatar?: string;
  shares: number;
  equityPercent: number;
  totalDividendsClaimed: number;
  joinedAt: string;
}

const SAMPLE_SHAREHOLDERS: Shareholder[] = [
  {
    id: "user_1",
    name: "Alex 'DJ Flash' Morgan",
    shares: 25,
    equityPercent: 25.0,
    totalDividendsClaimed: 84.50,
    joinedAt: "2026-06-12",
  },
  {
    id: "user_2",
    name: "Maya Chen (Cultural Scout)",
    shares: 20,
    equityPercent: 20.0,
    totalDividendsClaimed: 67.20,
    joinedAt: "2026-06-18",
  },
  {
    id: "user_3",
    name: "Kingston Hospitality Syndicate",
    shares: 15,
    equityPercent: 15.0,
    totalDividendsClaimed: 50.40,
    joinedAt: "2026-07-01",
  },
  {
    id: "user_4",
    name: "Devon Creative Collective",
    shares: 10,
    equityPercent: 10.0,
    totalDividendsClaimed: 33.60,
    joinedAt: "2026-07-15",
  },
  {
    id: "user_5",
    name: "Public Pool Reserve (AMM Liquidity)",
    shares: 30,
    equityPercent: 30.0,
    totalDividendsClaimed: 0.00,
    joinedAt: "2026-06-01",
  },
];

export function PieceOwnerManage() {
  const { pieceType = 'moment', assetId = 'syndicate_asset' } = useParams<{ pieceType: string; assetId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [distributeAmount, setDistributeAmount] = useState<string>("500");
  const [distributionReason, setDistributionReason] = useState<string>("Weekend Event Ticket & VIP Table Share");
  const [isDistributing, setIsDistributing] = useState(false);
  const [shareholders, setShareholders] = useState<Shareholder[]>(SAMPLE_SHAREHOLDERS);
  const [totalDistributedLifetime, setTotalDistributedLifetime] = useState(235.70);
  
  // Perks state
  const [perks, setPerks] = useState([
    { id: '1', minShares: 5, title: 'Priority Access', description: 'Early-bird RSVP and 15% discount on all syndication event admissions.' },
    { id: '2', minShares: 15, title: 'VIP Hospitality Pass', description: 'Complimentary entry + backstage access + 2 drink tokens per event.' },
    { id: '3', minShares: 25, title: 'Co-Producer Executive Vote', description: 'Direct governance voting on artist lineups and headline sponsors.' },
  ]);
  const [newPerkTitle, setNewPerkTitle] = useState('');
  const [newPerkShares, setNewPerkShares] = useState('10');
  const [newPerkDesc, setNewPerkDesc] = useState('');

  // Pool settings
  const [swapFee, setSwapFee] = useState('0.3');
  const [poolActive, setPoolActive] = useState(true);

  // Announcement state
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: '1', date: '2026-08-20', message: 'July ticket settlement complete: $235.70 distributed to 4 active co-producers!' },
    { id: '2', date: '2026-08-01', message: 'New venue partner secured for next month’s recurring edition.' },
  ]);

  const activeHoldersShares = shareholders
    .filter(s => s.id !== 'user_5')
    .reduce((sum, s) => sum + s.shares, 0);

  const amountNum = parseFloat(distributeAmount) || 0;
  const dividendPerShare = activeHoldersShares > 0 ? (amountNum / activeHoldersShares) : 0;

  const handleDistributeDividends = async () => {
    if (amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please specify a positive revenue pool amount to distribute.",
        variant: "destructive",
      });
      return;
    }

    setIsDistributing(true);
    // Simulate smart contract / AMM dividend settlement
    setTimeout(() => {
      setShareholders(prev =>
        prev.map(s => {
          if (s.id === 'user_5') return s;
          const payout = (s.shares / activeHoldersShares) * amountNum;
          return {
            ...s,
            totalDividendsClaimed: s.totalDividendsClaimed + payout,
          };
        })
      );
      setTotalDistributedLifetime(prev => prev + amountNum);
      setIsDistributing(false);
      toast({
        title: "🎉 Dividends Distributed Successfully!",
        description: `$${amountNum.toFixed(2)} USD allocated across ${shareholders.length - 1} co-producers ($${dividendPerShare.toFixed(2)}/share).`,
      });
      setDistributeAmount("");
    }, 1200);
  };

  const handleAddPerk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerkTitle || !newPerkDesc) return;

    setPerks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        minShares: parseInt(newPerkShares) || 1,
        title: newPerkTitle,
        description: newPerkDesc,
      }
    ]);
    setNewPerkTitle('');
    setNewPerkDesc('');
    toast({
      title: "Co-Producer Perk Added",
      description: `Holders with ${newPerkShares}+ shares now unlock "${newPerkTitle}".`,
    });
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;
    setAnnouncements(prev => [
      { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], message: announcement },
      ...prev
    ]);
    setAnnouncement('');
    toast({
      title: "Co-Producer Dispatch Sent",
      description: "All shareholders have been notified of your update.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Header Banner */}
      <div className="border-b border-border/40 bg-gradient-to-b from-neutral-900/90 via-black to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
            <Link to={`/pieces/${pieceType}/${assetId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> View Public Piece Showcase
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                  <Crown className="w-3.5 h-3.5" /> Creator & Syndicate Studio
                </Badge>
                <Badge variant="outline" className="capitalize text-xs">
                  {pieceType} Piece
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                Manage Syndicate & Dividends
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Distribute revenue share dividends to co-producers, manage liquidity pool bonding curves, and configure VIP shareholder perks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                <Link to={`/pieces/${pieceType}/${assetId}`} target="_blank">
                  Public Showcase <ExternalLink className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Controls */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-neutral-900/60 backdrop-blur-xl">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Supply Minted</p>
              <p className="text-2xl font-black text-foreground mt-1">100 Pieces</p>
              <p className="text-[11px] text-cyan-400 mt-1">70 held · 30 in AMM Pool</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-neutral-900/60 backdrop-blur-xl">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Co-Producers</p>
              <p className="text-2xl font-black text-foreground mt-1">{shareholders.length - 1} Backers</p>
              <p className="text-[11px] text-emerald-400 mt-1">100% active standing</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-neutral-900/60 backdrop-blur-xl">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lifetime Yield Distributed</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">${totalDistributedLifetime.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Direct to shareholder wallets</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-neutral-900/60 backdrop-blur-xl">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AMM Pool Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2.5 w-2.5 rounded-full ${poolActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <p className="text-2xl font-black text-foreground">{poolActive ? "Live (0.3%)" : "Paused"}</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Gems ↔ Piece Swapping active</p>
            </CardContent>
          </Card>
        </div>

        {/* Studio Tabs */}
        <Tabs defaultValue="dividends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-neutral-900 border border-border/60 p-1 rounded-xl">
            <TabsTrigger value="dividends" className="font-bold text-xs">
              <DollarSign className="w-4 h-4 mr-1.5 text-emerald-400" /> Pay Dividends
            </TabsTrigger>
            <TabsTrigger value="captable" className="font-bold text-xs">
              <Users className="w-4 h-4 mr-1.5 text-cyan-400" /> Cap Table
            </TabsTrigger>
            <TabsTrigger value="perks" className="font-bold text-xs">
              <Award className="w-4 h-4 mr-1.5 text-amber-400" /> Holder Perks
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-bold text-xs">
              <Sliders className="w-4 h-4 mr-1.5 text-primary" /> Pool Controls
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Dividend Distribution Console */}
          <TabsContent value="dividends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-neutral-900/90 to-black/95 shadow-xl">
                <CardHeader className="border-b border-emerald-500/20 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" /> 1-Click Dividend Distribution
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Distribute box office, food & beverage, or sponsor revenues instantly to all verified co-producers.
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                      Instant Settlement
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="pool-amount" className="font-bold text-sm">
                      Total Revenue Pool to Distribute (USD / Gems)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pool-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="e.g. 500"
                        className="pl-9 text-lg font-bold"
                        value={distributeAmount}
                        onChange={(e) => setDistributeAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dist-reason" className="font-bold text-sm">
                      Distribution Source / Memo
                    </Label>
                    <Input
                      id="dist-reason"
                      placeholder="e.g. Norbrook BBQ Weekend Ticket Settlement"
                      value={distributionReason}
                      onChange={(e) => setDistributionReason(e.target.value)}
                    />
                  </div>

                  {/* Real-time Calculation Breakdown Box */}
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Eligible Co-Producer Shares:</span>
                      <span className="font-semibold text-foreground">{activeHoldersShares} Pieces</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Estimated Payout per Piece:</span>
                      <span className="font-bold text-emerald-400 text-sm">${dividendPerShare.toFixed(2)} / piece</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-emerald-500/20 pt-2 font-bold text-foreground">
                      <span>Total Co-Producer Settlement:</span>
                      <span className="text-emerald-400 text-base">${amountNum.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleDistributeDividends}
                    disabled={isDistributing || amountNum <= 0}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider py-6 rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    {isDistributing ? "Broadcasting Settlement..." : `Distribute $${amountNum.toFixed(2)} to ${shareholders.length - 1} Co-Producers`}
                  </Button>
                </CardContent>
              </Card>

              {/* Co-Producer Announcement Broadcast */}
              <Card className="border-border/60 bg-neutral-900/60 backdrop-blur-xl">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Send className="w-4 h-4 text-cyan-400" /> Post Co-Producer Dispatch
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Updates will appear directly in shareholders' portfolio feeds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <Input
                      placeholder="Share revenue milestone or event preview..."
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                    />
                    <Button type="submit" size="sm" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs">
                      Broadcast Update
                    </Button>
                  </form>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Dispatches</p>
                    {announcements.map((a) => (
                      <div key={a.id} className="p-3 rounded-xl border border-border/50 bg-neutral-950/40 text-xs space-y-1">
                        <div className="flex justify-between text-muted-foreground text-[10px]">
                          <span>Verified Creator</span>
                          <span>{a.date}</span>
                        </div>
                        <p className="text-foreground font-medium">{a.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: Cap Table & Shareholders */}
          <TabsContent value="captable" className="space-y-6">
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Syndicate Cap Table</CardTitle>
                    <CardDescription className="text-xs">
                      Verified list of fractional equity holders and dividend history.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-bold">
                    {shareholders.length} Registered Accounts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40">
                        <TableHead className="text-xs font-bold uppercase">Co-Producer</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Shares Owned</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Equity %</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Lifetime Claimed</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Member Since</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shareholders.map((s) => (
                        <TableRow key={s.id} className="border-border/30 hover:bg-muted/30">
                          <TableCell>
                            <div className="font-bold text-sm text-foreground flex items-center gap-2">
                              {s.id === 'user_5' ? (
                                <Badge variant="secondary" className="text-[10px]">AMM Pool</Badge>
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                              )}
                              {s.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-sm text-foreground">
                            {s.shares} Pieces
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs border-cyan-500/20 text-cyan-300">
                              {s.equityPercent.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-sm text-emerald-400">
                            ${s.totalDividendsClaimed.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {s.joinedAt}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Holder Perks & Tiers */}
          <TabsContent value="perks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
              <div className="space-y-4">
                <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" /> Active Tier Perks
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Exclusive rewards automatically unlocked when users meet minimum shareholding thresholds.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {perks.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-black">
                              Hold {p.minShares}+ Pieces
                            </Badge>
                            <h4 className="font-bold text-sm text-foreground">{p.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Add New Perk Form */}
              <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" /> Create New Tier Perk
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleAddPerk} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="perk-shares" className="text-xs font-bold">Minimum Pieces Required</Label>
                      <Input
                        id="perk-shares"
                        type="number"
                        min="1"
                        value={newPerkShares}
                        onChange={(e) => setNewPerkShares(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="perk-title" className="text-xs font-bold">Perk Title</Label>
                      <Input
                        id="perk-title"
                        placeholder="e.g. VIP Green Room Access"
                        value={newPerkTitle}
                        onChange={(e) => setNewPerkTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="perk-desc" className="text-xs font-bold">Perk Description</Label>
                      <Input
                        id="perk-desc"
                        placeholder="e.g. Free entry plus 1 companion pass."
                        value={newPerkDesc}
                        onChange={(e) => setNewPerkDesc(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full font-bold text-xs">
                      Publish Perk to Co-Producers
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: Pool Settings & AMM Controls */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl max-w-2xl">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" /> AMM Liquidity Controls
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated Market Maker pricing rules and swap fees.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-neutral-900/40">
                  <div>
                    <p className="font-bold text-sm text-foreground">Market Trading Status</p>
                    <p className="text-xs text-muted-foreground">Allow public buying and selling of pieces on the marketplace.</p>
                  </div>
                  <Button
                    variant={poolActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPoolActive(!poolActive);
                      toast({ title: `Trading ${!poolActive ? "Enabled" : "Paused"}` });
                    }}
                  >
                    {poolActive ? "Active" : "Paused"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swap-fee" className="font-bold text-sm">AMM Swap Fee Rate (%)</Label>
                  <Input
                    id="swap-fee"
                    value={swapFee}
                    onChange={(e) => setSwapFee(e.target.value)}
                    type="number"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground">Standard fee is 0.3%. Fees collect into syndicate reserve pool.</p>
                </div>

                <Button className="w-full font-bold" onClick={() => toast({ title: "Pool settings updated successfully!" })}>
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default PieceOwnerManage;
