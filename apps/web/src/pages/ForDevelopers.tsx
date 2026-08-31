import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  Cpu,
  Terminal,
  Key,
  Bot,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Globe,
  ShieldCheck,
  Layers,
  Sparkles,
  Play
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function ForDevelopers() {
  const { t } = useI18n();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleTestPlayground = async (endpoint: string) => {
    setPlaygroundLoading(true);
    setPlaygroundOutput(null);

    // Simulate real-time API call response
    setTimeout(() => {
      if (endpoint === "feed") {
        setPlaygroundOutput(JSON.stringify({
          success: true,
          data: {
            items: [
              {
                id: "drop_8f92a1",
                title: "25% Off Kingston Cold Brew & Pastry",
                type: "coupon",
                category: "dining",
                merchant: { id: "m_devon", name: "Devon House Cafe" },
                rewardGems: 50,
                remaining: 18,
                expiresAt: "2026-08-30T23:59:59Z"
              },
              {
                id: "drop_44b0c2",
                title: "VIP Weekend Food Festival Access",
                type: "drop",
                category: "events",
                merchant: { id: "m_foodies", name: "Kingston Foodies" },
                rewardGems: 150,
                remaining: 5
              }
            ],
            total: 2
          }
        }, null, 2));
      } else if (endpoint === "claim") {
        setPlaygroundOutput(JSON.stringify({
          success: true,
          data: {
            receiptId: "rcpt_99182a",
            claimCode: "PROMO-XYZ890",
            opportunityId: "drop_8f92a1",
            status: "claimed",
            claimedAt: new Date().toISOString(),
            rewardGems: 50,
            qrPayload: "promorang://redeem/rcpt_99182a"
          },
          message: "Coupon claimed successfully via Headless API"
        }, null, 2));
      } else if (endpoint === "operator") {
        setPlaygroundOutput(JSON.stringify({
          success: true,
          data: {
            planId: "plan_agent_771",
            objective: "Launch weekend matcha drop with 20 creators",
            strategy: "High-density micro-creator mobilization with QR check-in proof",
            budgetAllocation: {
              gemRewards: 15000,
              creatorBounties: 25000,
              platformFees: 5000
            },
            estimatedReach: "4,200 impressions",
            recommendedDropsCount: 3
          }
        }, null, 2));
      }
      setPlaygroundLoading(false);
    }, 600);
  };

  const mcpConfigSnippet = `{
  "mcpServers": {
    "promorang": {
      "command": "npx",
      "args": ["-y", "@promorang/mcp-server"],
      "env": {
        "PROMORANG_API_KEY": "pk_live_your_api_key_here",
        "PROMORANG_API_URL": "https://api.promorang.co/api/v1"
      }
    }
  }
}`;

  const sdkSnippet = `import { PromorangClient } from '@promorang/sdk';

const promorang = new PromorangClient({
  apiKey: process.env.PROMORANG_API_KEY,
});

// 1. Search active promotions
const feed = await promorang.feed.search({
  category: 'dining',
  radiusKm: 15
});

// 2. Programmatically claim on behalf of an agent/user
const receipt = await promorang.coupons.claim({
  opportunityId: feed.items[0].id
});

console.log('Claimed QR Code:', receipt.qrPayload);`;

  const openaiSnippet = `import OpenAI from 'openai';
import { promorangOpenAITools, executeOpenAITool, PromorangClient } from '@promorang/sdk';

const openai = new OpenAI();
const promorang = new PromorangClient({ apiKey: process.env.PROMORANG_API_KEY });

const runner = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Find and claim the best coffee deal nearby' }],
  tools: promorangOpenAITools
});

const call = runner.choices[0].message.tool_calls?.[0];
if (call) {
  const result = await executeOpenAITool(promorang, call.function.name, JSON.parse(call.function.arguments));
  console.log('Agent Action Result:', result);
}`;

  const restSnippet = `curl -X POST https://api.promorang.co/api/v1/coupons/claim \\
  -H "x-api-key: pk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "opportunityId": "drop_8f92a1",
    "recipientUserId": "usr_99128"
  }'`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={t("forDev.seoTitle")}
        description={t("forDev.seoCopy")}
        type="website"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-charcoal/50 to-background pb-20 pt-24 md:pb-32 md:pt-36">
        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full -top-32 -left-32 pointer-events-none" />
        <div className="absolute inset-0 bg-violet-500/5 blur-3xl rounded-full -bottom-32 -right-32 pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
              <Bot className="w-3.5 h-3.5" />
              <span>{t("forDev.badge")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              {t("forDev.heroTitle")} <span className="bg-gradient-to-r from-cyan-400 via-primary to-violet-400 bg-clip-text text-transparent">{t("forDev.heroAccent")}</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("forDev.heroCopy")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                <Link to="/developers/keys">
                  <Key className="w-4 h-4 mr-2" />
                  {t("forDev.getKeys")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl border-border/60">
                <a href="#quickstart">
                  <Code2 className="w-4 h-4 mr-2" />
                  {t("forDev.viewQuickstart")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="py-20 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">{t("forDev.howTitle")}</h2>
            <p className="text-muted-foreground">{t("forDev.howCopy")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/40 border-border/60 backdrop-blur-sm hover:border-cyan-500/40 transition-colors">
              <CardHeader className="space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{t("forDev.p1Title")}</CardTitle>
                <CardDescription>
                  {t("forDev.p1Desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/40 border-border/60 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardHeader className="space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{t("forDev.p2Title")}</CardTitle>
                <CardDescription>
                  {t("forDev.p2Desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/40 border-border/60 backdrop-blur-sm hover:border-violet-500/40 transition-colors">
              <CardHeader className="space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{t("forDev.p3Title")}</CardTitle>
                <CardDescription>
                  {t("forDev.p3Desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/40 border-border/60 backdrop-blur-sm hover:border-emerald-500/40 transition-colors">
              <CardHeader className="space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{t("forDev.p4Title")}</CardTitle>
                <CardDescription>
                  {t("forDev.p4Desc")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Quickstart Code Tabs */}
      <section id="quickstart" className="py-20 border-b border-border/40 bg-charcoal/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-primary border-primary/30">
              {t("forDev.quickBadge")}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">{t("forDev.quickTitle")}</h2>
            <p className="text-muted-foreground">{t("forDev.quickCopy")}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="mcp" className="w-full">
              <TabsList className="grid grid-cols-4 w-full bg-card/60 p-1 rounded-xl border border-border/60">
                <TabsTrigger value="mcp" className="rounded-lg">{t("forDev.tabMcp")}</TabsTrigger>
                <TabsTrigger value="sdk" className="rounded-lg">{t("forDev.tabSdk")}</TabsTrigger>
                <TabsTrigger value="openai" className="rounded-lg">{t("forDev.tabOpenai")}</TabsTrigger>
                <TabsTrigger value="rest" className="rounded-lg">{t("forDev.tabRest")}</TabsTrigger>
              </TabsList>

              {/* Tab 1: MCP */}
              <TabsContent value="mcp" className="mt-4">
                <Card className="bg-card/90 border-border/80 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
                    <span className="text-xs font-mono text-muted-foreground">claude_desktop_config.json</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => copyToClipboard(mcpConfigSnippet, "mcp")}
                    >
                      {copiedTab === "mcp" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTab === "mcp" ? t("forDev.copied") : t("forDev.copyConfig")}
                    </Button>
                  </div>
                  <pre className="p-6 text-sm font-mono text-cyan-300 overflow-x-auto bg-black/60 leading-relaxed">
                    <code>{mcpConfigSnippet}</code>
                  </pre>
                </Card>
              </TabsContent>

              {/* Tab 2: SDK */}
              <TabsContent value="sdk" className="mt-4">
                <Card className="bg-card/90 border-border/80 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
                    <span className="text-xs font-mono text-muted-foreground">promorang-agent.ts</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => copyToClipboard(sdkSnippet, "sdk")}
                    >
                      {copiedTab === "sdk" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTab === "sdk" ? t("forDev.copied") : t("forDev.copyCode")}
                    </Button>
                  </div>
                  <pre className="p-6 text-sm font-mono text-emerald-300 overflow-x-auto bg-black/60 leading-relaxed">
                    <code>{sdkSnippet}</code>
                  </pre>
                </Card>
              </TabsContent>

              {/* Tab 3: OpenAI */}
              <TabsContent value="openai" className="mt-4">
                <Card className="bg-card/90 border-border/80 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
                    <span className="text-xs font-mono text-muted-foreground">openai-function-calling.ts</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => copyToClipboard(openaiSnippet, "openai")}
                    >
                      {copiedTab === "openai" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTab === "openai" ? t("forDev.copied") : t("forDev.copyCode")}
                    </Button>
                  </div>
                  <pre className="p-6 text-sm font-mono text-violet-300 overflow-x-auto bg-black/60 leading-relaxed">
                    <code>{openaiSnippet}</code>
                  </pre>
                </Card>
              </TabsContent>

              {/* Tab 4: REST */}
              <TabsContent value="rest" className="mt-4">
                <Card className="bg-card/90 border-border/80 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
                    <span className="text-xs font-mono text-muted-foreground">Terminal cURL</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => copyToClipboard(restSnippet, "rest")}
                    >
                      {copiedTab === "rest" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTab === "rest" ? t("forDev.copied") : t("forDev.copyCommand")}
                    </Button>
                  </div>
                  <pre className="p-6 text-sm font-mono text-amber-300 overflow-x-auto bg-black/60 leading-relaxed">
                    <code>{restSnippet}</code>
                  </pre>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Live Interactive API Simulator / Playground */}
      <section className="py-20 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("forDev.playTitle")}</h2>
                <p className="text-muted-foreground text-sm">{t("forDev.playCopy")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestPlayground("feed")}
                  disabled={playgroundLoading}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  {t("forDev.testFeed")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestPlayground("claim")}
                  disabled={playgroundLoading}
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  {t("forDev.testClaim")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestPlayground("operator")}
                  disabled={playgroundLoading}
                >
                  <Bot className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  {t("forDev.testOperator")}
                </Button>
              </div>
            </div>

            <Card className="bg-black/80 border-border/80 shadow-xl overflow-hidden font-mono text-xs">
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border/60 flex items-center justify-between text-muted-foreground">
                <span>{t("forDev.response")}</span>
                {playgroundLoading && <span className="text-primary animate-pulse">{t("forDev.executing")}</span>}
              </div>
              <pre className="p-6 text-cyan-400 overflow-x-auto min-h-[160px] leading-relaxed">
                {playgroundOutput || t("forDev.playPlaceholder")}
              </pre>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-gradient-to-t from-charcoal via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center space-y-6 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold">{t("forDev.ctaTitle")}</h2>
          <p className="text-muted-foreground">
            {t("forDev.ctaCopy")}
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/developers/keys">
                {t("forDev.openConsole")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
