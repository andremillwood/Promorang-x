import { FormEvent, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft, Clock3, Lightbulb, LockKeyhole, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { API_BASE_URL } from "@/lib/api";
import { captureGrowthAttribution, getAnonymousId, trackGrowthEvent } from "@/lib/marketing-attribution";
import "./LeadMagnetFunnels.css";

type FunnelKey = "scene" | "moment" | "demand" | "creator" | "sponsor";
type AnswerMap = Record<string, string>;

type Funnel = {
  key: FunnelKey;
  index: string;
  eyebrow: string;
  title: string;
  accent: string;
  promise: string;
  proof: string;
  time: string;
  audience: string;
  questions: { id: string; prompt: string; note: string; options: string[] }[];
  pillars: { label: string; description: string }[];
  objections: { q: string; a: string }[];
  result: (answers: AnswerMap) => { score: number; name: string; insight: string; moves: string[]; route: string; cta: string };
};

const funnels: Record<FunnelKey, Funnel> = {
  scene: {
    key: "scene", index: "01", eyebrow: "A 2-minute social compass", title: "Find your Scene.", accent: "Stop searching. Start belonging.",
    promise: "Get a personal read on the rooms, people and Moments most likely to feel like your kind of life — before you commit your evening.",
    proof: "Built around what you want to feel, not what an algorithm wants you to click.", time: "2 minutes", audience: "For people who want better plans",
    questions: [
      { id: "energy", prompt: "What should a good night give you?", note: "Choose the feeling you want more of.", options: ["New energy and surprise", "Real conversation", "Creative inspiration", "A sense of belonging"] },
      { id: "room", prompt: "Which room sounds easiest to say yes to?", note: "There is no aspirational answer here.", options: ["A lively crowd", "A small, curated table", "A workshop or studio", "A familiar neighbourhood spot"] },
      { id: "reward", prompt: "What makes showing up feel worthwhile?", note: "Your result will prioritise this.", options: ["Meeting the right people", "Access I would not find alone", "A memory worth keeping", "A useful offer or reward"] },
      { id: "timing", prompt: "When are you easiest to move?", note: "We will avoid plans that fight your real life.", options: ["After work", "Friday night", "Weekend daytime", "Sunday reset"] },
    ],
    pillars: [
      { label: "A Scene profile", description: "A useful identity based on the environments where you are most likely to come alive." },
      { label: "A sharper shortlist", description: "Moments, places and people filtered by fit—not a wall of listings." },
      { label: "A first move", description: "One low-friction way to step in without needing to already know someone." },
    ],
    objections: [
      { q: "Is this another personality quiz?", a: "No. The result is designed to change what you can do next: what to explore, who to follow and which Moment is your easiest doorway in." },
      { q: "Do I need an account?", a: "Not to see your result. Create one only if you want to save it and receive matching invitations." },
      { q: "Will you sell my answers?", a: "No. Your preferences exist to improve your experience and aggregate demand signals, not expose your personal responses." },
    ],
    result: (a) => ({ score: 78 + Object.keys(a).length * 3, name: a.room?.includes("small") ? "The Curated Table" : a.room?.includes("studio") ? "The Creative Current" : a.room?.includes("neighbourhood") ? "The Local Ritual" : "The Live Current", insight: `You do not need more things to do. You need ${a.energy?.toLowerCase() || "the right energy"} in a room that feels easy to enter.`, moves: ["Follow one Scene that matches your pace", "Choose a Moment with a clear host and promise", "Bring one person—or arrive through the guest list"], route: "/discover", cta: "See Moments for me" }),
  },
  moment: {
    key: "moment", index: "02", eyebrow: "The launch-before-you-launch diagnostic", title: "Score your Moment.", accent: "Know what will move people before you spend.",
    promise: "Get a practical read on attendance, sponsor appeal and repeat potential — plus the three changes most likely to strengthen your idea.",
    proof: "A generous idea is not automatically an easy yes. We test the promise, the room and the reason to return.", time: "4 minutes", audience: "For hosts and community builders",
    questions: [
      { id: "promise", prompt: "How quickly can someone understand the human payoff?", note: "Not the agenda—the change they leave with.", options: ["In one sentence", "After a little explanation", "It depends who asks", "We are still finding it"] },
      { id: "people", prompt: "Who can you reliably reach today?", note: "Count trust, not followers.", options: ["A proven returning community", "A warm list or group", "Several partner audiences", "Mostly cold reach"] },
      { id: "place", prompt: "How strong is the place and timing?", note: "Friction quietly kills good ideas.", options: ["Confirmed and audience-friendly", "Likely, with details pending", "Several options", "Still open"] },
      { id: "return", prompt: "What happens after people attend?", note: "A Moment should make the next one easier.", options: ["A clear next invitation", "A community follow-up", "A recap and thank-you", "Nothing planned yet"] },
    ],
    pillars: [
      { label: "Attendance readiness", description: "Whether the promise, audience, place and timing make the decision easy." },
      { label: "Partner value", description: "What a venue, creator, merchant or sponsor can meaningfully gain." },
      { label: "Return potential", description: "Whether one gathering creates memory, proof and demand for the next." },
    ],
    objections: [
      { q: "Does a low score mean the idea is bad?", a: "No. It means the invitation has avoidable friction. The diagnostic focuses on changes you can make before spending heavily." },
      { q: "Is this only for ticketed events?", a: "No. It works for community gatherings, launches, workshops, in-store activations and recurring rituals." },
      { q: "What happens to my concept?", a: "It remains yours. Your answers are used to create your report and, if you choose, a draft Promorang activation." },
    ],
    result: (a) => ({ score: 61 + Object.values(a).filter(v => /one sentence|proven|confirmed|clear next/.test(v)).length * 9, name: "Your Moment Readiness", insight: "The idea has energy. Its biggest opportunity is making the social payoff obvious enough that the right person can decide in seconds.", moves: ["Rewrite the promise as one human outcome", "Name the first 25 people, not the total audience", "Design the return invitation before launch"], route: "/propose", cta: "Turn this into an activation" }),
  },
  demand: {
    key: "demand", index: "03", eyebrow: "A local growth opportunity scan", title: "Reveal nearby demand.", accent: "Your slow hours may be someone else’s perfect ritual.",
    promise: "Find the audience, Moment and offer shape most likely to turn nearby attention into a visit — without starting with a discount.",
    proof: "People rarely need another coupon. They need a compelling reason to go somewhere now, with the right people.", time: "3 minutes", audience: "For merchants and venues",
    questions: [
      { id: "business", prompt: "What kind of place are you growing?", note: "We use this to shape the visit, not box you in.", options: ["Food or drink", "Retail or beauty", "Studio or service", "Venue or experience"] },
      { id: "gap", prompt: "Where is the most valuable unused capacity?", note: "Empty capacity is perishable inventory.", options: ["Weekday daytime", "After work", "Late evening", "Weekend off-peak"] },
      { id: "strength", prompt: "What would people tell a friend about?", note: "The offer should amplify a truth you already own.", options: ["The atmosphere", "A signature product", "The people and service", "The location or space"] },
      { id: "goal", prompt: "Which outcome matters first?", note: "One clear outcome makes a better pilot.", options: ["More first visits", "Higher basket value", "Repeat visits", "Creator content and awareness"] },
    ],
    pillars: [
      { label: "Demand window", description: "The time and audience combination where unused capacity becomes an advantage." },
      { label: "Visit trigger", description: "A reason to come that protects brand value better than blanket discounting." },
      { label: "Measurable pilot", description: "One offer, one Scene and one outcome you can verify before scaling." },
    ],
    objections: [
      { q: "Will this tell me to discount?", a: "Not by default. Access, ritual, discovery, collaboration and limited experiences can be stronger triggers than lower prices." },
      { q: "Do I need sophisticated systems?", a: "No. A pilot can begin with one time window, one offer and a trackable Promorang action." },
      { q: "Is this only for Kingston?", a: "The diagnostic works anywhere. Recommendations become richer where Promorang has active Scenes and partners." },
    ],
    result: (a) => ({ score: 73 + Object.keys(a).length * 4, name: "Your Demand Opening", insight: `${a.gap || "Your quieter window"} can become a recognisable ritual when the invitation leads with ${a.strength?.toLowerCase() || "what your place already does well"}, not a generic promotion.`, moves: ["Choose one two-hour demand window", "Package a reason to visit, not just a price", "Pair it with one trusted host or creator"], route: "/for-merchants", cta: "Build my first pilot" }),
  },
  creator: {
    key: "creator", index: "04", eyebrow: "An influence-to-action audit", title: "Measure what your taste can move.", accent: "Reach is rented. Movement is a reputation.",
    promise: "See where your audience trust is most commercially useful — visits, attendance, discovery, conversion or repeat behaviour.",
    proof: "A smaller audience that acts can be more valuable than a large audience that scrolls past.", time: "3 minutes", audience: "For creators with trusted taste",
    questions: [
      { id: "trust", prompt: "What does your audience copy most often?", note: "Look for behaviour, not compliments.", options: ["Places I visit", "Products I choose", "Ideas or skills I teach", "Events and communities I join"] },
      { id: "response", prompt: "What happens when you make a strong recommendation?", note: "Use the pattern you can honestly repeat.", options: ["People visit or buy", "People ask for details", "People save and share", "I have not tracked it"] },
      { id: "format", prompt: "Where does your point of view land best?", note: "The best campaign should feel native to your craft.", options: ["Short video", "Stories and live updates", "Long-form guides", "In-person hosting"] },
      { id: "value", prompt: "What would you most like to prove?", note: "This becomes the spine of your impact record.", options: ["I drive turnout", "I drive visits or sales", "I create valuable content", "I grow trusted communities"] },
    ],
    pillars: [
      { label: "Trust advantage", description: "The recommendation behaviour your audience already responds to." },
      { label: "Best-fit brief", description: "The mission and format most likely to feel credible coming from you." },
      { label: "Proof to build", description: "The action record that makes future rates and partnerships easier to defend." },
    ],
    objections: [
      { q: "Is this only for big influencers?", a: "No. It is designed to surface trust and movement, which often makes focused communities unusually valuable." },
      { q: "Is this affiliate marketing?", a: "It can include conversion, but it also measures visits, attendance, participation, content and repeat movement." },
      { q: "Will the score be public?", a: "No. Your result is private unless you choose to turn verified work into a public impact record." },
    ],
    result: (a) => ({ score: a.response?.includes("visit") ? 91 : a.response?.includes("details") ? 84 : 76, name: "Your Movement Advantage", insight: `Your strongest commercial story is not “I post.” It is “I help people ${a.value?.replace("I ", "").toLowerCase() || "take meaningful action"} through ${a.format?.toLowerCase() || "trusted content"}."`, moves: ["Choose one behaviour to prove", "Build a brief around your native format", "Capture the join, visit or unlock—not just views"], route: "/for-creators", cta: "Find a creator mission" }),
  },
  sponsor: {
    key: "sponsor", index: "05", eyebrow: "A sponsor-ready activation brief", title: "Turn budget into behaviour.", accent: "Make culture happen—and know what happened next.",
    promise: "Shape a one-page activation direction connecting a human outcome to creators, places, participation and measurable commercial return.",
    proof: "The strongest sponsorship is not a logo near culture. It gives people something worth doing together.", time: "5 minutes", audience: "For brands and agencies",
    questions: [
      { id: "human", prompt: "What should become better for people?", note: "Begin here; mechanics come later.", options: ["They discover something new", "They feel they belong", "They gain useful access", "They create or contribute"] },
      { id: "action", prompt: "Which behaviour would make the investment meaningful?", note: "Choose the outcome leadership will care about.", options: ["Qualified attendance", "Visits or redemptions", "Creator output", "Repeat participation"] },
      { id: "role", prompt: "How should the brand show up?", note: "Credibility often comes from restraint.", options: ["Enable the experience", "Reward participation", "Open access", "Commission the story"] },
      { id: "proof", prompt: "What proof is missing from current campaigns?", note: "Your brief will make this visible.", options: ["What people actually did", "Which creators moved action", "What commercial value returned", "Why people came back"] },
    ],
    pillars: [
      { label: "Human promise", description: "A reason people would choose to participate even without the media plan." },
      { label: "Activation system", description: "The right combination of Scene, Moment, creator, place and participant value." },
      { label: "Value receipt", description: "A legible record of presence, content, access, commerce and return." },
    ],
    objections: [
      { q: "Is this a full campaign proposal?", a: "It is the strategic spine: enough to align a team and identify the right next conversation. Execution scope and pricing follow." },
      { q: "Does Promorang replace our agency?", a: "No. Promorang can equip agencies with participation infrastructure, partner coordination and outcome records." },
      { q: "Can this work with an existing campaign?", a: "Yes. The brief can add a real-world participation and measurement layer to an existing platform or media idea." },
    ],
    result: (a) => ({ score: 86, name: "Your Activation Direction", insight: `Position the brand as the one that helps people ${a.human?.toLowerCase() || "participate"}. Let the experience lead; let ${a.proof?.toLowerCase() || "verified action"} justify the investment.`, moves: ["Write the human promise before the media line", `Design for ${a.action?.toLowerCase() || "one qualified action"}`, "Fund a small, measurable Moment before scaling"], route: "/propose", cta: "Develop the campaign brief" }),
  },
};

const funnelLinks = Object.values(funnels);

export default function LeadMagnetFunnels() {
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
  const result = useMemo(() => config.result(answers), [answers, config]);
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
        marketingConsent:consent, consentText:"I want relevant Promorang opportunities and updates. I can unsubscribe at any time.",
        attribution:attribution?.lastTouch || {}, anonymousId:getAnonymousId(), landingPath:`${window.location.pathname}${window.location.search}`, referrerUrl:document.referrer || null, website:"",
      }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Could not save your report");
      localStorage.setItem(`promorang_lead_${config.key}`, JSON.stringify({ leadId:payload.data?.leadId,email,answers,result,capturedAt:new Date().toISOString() }));
      await trackGrowthEvent({eventName:"lead_magnet_captured",journey:config.key==="scene"?"participant":"commercial",stage:"captured",entityType:"crm_lead",entityId:payload.data?.leadId,properties:{funnelKey:config.key,qualification:payload.data?.qualification},idempotencyKey:`lead:${payload.data?.leadId}:${config.key}`});
      setSaved(true);
    } catch (error) { setCaptureError((error as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className={`lm-page lm-${config.key}`}>
      <SEO title={`${config.title} Free Promorang Diagnostic`} description={config.promise} />
      <div className="lm-grain" aria-hidden="true" />
      <main>
        <section className="lm-hero">
          <div className="lm-shell lm-hero-grid">
            <div className="lm-hero-copy">
              <p className="lm-kicker"><span>{config.index}</span>{config.eyebrow}</p>
              <h1>{config.title}<em>{config.accent}</em></h1>
              <p className="lm-promise">{config.promise}</p>
              <div className="lm-actions">
                <button className="lm-primary" onClick={begin}>Get my free result <ArrowRight /></button>
                <span><Clock3 /> {config.time} · No account required</span>
              </div>
              <p className="lm-fine"><LockKeyhole /> Your result is private. Save it only if it is useful.</p>
            </div>
            <aside className="lm-report-card" aria-label="What you receive">
              <div className="lm-report-top"><span>Promorang field report</span><span>Free / {config.index}</span></div>
              <div className="lm-score-preview"><b>?</b><span>YOUR<br/>SIGNAL</span></div>
              <p>{config.proof}</p>
              <ul>{config.pillars.map(p => <li key={p.label}><Check /> {p.label}</li>)}</ul>
              <div className="lm-stamp">Built for action<br/>not vanity</div>
            </aside>
          </div>
        </section>

        <section className="lm-trustbar" aria-label="Diagnostic qualities">
          <div className="lm-shell"><span>{config.audience}</span><span>Specific recommendations</span><span>Immediate result</span><span>No generic PDF</span></div>
        </section>

        <section className="lm-diagnostic" id="diagnostic">
          <div className="lm-shell">
            {!started ? (
              <div className="lm-intro">
                <p className="lm-section-label">Your free diagnostic</p>
                <h2>A useful answer begins with four honest ones.</h2>
                <p>Do not choose what sounds impressive. Choose what is already true—or what you actually want.</p>
                <button className="lm-primary" onClick={begin}>Start now <ArrowRight /></button>
              </div>
            ) : !complete ? (
              <div className="lm-question-card" aria-live="polite">
                <div className="lm-progress"><span style={{ width: `${progress}%` }} /></div>
                <p className="lm-section-label">Question {step + 1} of {config.questions.length}</p>
                <h2>{question.prompt}</h2>
                <p>{question.note}</p>
                <div className="lm-options">
                  {question.options.map((option, i) => <button key={option} onClick={() => select(option)} className={answers[question.id] === option ? "selected" : ""}><span>{String(i + 1).padStart(2, "0")}</span>{option}<ArrowRight /></button>)}
                </div>
                {step > 0 && <button className="lm-back" onClick={() => setStep(s => s - 1)}><ChevronLeft /> Previous question</button>}
              </div>
            ) : (
              <div className="lm-result" aria-live="polite">
                <div className="lm-result-heading">
                  <div className="lm-result-score"><b>{Math.min(result.score, 97)}</b><span>/100<br/>signal</span></div>
                  <div><p className="lm-section-label">Your result</p><h2>{result.name}</h2><p>{result.insight}</p></div>
                </div>
                <div className="lm-moves">
                  <h3>Your three highest-leverage moves</h3>
                  {result.moves.map((move, i) => <div key={move}><span>0{i + 1}</span><p>{move}</p></div>)}
                </div>
                <form className="lm-capture" onSubmit={capture}>
                  <div><p className="lm-section-label">Keep the result</p><h3>Email this field report to yourself.</h3><p>We will also send relevant Promorang opportunities. Unsubscribe anytime.</p></div>
                  <div className="lm-capture-fields">
                    <div className="lm-field-row"><label><span>Your name</span><input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="How should we address you?"/></label><label><span>Organization <i>optional</i></span><input value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="Business or community"/></label></div>
                    <div className="lm-field-row"><label><span>Email</span><input type="email" required value={email} onChange={e => { setEmail(e.target.value); setSaved(false); }} placeholder="you@example.com"/></label><label><span>Phone <i>optional</i></span><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="For requested follow-up"/></label></div>
                    <label className="lm-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Send me relevant Promorang opportunities and updates. I can unsubscribe at any time.</span></label>
                    <input className="lm-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website"/>
                    <button className="lm-send" type="submit" disabled={saving}>{saving?"Saving…":"Save my report"}</button>
                    {saved && <p className="lm-saved" role="status"><Check /> Your report is saved and your next Promorang route is ready.</p>}{captureError&&<p className="lm-capture-error" role="alert">{captureError}</p>}
                  </div>
                </form>
                <Link className="lm-primary lm-result-cta" to={result.route}>{result.cta} <ArrowRight /></Link>
              </div>
            )}
          </div>
        </section>

        <section className="lm-value">
          <div className="lm-shell">
            <p className="lm-section-label">What changes after this</p>
            <div className="lm-value-grid">
              <div><h2>Clarity is only valuable when it changes the next move.</h2><p>So your report does not end with a label. It reveals a practical route into Promorang’s network of people, places, creators, Moments and commercial opportunities.</p></div>
              <div className="lm-pillar-list">{config.pillars.map((pillar, i) => <article key={pillar.label}><span>0{i + 1}</span><div><h3>{pillar.label}</h3><p>{pillar.description}</p></div></article>)}</div>
            </div>
          </div>
        </section>

        <section className="lm-logic">
          <div className="lm-shell lm-logic-grid">
            <div className="lm-logic-icon"><Lightbulb /></div>
            <blockquote>“Most people do not need more information. They need the right decision to feel easier.”</blockquote>
            <p>Promorang turns intent into a next action, then lets verified participation improve the recommendations and opportunities that follow.</p>
          </div>
        </section>

        <section className="lm-faq">
          <div className="lm-shell">
            <p className="lm-section-label">Reasonable questions</p>
            <h2>Before you give us two minutes.</h2>
            <div>{config.objections.map((item, i) => <details key={item.q}><summary><span>0{i + 1}</span>{item.q}</summary><p>{item.a}</p></details>)}</div>
          </div>
        </section>

        <section className="lm-final">
          <div className="lm-shell">
            <Sparkles />
            <p className="lm-section-label">Free · useful · immediate</p>
            <h2>{config.title}</h2>
            <p>{config.promise}</p>
            <button className="lm-primary" onClick={begin}>Get my result <ArrowRight /></button>
          </div>
        </section>

        <nav className="lm-more" aria-label="More free Promorang tools">
          <div className="lm-shell"><p>More free field reports</p><div>{funnelLinks.filter(f => f.key !== config.key).map(f => <Link key={f.key} to={`/free/${f.key}`}><span>{f.index}</span>{f.title}<ArrowRight /></Link>)}</div></div>
        </nav>
      </main>
    </div>
  );
}
