import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Users, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  QrCode, 
  Zap, 
  Key, 
  Gem, 
  ChevronRight, 
  Sparkles,
  Award,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Flagship Scenes Mock Fallback for rich preview
const DEMO_SCENES: Record<string, any> = {
  "kingston-after-dark": {
    slug: "kingston-after-dark",
    title: "Kingston After Dark",
    tagline: "The pulse of Kingston nightlife, dancehall culture, and nocturnal gatherings.",
    description: "Built for night owls, music lovers, and venue connectors in Kingston. Complete nightlife missions, unlock VIP Guest Keys, and earn Gems while supporting local sound systems and nightlife spots.",
    city: "Kingston",
    country: "Jamaica",
    steward_name: "Marcus 'Pulse' Chen",
    steward_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    activated_members: 1420,
    actions_completed: 6840,
    banner_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    actions: [
      {
        id: "act-1",
        slug: "dub-club-checkin",
        title: "Check in at Skyline Dub Club",
        type: "Visit Venue",
        points: 250,
        gems: 10.0,
        tickets: 5,
        required_key: "Nightlife Key",
        verification: "QR Scan & Geo",
        capacity: 100,
        completed: 64
      },
      {
        id: "act-2",
        slug: "dancehall-moment-share",
        title: "Share your Kingston Street Party Moment",
        type: "Create Content",
        points: 500,
        gems: 25.0,
        tickets: 10,
        required_key: "Creator Key",
        verification: "Social Link",
        capacity: 50,
        completed: 31
      }
    ]
  },
  "kingston-foodies": {
    slug: "kingston-foodies",
    title: "Kingston Foodies",
    tagline: "Curating authentic Jamaican street food, roadside jerk, and culinary gems.",
    description: "A community steward network discovering food spots, reviewing local eateries, and unlocking exclusive culinary drops across Kingston and St. Andrew.",
    city: "Kingston",
    country: "Jamaica",
    steward_name: "Chef Alicia Vance",
    steward_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    activated_members: 2890,
    actions_completed: 14200,
    banner_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    actions: [
      {
        id: "act-3",
        slug: "jerk-spot-discovery",
        title: "Discover a Hidden Jerk Spot in Mona",
        type: "Discover Location",
        points: 300,
        gems: 15.0,
        tickets: 8,
        required_key: "Foodie Key",
        verification: "Geo & Photo",
        capacity: 200,
        completed: 142
      }
    ]
  }
};

export default function SceneDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const scene = (slug && DEMO_SCENES[slug]) || DEMO_SCENES["kingston-after-dark"];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scene.title,
        text: `Join my Scene on Promorang: ${scene.title}`,
        url: window.location.href
      }).catch(() => setShowShareModal(true));
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* HERO BANNER */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900">
        <img 
          src={scene.banner_url} 
          alt={scene.title}
          className="w-full h-full object-cover opacity-60 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono text-xs uppercase tracking-wider">
                Stewarded Scene
              </Badge>
              <div className="flex items-center text-xs text-slate-400 gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {scene.city}, {scene.country}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{scene.title}</h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl mt-1 font-medium">{scene.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleShare}
              variant="secondary"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 gap-2 border border-slate-700"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              Share Scene
            </Button>
            <Button 
              onClick={() => setIsJoined(!isJoined)}
              className={isJoined ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2" : "bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-bold gap-2"}
            >
              <Zap className="w-4 h-4 fill-current" />
              {isJoined ? "Joined Scene" : "Join Scene"}
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIONS & OPPORTUNITIES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Active Scene Actions & Drops
            </h2>
            <span className="text-xs font-mono text-slate-400">{scene.actions.length} Actions Available</span>
          </div>

          <div className="space-y-4">
            {scene.actions.map((act: any) => (
              <Card key={act.id} className="bg-slate-900 border-slate-800 hover:border-amber-500/30 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-0">
                          {act.type}
                        </Badge>
                        <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                          {act.verification}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-white hover:text-amber-400 transition-colors">
                        {act.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Gem className="w-3.5 h-3.5" />
                          ${act.gems.toFixed(2)} Gems
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Zap className="w-3.5 h-3.5" />
                          +{act.points} Points
                        </span>
                        <span className="flex items-center gap-1 text-purple-400">
                          <Award className="w-3.5 h-3.5" />
                          {act.tickets} PromoShare Entries
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-2">
                        Complete Action
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {act.completed}/{act.capacity} Completed
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: STEWARD & SCENE METRICS */}
        <div className="space-y-6">
          {/* STEWARD CARD */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase font-mono tracking-wider text-slate-400">Scene Steward</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={scene.steward_avatar} 
                  alt={scene.steward_name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
                />
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                    {scene.steward_name}
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </h4>
                  <p className="text-xs text-slate-400">Verified Steward</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {scene.description}
              </p>
            </CardContent>
          </Card>

          {/* NETWORK STATS */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase font-mono tracking-wider text-slate-400">Scene Activity & Impact</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Activated
                </div>
                <div className="text-xl font-black text-white">{scene.activated_members.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Verified Members</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Actions
                </div>
                <div className="text-xl font-black text-white">{scene.actions_completed.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Completions</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SHARE / RECRUITMENT MODAL */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <QrCode className="w-5 h-5 text-amber-400" />
              Recruit to {scene.title}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Share your direct Scene invitation link. When new users join and complete an Action, you build your Activated Referral score.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4 my-2">
            <div className="p-4 bg-white rounded-xl shadow-lg">
              {/* Fallback QR placeholder visual */}
              <div className="w-36 h-36 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs text-center p-2">
                [QR Code for {scene.slug}]
              </div>
            </div>
            <p className="text-xs font-mono text-amber-400 text-center">
              promorang.com/scene/{scene.slug}?ref=user_123
            </p>
          </div>

          <Button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/scene/${scene.slug}?ref=user_123`);
              alert("Invitation link copied!");
              setShowShareModal(false);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
          >
            Copy Direct Invitation Link
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
