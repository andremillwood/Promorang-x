import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Key, DollarSign, ArrowRight, CheckCircle2, Sparkles, Gift, Ticket } from 'lucide-react';

const tiers = [
  {
    name: 'Guest',
    marks: 0,
    keys: 0,
    color: 'bg-slate-100 border-slate-200',
    iconColor: 'text-slate-600',
    earnings: '$0 per Mark',
    description: 'Start your journey. Attend moments, leave Marks, earn points.',
    benefits: [
      'Attend public moments',
      'Leave your Mark (verified attendance)',
      'Earn points for participation',
      'Submit reviews & photos',
    ],
  },
  {
    name: 'Regular',
    marks: 5,
    keys: 1,
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    earnings: '~$3 per Mark',
    description: 'Become a familiar face. Unlock early access and start earning real money.',
    benefits: [
      '🔓 Early access (24h before public)',
      '💰 Money qualification unlocked',
      '⚡ 1.5x earnings multiplier',
      '🎯 Reserve limited spots',
    ],
  },
  {
    name: 'Mover',
    marks: 20,
    keys: 2,
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    earnings: '~$4 per Mark',
    description: 'A community pillar. Co-host moments and amplify your impact.',
    benefits: [
      '🎭 Co-host moments with hosts',
      '⚡ 2.0x earnings multiplier',
      '⭐ Priority standing/seating',
      '📅 Influence moment scheduling',
    ],
  },
  {
    name: 'Host',
    marks: '∞',
    keys: 3,
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    earnings: 'Create & Earn',
    description: 'Lead the community. Create moments and earn from attendees.',
    benefits: [
      '🎨 Create your own moments',
      '💵 Set value pools & earn',
      '📊 Full host dashboard',
      '🤝 Brand partnership access',
    ],
  },
];

const rewardTypes = [
  {
    icon: Coins,
    title: 'Points',
    value: 'Always',
    description: 'Earn points for every action. Redeem for perks, benefits, and status. Never expires.',
    example: '+50 points per Mark',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Key,
    title: 'Keys',
    value: 'Tier Up',
    description: 'Unlock access. Keys are earned through consistent participation, not bought.',
    example: '1 Key at 5 Marks',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: DollarSign,
    title: 'Money',
    value: 'Qualified',
    description: 'Earn real money for verified participation. Cash out to your bank or crypto wallet.',
    example: '~$3-4 per Mark',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Gift,
    title: 'Extras',
    value: 'Random',
    description: 'Win giveaways, receive brand coupons, exclusive perks. Surprises for participation.',
    example: 'Free coffee, swag, VIP access',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
];

export function ValueProposition() {
  const [activeTier, setActiveTier] = useState(0);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Your Life Is Made of Moments
          </Badge>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            Join Moments.
            <br />
            <span className="text-gradient-primary">Leave Your Mark. Earn Value.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every time you show up, you create value. We track your Marks, verify your participation, 
            and make sure you get appreciated for helping communities thrive.
          </p>
        </div>

        {/* Three Value Types - All flowing from Moments */}
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
            Every Moment Creates 4 Types of Value
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {rewardTypes.map((reward) => (
            <Card key={reward.title} className={`${reward.bgColor} border-0`}>
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${reward.bgColor} flex items-center justify-center mb-4`}>
                  <reward.icon className={`w-6 h-6 ${reward.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{reward.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {reward.value}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {reward.description}
                </p>
                <p className={`text-sm font-medium ${reward.color}`}>
                  {reward.example}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Moments as Identity */}
        <Card className="max-w-3xl mx-auto mb-16 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-8 text-center">
            <h3 className="font-serif text-2xl font-bold mb-4 text-violet-900">
              Your Story is Made of Moments
            </h3>
            <p className="text-violet-700 mb-6">
              Every Mark you leave is a verified moment of presence. Your collection of Marks 
              becomes your identity, your reputation, and your social graph. This is who you are 
              in the community. Not just a profile. A history of real participation.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="px-4 py-2 bg-white/60 rounded-full text-violet-800">
                🎯 Marks = Verified Presence
              </div>
              <div className="px-4 py-2 bg-white/60 rounded-full text-violet-800">
                📍 Venues = Places You're Known
              </div>
              <div className="px-4 py-2 bg-white/60 rounded-full text-violet-800">
                👥 Relationships = Shared Moments
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Four Tiers */}
        <div className="max-w-4xl mx-auto mb-20">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-center mb-4">
            Four Tiers. Deeper Relationship to Every Moment.
          </h3>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            As your collection of Marks grows, so does your access, earnings, and influence. 
            Each tier represents a deeper commitment to showing up and creating value.
          </p>
          
          {/* Tier Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tiers.map((tier, index) => (
              <button
                key={tier.name}
                onClick={() => setActiveTier(index)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeTier === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {tier.name}
              </button>
            ))}
          </div>

          {/* Active Tier Display */}
          <Card className={`${tiers[activeTier].color} border-2`}>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center ${tiers[activeTier].iconColor}`}>
                      <Key className="w-8 h-8" />
                      {tiers[activeTier].keys > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                          {tiers[activeTier].keys}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif text-2xl font-bold">{tiers[activeTier].name}</h4>
                      <p className={`font-medium ${tiers[activeTier].iconColor}`}>
                        {typeof tiers[activeTier].marks === 'number' 
                          ? `${tiers[activeTier].marks}+ Marks`
                          : 'Create to Earn'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-lg mb-4">{tiers[activeTier].description}</p>
                  
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 ${tiers[activeTier].iconColor} font-semibold`}>
                    <DollarSign className="w-4 h-4" />
                    {tiers[activeTier].earnings}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    What You Unlock
                  </p>
                  {tiers[activeTier].benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${tiers[activeTier].iconColor} flex-shrink-0 mt-0.5`} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* The Economics */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className="font-serif text-2xl md:text-3xl font-bold mb-6">
            The Stakeholder Math
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-secondary/30 rounded-xl">
              <p className="text-3xl font-bold mb-2">$2-4</p>
              <p className="text-muted-foreground">Earned per Mark (depending on tier)</p>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl">
              <p className="text-3xl font-bold mb-2">50 pts</p>
              <p className="text-muted-foreground">Points earned per Mark (always)</p>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl">
              <p className="text-3xl font-bold mb-2">1.5-2x</p>
              <p className="text-muted-foreground">Multiplier for Regulars & Movers</p>
            </div>
          </div>
        </div>

        {/* Qualification Gate */}
        <Card className="max-w-2xl mx-auto mb-16 border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              Why Money is "Qualified" Not "Free"
            </h4>
            <p className="text-muted-foreground mb-4">
              To prevent abuse and ensure quality, you must earn the right to earn money:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Reach Regular tier (5 Marks)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Verify your email</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>7+ days on platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Quality engagement</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Join your first moment. Leave your first Mark. Begin your story.
          </p>
          <Button size="lg" asChild>
            <Link to="/discover">
              Discover Moments
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ValueProposition;
