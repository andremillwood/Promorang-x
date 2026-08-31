import { FormEvent, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft, Clock3, Lightbulb, LockKeyhole, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";
import { API_BASE_URL } from "@/lib/api";
import { captureGrowthAttribution, getAnonymousId, trackGrowthEvent } from "@/lib/marketing-attribution";
import "./LeadMagnetFunnels.css";

type FunnelKey = "scene" | "moment" | "demand" | "creator" | "sponsor";
type AnswerMap = Record<string, string>;
type TFn = (key: TranslationKey, variables?: Record<string, string | number>) => string;

type Funnel = {
  key: FunnelKey;
  index: string;
  eyebrowKey: TranslationKey;
  titleKey: TranslationKey;
  accentKey: TranslationKey;
  promiseKey: TranslationKey;
  proofKey: TranslationKey;
  timeKey: TranslationKey;
  audienceKey: TranslationKey;
  questions: { id: string; promptKey: TranslationKey; noteKey: TranslationKey; options: { id: string; labelKey: TranslationKey }[] }[];
  pillars: { labelKey: TranslationKey; descKey: TranslationKey }[];
  objections: { qKey: TranslationKey; aKey: TranslationKey }[];
  result: (answers: AnswerMap, t: TFn) => { score: number; name: string; insight: string; moves: string[]; route: string; cta: string };
};

const funnels: Record<FunnelKey, Funnel> = {
  scene: {
    key: "scene", index: "01",
    eyebrowKey: "lmQz.scene.eyebrow", titleKey: "lmQz.scene.title", accentKey: "lmQz.scene.accent",
    promiseKey: "lmQz.scene.promise", proofKey: "lmQz.scene.proof", timeKey: "lmQz.scene.time", audienceKey: "lmQz.scene.audience",
    questions: [
      { id: "energy", promptKey: "lmQz.scene.energy.prompt", noteKey: "lmQz.scene.energy.note", options: [
        { id: "new", labelKey: "lmQz.scene.energy.new" }, { id: "talk", labelKey: "lmQz.scene.energy.talk" },
        { id: "inspire", labelKey: "lmQz.scene.energy.inspire" }, { id: "belong", labelKey: "lmQz.scene.energy.belong" },
      ]},
      { id: "room", promptKey: "lmQz.scene.room.prompt", noteKey: "lmQz.scene.room.note", options: [
        { id: "lively", labelKey: "lmQz.scene.room.lively" }, { id: "small", labelKey: "lmQz.scene.room.small" },
        { id: "studio", labelKey: "lmQz.scene.room.studio" }, { id: "neighbourhood", labelKey: "lmQz.scene.room.neighbourhood" },
      ]},
      { id: "reward", promptKey: "lmQz.scene.reward.prompt", noteKey: "lmQz.scene.reward.note", options: [
        { id: "people", labelKey: "lmQz.scene.reward.people" }, { id: "access", labelKey: "lmQz.scene.reward.access" },
        { id: "memory", labelKey: "lmQz.scene.reward.memory" }, { id: "offer", labelKey: "lmQz.scene.reward.offer" },
      ]},
      { id: "timing", promptKey: "lmQz.scene.timing.prompt", noteKey: "lmQz.scene.timing.note", options: [
        { id: "afterwork", labelKey: "lmQz.scene.timing.afterwork" }, { id: "friday", labelKey: "lmQz.scene.timing.friday" },
        { id: "weekend", labelKey: "lmQz.scene.timing.weekend" }, { id: "sunday", labelKey: "lmQz.scene.timing.sunday" },
      ]},
    ],
    pillars: [
      { labelKey: "lmQz.scene.p1", descKey: "lmQz.scene.p1desc" },
      { labelKey: "lmQz.scene.p2", descKey: "lmQz.scene.p2desc" },
      { labelKey: "lmQz.scene.p3", descKey: "lmQz.scene.p3desc" },
    ],
    objections: [
      { qKey: "lmQz.scene.faq1q", aKey: "lmQz.scene.faq1a" },
      { qKey: "lmQz.scene.faq2q", aKey: "lmQz.scene.faq2a" },
      { qKey: "lmQz.scene.faq3q", aKey: "lmQz.scene.faq3a" },
    ],
    result: (a, t) => {
      const nameKey: TranslationKey = a.room === "small" ? "lmQz.scene.result.curated" : a.room === "studio" ? "lmQz.scene.result.creative" : a.room === "neighbourhood" ? "lmQz.scene.result.local" : "lmQz.scene.result.live";
      const energyKey = (`lmQz.scene.energy.${a.energy}`) as TranslationKey;
      const energy = a.energy ? t(energyKey).toLowerCase() : t("lmQz.scene.energyFallback");
      return {
        score: 78 + Object.keys(a).length * 3,
        name: t(nameKey),
        insight: t("lmQz.scene.insight", { energy }),
        moves: [t("lmQz.scene.move1"), t("lmQz.scene.move2"), t("lmQz.scene.move3")],
        route: "/discover",
        cta: t("lmQz.scene.cta"),
      };
    },
  },
  moment: {
    key: "moment", index: "02",
    eyebrowKey: "lmQz.moment.eyebrow", titleKey: "lmQz.moment.title", accentKey: "lmQz.moment.accent",
    promiseKey: "lmQz.moment.promise", proofKey: "lmQz.moment.proof", timeKey: "lmQz.moment.time", audienceKey: "lmQz.moment.audience",
    questions: [
      { id: "promise", promptKey: "lmQz.moment.promiseQ.prompt", noteKey: "lmQz.moment.promiseQ.note", options: [
        { id: "one_sentence", labelKey: "lmQz.moment.promiseQ.one_sentence" }, { id: "explanation", labelKey: "lmQz.moment.promiseQ.explanation" },
        { id: "depends", labelKey: "lmQz.moment.promiseQ.depends" }, { id: "finding", labelKey: "lmQz.moment.promiseQ.finding" },
      ]},
      { id: "people", promptKey: "lmQz.moment.people.prompt", noteKey: "lmQz.moment.people.note", options: [
        { id: "proven", labelKey: "lmQz.moment.people.proven" }, { id: "warm", labelKey: "lmQz.moment.people.warm" },
        { id: "partners", labelKey: "lmQz.moment.people.partners" }, { id: "cold", labelKey: "lmQz.moment.people.cold" },
      ]},
      { id: "place", promptKey: "lmQz.moment.place.prompt", noteKey: "lmQz.moment.place.note", options: [
        { id: "confirmed", labelKey: "lmQz.moment.place.confirmed" }, { id: "likely", labelKey: "lmQz.moment.place.likely" },
        { id: "several", labelKey: "lmQz.moment.place.several" }, { id: "open", labelKey: "lmQz.moment.place.open" },
      ]},
      { id: "return", promptKey: "lmQz.moment.return.prompt", noteKey: "lmQz.moment.return.note", options: [
        { id: "next", labelKey: "lmQz.moment.return.next" }, { id: "followup", labelKey: "lmQz.moment.return.followup" },
        { id: "recap", labelKey: "lmQz.moment.return.recap" }, { id: "nothing", labelKey: "lmQz.moment.return.nothing" },
      ]},
    ],
    pillars: [
      { labelKey: "lmQz.moment.p1", descKey: "lmQz.moment.p1desc" },
      { labelKey: "lmQz.moment.p2", descKey: "lmQz.moment.p2desc" },
      { labelKey: "lmQz.moment.p3", descKey: "lmQz.moment.p3desc" },
    ],
    objections: [
      { qKey: "lmQz.moment.faq1q", aKey: "lmQz.moment.faq1a" },
      { qKey: "lmQz.moment.faq2q", aKey: "lmQz.moment.faq2a" },
      { qKey: "lmQz.moment.faq3q", aKey: "lmQz.moment.faq3a" },
    ],
    result: (a, t) => ({
      score: 61 + [a.promise === "one_sentence", a.people === "proven", a.place === "confirmed", a.return === "next"].filter(Boolean).length * 9,
      name: t("lmQz.moment.result"),
      insight: t("lmQz.moment.insight"),
      moves: [t("lmQz.moment.move1"), t("lmQz.moment.move2"), t("lmQz.moment.move3")],
      route: "/propose",
      cta: t("lmQz.moment.cta"),
    }),
  },
  demand: {
    key: "demand", index: "03",
    eyebrowKey: "lmQz.demand.eyebrow", titleKey: "lmQz.demand.title", accentKey: "lmQz.demand.accent",
    promiseKey: "lmQz.demand.promise", proofKey: "lmQz.demand.proof", timeKey: "lmQz.demand.time", audienceKey: "lmQz.demand.audience",
    questions: [
      { id: "business", promptKey: "lmQz.demand.business.prompt", noteKey: "lmQz.demand.business.note", options: [
        { id: "food", labelKey: "lmQz.demand.business.food" }, { id: "retail", labelKey: "lmQz.demand.business.retail" },
        { id: "studio", labelKey: "lmQz.demand.business.studio" }, { id: "venue", labelKey: "lmQz.demand.business.venue" },
      ]},
      { id: "gap", promptKey: "lmQz.demand.gap.prompt", noteKey: "lmQz.demand.gap.note", options: [
        { id: "weekday", labelKey: "lmQz.demand.gap.weekday" }, { id: "afterwork", labelKey: "lmQz.demand.gap.afterwork" },
        { id: "late", labelKey: "lmQz.demand.gap.late" }, { id: "weekend", labelKey: "lmQz.demand.gap.weekend" },
      ]},
      { id: "strength", promptKey: "lmQz.demand.strength.prompt", noteKey: "lmQz.demand.strength.note", options: [
        { id: "atmosphere", labelKey: "lmQz.demand.strength.atmosphere" }, { id: "product", labelKey: "lmQz.demand.strength.product" },
        { id: "people", labelKey: "lmQz.demand.strength.people" }, { id: "location", labelKey: "lmQz.demand.strength.location" },
      ]},
      { id: "goal", promptKey: "lmQz.demand.goal.prompt", noteKey: "lmQz.demand.goal.note", options: [
        { id: "first", labelKey: "lmQz.demand.goal.first" }, { id: "basket", labelKey: "lmQz.demand.goal.basket" },
        { id: "repeat", labelKey: "lmQz.demand.goal.repeat" }, { id: "awareness", labelKey: "lmQz.demand.goal.awareness" },
      ]},
    ],
    pillars: [
      { labelKey: "lmQz.demand.p1", descKey: "lmQz.demand.p1desc" },
      { labelKey: "lmQz.demand.p2", descKey: "lmQz.demand.p2desc" },
      { labelKey: "lmQz.demand.p3", descKey: "lmQz.demand.p3desc" },
    ],
    objections: [
      { qKey: "lmQz.demand.faq1q", aKey: "lmQz.demand.faq1a" },
      { qKey: "lmQz.demand.faq2q", aKey: "lmQz.demand.faq2a" },
      { qKey: "lmQz.demand.faq3q", aKey: "lmQz.demand.faq3a" },
    ],
    result: (a, t) => {
      const gap = a.gap ? t((`lmQz.demand.gap.${a.gap}`) as TranslationKey) : t("lmQz.demand.gapFallback");
      const strength = a.strength ? t((`lmQz.demand.strength.${a.strength}`) as TranslationKey).toLowerCase() : t("lmQz.demand.strengthFallback");
      return {
        score: 73 + Object.keys(a).length * 4,
        name: t("lmQz.demand.result"),
        insight: t("lmQz.demand.insight", { gap, strength }),
        moves: [t("lmQz.demand.move1"), t("lmQz.demand.move2"), t("lmQz.demand.move3")],
        route: "/for-merchants",
        cta: t("lmQz.demand.cta"),
      };
    },
  },
  creator: {
    key: "creator", index: "04",
    eyebrowKey: "lmQz.creator.eyebrow", titleKey: "lmQz.creator.title", accentKey: "lmQz.creator.accent",
    promiseKey: "lmQz.creator.promise", proofKey: "lmQz.creator.proof", timeKey: "lmQz.creator.time", audienceKey: "lmQz.creator.audience",
    questions: [
      { id: "trust", promptKey: "lmQz.creator.trust.prompt", noteKey: "lmQz.creator.trust.note", options: [
        { id: "places", labelKey: "lmQz.creator.trust.places" }, { id: "products", labelKey: "lmQz.creator.trust.products" },
        { id: "ideas", labelKey: "lmQz.creator.trust.ideas" }, { id: "events", labelKey: "lmQz.creator.trust.events" },
      ]},
      { id: "response", promptKey: "lmQz.creator.response.prompt", noteKey: "lmQz.creator.response.note", options: [
        { id: "visit", labelKey: "lmQz.creator.response.visit" }, { id: "details", labelKey: "lmQz.creator.response.details" },
        { id: "save", labelKey: "lmQz.creator.response.save" }, { id: "untracked", labelKey: "lmQz.creator.response.untracked" },
      ]},
      { id: "format", promptKey: "lmQz.creator.format.prompt", noteKey: "lmQz.creator.format.note", options: [
        { id: "video", labelKey: "lmQz.creator.format.video" }, { id: "stories", labelKey: "lmQz.creator.format.stories" },
        { id: "longform", labelKey: "lmQz.creator.format.longform" }, { id: "hosting", labelKey: "lmQz.creator.format.hosting" },
      ]},
      { id: "value", promptKey: "lmQz.creator.value.prompt", noteKey: "lmQz.creator.value.note", options: [
        { id: "turnout", labelKey: "lmQz.creator.value.turnout" }, { id: "sales", labelKey: "lmQz.creator.value.sales" },
        { id: "content", labelKey: "lmQz.creator.value.content" }, { id: "communities", labelKey: "lmQz.creator.value.communities" },
      ]},
    ],
    pillars: [
      { labelKey: "lmQz.creator.p1", descKey: "lmQz.creator.p1desc" },
      { labelKey: "lmQz.creator.p2", descKey: "lmQz.creator.p2desc" },
      { labelKey: "lmQz.creator.p3", descKey: "lmQz.creator.p3desc" },
    ],
    objections: [
      { qKey: "lmQz.creator.faq1q", aKey: "lmQz.creator.faq1a" },
      { qKey: "lmQz.creator.faq2q", aKey: "lmQz.creator.faq2a" },
      { qKey: "lmQz.creator.faq3q", aKey: "lmQz.creator.faq3a" },
    ],
    result: (a, t) => {
      const valueKey = a.value ? (`lmQz.creator.valueFrag.${a.value}` as TranslationKey) : "lmQz.creator.valueFallback";
      const format = a.format ? t((`lmQz.creator.format.${a.format}`) as TranslationKey).toLowerCase() : t("lmQz.creator.formatFallback");
      return {
        score: a.response === "visit" ? 91 : a.response === "details" ? 84 : 76,
        name: t("lmQz.creator.result"),
        insight: t("lmQz.creator.insight", { value: t(valueKey), format }),
        moves: [t("lmQz.creator.move1"), t("lmQz.creator.move2"), t("lmQz.creator.move3")],
        route: "/for-creators",
        cta: t("lmQz.creator.cta"),
      };
    },
  },
  sponsor: {
    key: "sponsor", index: "05",
    eyebrowKey: "lmQz.sponsor.eyebrow", titleKey: "lmQz.sponsor.title", accentKey: "lmQz.sponsor.accent",
    promiseKey: "lmQz.sponsor.promise", proofKey: "lmQz.sponsor.proof", timeKey: "lmQz.sponsor.time", audienceKey: "lmQz.sponsor.audience",
    questions: [
      { id: "human", promptKey: "lmQz.sponsor.human.prompt", noteKey: "lmQz.sponsor.human.note", options: [
        { id: "discover", labelKey: "lmQz.sponsor.human.discover" }, { id: "belong", labelKey: "lmQz.sponsor.human.belong" },
        { id: "access", labelKey: "lmQz.sponsor.human.access" }, { id: "create", labelKey: "lmQz.sponsor.human.create" },
      ]},
      { id: "action", promptKey: "lmQz.sponsor.action.prompt", noteKey: "lmQz.sponsor.action.note", options: [
        { id: "attendance", labelKey: "lmQz.sponsor.action.attendance" }, { id: "visits", labelKey: "lmQz.sponsor.action.visits" },
        { id: "output", labelKey: "lmQz.sponsor.action.output" }, { id: "repeat", labelKey: "lmQz.sponsor.action.repeat" },
      ]},
      { id: "role", promptKey: "lmQz.sponsor.role.prompt", noteKey: "lmQz.sponsor.role.note", options: [
        { id: "enable", labelKey: "lmQz.sponsor.role.enable" }, { id: "reward", labelKey: "lmQz.sponsor.role.reward" },
        { id: "access", labelKey: "lmQz.sponsor.role.access" }, { id: "story", labelKey: "lmQz.sponsor.role.story" },
      ]},
      { id: "proof", promptKey: "lmQz.sponsor.proofQ.prompt", noteKey: "lmQz.sponsor.proofQ.note", options: [
        { id: "did", labelKey: "lmQz.sponsor.proofQ.did" }, { id: "creators", labelKey: "lmQz.sponsor.proofQ.creators" },
        { id: "commercial", labelKey: "lmQz.sponsor.proofQ.commercial" }, { id: "return", labelKey: "lmQz.sponsor.proofQ.return" },
      ]},
    ],
    pillars: [
      { labelKey: "lmQz.sponsor.p1", descKey: "lmQz.sponsor.p1desc" },
      { labelKey: "lmQz.sponsor.p2", descKey: "lmQz.sponsor.p2desc" },
      { labelKey: "lmQz.sponsor.p3", descKey: "lmQz.sponsor.p3desc" },
    ],
    objections: [
      { qKey: "lmQz.sponsor.faq1q", aKey: "lmQz.sponsor.faq1a" },
      { qKey: "lmQz.sponsor.faq2q", aKey: "lmQz.sponsor.faq2a" },
      { qKey: "lmQz.sponsor.faq3q", aKey: "lmQz.sponsor.faq3a" },
    ],
    result: (a, t) => {
      const human = a.human ? t((`lmQz.sponsor.human.${a.human}`) as TranslationKey).toLowerCase() : t("lmQz.sponsor.humanFallback");
      const proof = a.proof ? t((`lmQz.sponsor.proofQ.${a.proof}`) as TranslationKey).toLowerCase() : t("lmQz.sponsor.proofFallback");
      const action = a.action ? t((`lmQz.sponsor.action.${a.action}`) as TranslationKey).toLowerCase() : t("lmQz.sponsor.actionFallback");
      return {
        score: 86,
        name: t("lmQz.sponsor.result"),
        insight: t("lmQz.sponsor.insight", { human, proof }),
        moves: [t("lmQz.sponsor.move1"), t("lmQz.sponsor.move2", { action }), t("lmQz.sponsor.move3")],
        route: "/propose",
        cta: t("lmQz.sponsor.cta"),
      };
    },
  },
};

const funnelLinks = Object.values(funnels);

export default function LeadMagnetFunnels() {
  const { t } = useI18n();
  const { funnel = "scene" } = useParams();
  const config = funnels[funnel as FunnelKey] || funnels.scene;
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [captureError, setCaptureError] = useState("");
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const result = useMemo(() => config.result(answers, t), [answers, config, t]);
  const question = config.questions[step];
  const progress = ((step + (complete ? 1 : 0)) / config.questions.length) * 100;

  const begin = () => { setStarted(true); requestAnimationFrame(() => document.getElementById("diagnostic")?.scrollIntoView({ behavior: "smooth" })); };
  const select = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
    window.setTimeout(() => step < config.questions.length - 1 ? setStep(s => s + 1) : setComplete(true), 180);
  };
  const capture = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setCaptureError("");
    try {
      const attribution = captureGrowthAttribution();
      const response = await fetch(`${API_BASE_URL}/leads/capture`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
        email, fullName, organizationName, phone, funnelKey:config.key, answers, result,
        marketingConsent:consent, consentText:t("leadFunnel.consent"),
        attribution:attribution?.lastTouch || {}, anonymousId:getAnonymousId(), landingPath:`${window.location.pathname}${window.location.search}`, referrerUrl:document.referrer || null, website:"",
      }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || t("leadFunnel.saveFail"));
      localStorage.setItem(`promorang_lead_${config.key}`, JSON.stringify({ leadId:payload.data?.leadId,email,answers,result,capturedAt:new Date().toISOString() }));
      await trackGrowthEvent({eventName:"lead_magnet_captured",journey:config.key==="scene"?"participant":"commercial",stage:"captured",entityType:"crm_lead",entityId:payload.data?.leadId,properties:{funnelKey:config.key,qualification:payload.data?.qualification},idempotencyKey:`lead:${payload.data?.leadId}:${config.key}`});
      setSaved(true);
    } catch (error) { setCaptureError((error as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className={`lm-page lm-${config.key}`}>
      <SEO title={t("leadFunnel.seoTitle", { title: t(config.titleKey) })} description={t(config.promiseKey)} />
      <div className="lm-grain" aria-hidden="true" />
      <main>
        <section className="lm-hero">
          <div className="lm-shell lm-hero-grid">
            <div className="lm-hero-copy">
              <p className="lm-kicker"><span>{config.index}</span>{t(config.eyebrowKey)}</p>
              <h1>{t(config.titleKey)}<em>{t(config.accentKey)}</em></h1>
              <p className="lm-promise">{t(config.promiseKey)}</p>
              <div className="lm-actions">
                <button className="lm-primary" onClick={begin}>{t("leadFunnel.getResult")} <ArrowRight /></button>
                <span><Clock3 /> {t(config.timeKey)} · {t("leadFunnel.noAccount")}</span>
              </div>
              <p className="lm-fine"><LockKeyhole /> {t("leadFunnel.private")}</p>
            </div>
            <aside className="lm-report-card" aria-label={t("leadFunnel.reportAria")}>
              <div className="lm-report-top"><span>{t("leadFunnel.fieldReport")}</span><span>{t("leadFunnel.freeIndex", { index: config.index })}</span></div>
              <div className="lm-score-preview"><b>?</b><span>{t("leadFunnel.yourSignal")}</span></div>
              <p>{t(config.proofKey)}</p>
              <ul>{config.pillars.map(p => <li key={p.labelKey}><Check /> {t(p.labelKey)}</li>)}</ul>
              <div className="lm-stamp">{t("leadFunnel.builtFor")}<br/>{t("leadFunnel.notVanity")}</div>
            </aside>
          </div>
        </section>

        <section className="lm-trustbar" aria-label={t("leadFunnel.qualitiesAria")}>
          <div className="lm-shell"><span>{t(config.audienceKey)}</span><span>{t("leadFunnel.specific")}</span><span>{t("leadFunnel.immediate")}</span><span>{t("leadFunnel.noPdf")}</span></div>
        </section>

        <section className="lm-diagnostic" id="diagnostic">
          <div className="lm-shell">
            {!started ? (
              <div className="lm-intro">
                <p className="lm-section-label">{t("leadFunnel.freeDiag")}</p>
                <h2>{t("leadFunnel.introTitle")}</h2>
                <p>{t("leadFunnel.introCopy")}</p>
                <button className="lm-primary" onClick={begin}>{t("leadFunnel.startNow")} <ArrowRight /></button>
              </div>
            ) : !complete ? (
              <div className="lm-question-card" aria-live="polite">
                <div className="lm-progress"><span style={{ width: `${progress}%` }} /></div>
                <p className="lm-section-label">{t("leadFunnel.questionOf", { n: step + 1, total: config.questions.length })}</p>
                <h2>{t(question.promptKey)}</h2>
                <p>{t(question.noteKey)}</p>
                <div className="lm-options">
                  {question.options.map((option, i) => <button key={option.id} onClick={() => select(option.id)} className={answers[question.id] === option.id ? "selected" : ""}><span>{String(i + 1).padStart(2, "0")}</span>{t(option.labelKey)}<ArrowRight /></button>)}
                </div>
                {step > 0 && <button className="lm-back" onClick={() => setStep(s => s - 1)}><ChevronLeft /> {t("leadFunnel.previous")}</button>}
              </div>
            ) : (
              <div className="lm-result" aria-live="polite">
                <div className="lm-result-heading">
                  <div className="lm-result-score"><b>{Math.min(result.score, 97)}</b><span>{t("leadFunnel.signal")}</span></div>
                  <div><p className="lm-section-label">{t("leadFunnel.yourResult")}</p><h2>{result.name}</h2><p>{result.insight}</p></div>
                </div>
                <div className="lm-moves">
                  <h3>{t("leadFunnel.threeMoves")}</h3>
                  {result.moves.map((move, i) => <div key={move}><span>0{i + 1}</span><p>{move}</p></div>)}
                </div>
                <form className="lm-capture" onSubmit={capture}>
                  <div><p className="lm-section-label">{t("leadFunnel.keepResult")}</p><h3>{t("leadFunnel.emailReport")}</h3><p>{t("leadFunnel.alsoSend")}</p></div>
                  <div className="lm-capture-fields">
                    <div className="lm-field-row"><label><span>{t("leadFunnel.yourName")}</span><input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder={t("leadFunnel.namePh")}/></label><label><span>{t("leadFunnel.org")} <i>{t("leadFunnel.optional")}</i></span><input value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder={t("leadFunnel.orgPh")}/></label></div>
                    <div className="lm-field-row"><label><span>{t("leadFunnel.email")}</span><input type="email" required value={email} onChange={e => { setEmail(e.target.value); setSaved(false); }} placeholder={t("leadFunnel.emailPh")}/></label><label><span>{t("leadFunnel.phone")} <i>{t("leadFunnel.optional")}</i></span><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t("leadFunnel.phonePh")}/></label></div>
                    <label className="lm-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{t("leadFunnel.consent")}</span></label>
                    <input className="lm-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website"/>
                    <button className="lm-send" type="submit" disabled={saving}>{saving?t("leadFunnel.saving"):t("leadFunnel.saveReport")}</button>
                    {saved && <p className="lm-saved" role="status"><Check /> {t("leadFunnel.saved")}</p>}{captureError&&<p className="lm-capture-error" role="alert">{captureError}</p>}
                  </div>
                </form>
                <Link className="lm-primary lm-result-cta" to={result.route}>{result.cta} <ArrowRight /></Link>
              </div>
            )}
          </div>
        </section>

        <section className="lm-value">
          <div className="lm-shell">
            <p className="lm-section-label">{t("leadFunnel.whatChanges")}</p>
            <div className="lm-value-grid">
              <div><h2>{t("leadFunnel.clarityTitle")}</h2><p>{t("leadFunnel.clarityCopy")}</p></div>
              <div className="lm-pillar-list">{config.pillars.map((pillar, i) => <article key={pillar.labelKey}><span>0{i + 1}</span><div><h3>{t(pillar.labelKey)}</h3><p>{t(pillar.descKey)}</p></div></article>)}</div>
            </div>
          </div>
        </section>

        <section className="lm-logic">
          <div className="lm-shell lm-logic-grid">
            <div className="lm-logic-icon"><Lightbulb /></div>
            <blockquote>“{t("leadFunnel.quote")}”</blockquote>
            <p>{t("leadFunnel.quoteAfter")}</p>
          </div>
        </section>

        <section className="lm-faq">
          <div className="lm-shell">
            <p className="lm-section-label">{t("leadFunnel.reasonable")}</p>
            <h2>{t("leadFunnel.beforeMinutes")}</h2>
            <div>{config.objections.map((item, i) => <details key={item.qKey}><summary><span>0{i + 1}</span>{t(item.qKey)}</summary><p>{t(item.aKey)}</p></details>)}</div>
          </div>
        </section>

        <section className="lm-final">
          <div className="lm-shell">
            <Sparkles />
            <p className="lm-section-label">{t("leadFunnel.freeUseful")}</p>
            <h2>{t(config.titleKey)}</h2>
            <p>{t(config.promiseKey)}</p>
            <button className="lm-primary" onClick={begin}>{t("leadFunnel.getMyResult")} <ArrowRight /></button>
          </div>
        </section>

        <nav className="lm-more" aria-label={t("leadFunnel.moreNavAria")}>
          <div className="lm-shell"><p>{t("leadFunnel.moreReports")}</p><div>{funnelLinks.filter(f => f.key !== config.key).map(f => <Link key={f.key} to={`/free/${f.key}`}><span>{f.index}</span>{t(f.titleKey)}<ArrowRight /></Link>)}</div></div>
        </nav>
      </main>
    </div>
  );
}
