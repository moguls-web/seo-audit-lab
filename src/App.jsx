import { useState, useEffect, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from "recharts";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`;

const SYSTEM = `You are an expert SEO auditor. Analyze the URL and return ONLY valid compact JSON (no markdown, no backticks, no preamble). All text ≤12 words each. Exact schema:
{"overall_score":INT,"business_type":"STRING","summary":"Two short sentences max.","critical_issues":["STR","STR","STR"],"quick_wins":["STR","STR","STR"],"categories":[{"name":"Technical SEO","score":INT,"weight":22,"issues":["STR","STR"],"recommendations":["STR","STR"]},{"name":"Content Quality","score":INT,"weight":23,"issues":["STR","STR"],"recommendations":["STR","STR"]},{"name":"On-Page SEO","score":INT,"weight":20,"issues":["STR","STR"],"recommendations":["STR","STR"]},{"name":"Schema & Structure","score":INT,"weight":10,"issues":["STR","STR"],"recommendations":["STR","STR"]},{"name":"Performance","score":INT,"weight":10,"issues":["STR","STR"],"recommendations":["STR","STR"]},{"name":"AI Readiness","score":INT,"weight":10,"issues":["STR","STR"],"recommendations":["STR","STR"]},{"name":"Images","score":INT,"weight":5,"issues":["STR","STR"],"recommendations":["STR","STR"]}],"action_plan":[{"priority":"Critical","action":"STR","impact":"High","effort":"Low","timeline":"Week 1"},{"priority":"High","action":"STR","impact":"High","effort":"Medium","timeline":"Week 2-4"},{"priority":"High","action":"STR","impact":"Medium","effort":"Low","timeline":"Week 2-4"},{"priority":"Medium","action":"STR","impact":"Medium","effort":"Medium","timeline":"Month 2-3"},{"priority":"Low","action":"STR","impact":"Low","effort":"Low","timeline":"Backlog"}]}`;

const scoreColor = s => s >= 80 ? "#22c55e" : s >= 60 ? "#f0a030" : "#ef4444";
const scoreLabel = s => s >= 80 ? "Excellent" : s >= 60 ? "Needs Work" : "Critical";

const STEPS = [
  "Fetching homepage structure...",
  "Detecting business type...",
  "Checking technical signals...",
  "Auditing content quality...",
  "Validating schema markup...",
  "Measuring performance...",
  "Assessing AI readiness...",
  "Generating action plan...",
];

function ScoreGauge({ score }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf, start = null, dur = 1400;
    const animate = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setShown(Math.round(p * p * score));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const r = 64, cx = 80, cy = 80;
  const circ = Math.PI * r;
  const fill = (shown / 100) * circ;
  const col = scoreColor(shown);

  return (
    <svg width="160" height="100" viewBox="0 0 160 100" style={{ overflow: "visible" }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#1c1f2e" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={col} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        style={{ transition: "none" }} />
      <text x={cx} y={cy - 10} textAnchor="middle" fill={col}
        fontSize="34" fontFamily="'Outfit', sans-serif" fontWeight="800">{shown}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#5a6070"
        fontSize="11" fontFamily="'JetBrains Mono', monospace" letterSpacing="2">
        {scoreLabel(shown).toUpperCase()}
      </text>
    </svg>
  );
}

function AnimBar({ score }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 80); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ height: 5, background: "#1c1f2e", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: scoreColor(score), borderRadius: 99, transition: "width 1.1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

const PCOL = { Critical: "#ef4444", High: "#f0a030", Medium: "#3b82f6", Low: "#6b7280" };

export default function SEOAuditLab() {
  const [phase, setPhase] = useState("input");
  const [url, setUrl] = useState("");
  const [step, setStep] = useState(0);
  const [audit, setAudit] = useState(null);
  const [err, setErr] = useState("");
  const [cat, setCat] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONTS + `
      *{box-sizing:border-box;margin:0;padding:0}
      body,html{background:#07080f;min-height:100vh}
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-track{background:#0b0c14}
      ::-webkit-scrollbar-thumb{background:#22253a;border-radius:2px}
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      .fu{animation:fadeUp .55s ease-out forwards}
      .fu2{animation:fadeUp .55s .12s ease-out both}
      .fu3{animation:fadeUp .55s .24s ease-out both}
      .fu4{animation:fadeUp .55s .36s ease-out both}
      .blink{animation:pulse 1.2s ease-in-out infinite}
      .spin{animation:spin 1s linear infinite}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const iv = setInterval(() => setStep(s => (s + 1) % STEPS.length), 750);
    return () => clearInterval(iv);
  }, [phase]);

  const runAudit = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setPhase("loading"); setErr(""); setStep(0);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM,
          messages: [{ role: "user", content: `SEO audit for: ${trimmed}` }]
        })
      });
      const data = await res.json();
      const raw = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAudit(parsed);
      setCat(parsed.categories[0]);
      setPhase("results");
    } catch (e) {
      setErr("Audit failed — check the URL and try again.");
      setPhase("input");
    }
  };

  if (phase === "input") return (
    <div style={{ minHeight: "100vh", background: "#07080f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(240,160,48,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(240,160,48,.03) 1px,transparent 1px)", backgroundSize: "52px 52px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(240,160,48,.06) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 560 }}>
        <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(240,160,48,.08)", border: "1px solid rgba(240,160,48,.2)", borderRadius: 100, padding: "6px 18px", marginBottom: 32 }}>
          <span className="blink" style={{ width: 7, height: 7, borderRadius: "50%", background: "#f0a030", display: "inline-block" }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#f0a030", letterSpacing: 3 }}>SEO AUDIT LAB · v2.0</span>
        </div>
        <h1 className="fu2" style={{ fontSize: "clamp(48px,9vw,80px)", fontWeight: 800, color: "#f0ece4", lineHeight: .96, letterSpacing: -3, marginBottom: 22 }}>
          Audit any<br /><span style={{ color: "#f0a030" }}>website.</span>
        </h1>
        <p className="fu3" style={{ color: "#5a6070", fontSize: 16, lineHeight: 1.75, marginBottom: 40, maxWidth: 380, margin: "0 auto 40px" }}>
          Powered by Claude. Scores across 7 categories — technical, content, schema, performance & more.
        </p>
        <div className="fu3" style={{ display: "flex", gap: 10, maxWidth: 500, margin: "0 auto 12px" }}>
          <input ref={inputRef} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && runAudit()}
            placeholder="https://yourwebsite.com"
            style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "15px 20px", color: "#f0ece4", fontSize: 15, fontFamily: "'JetBrains Mono',monospace", outline: "none", transition: "border-color .2s", }}
            onFocus={e => e.target.style.borderColor = "rgba(240,160,48,.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"} />
          <button onClick={runAudit} style={{ background: "#f0a030", border: "none", borderRadius: 12, padding: "15px 24px", color: "#07080f", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", letterSpacing: .5, transition: "all .18s", whiteSpace: "nowrap" }}
            onMouseEnter={e => e.target.style.background = "#ffc04a"}
            onMouseLeave={e => e.target.style.background = "#f0a030"}>
            RUN AUDIT →
          </button>
        </div>
        {err && <p className="fu" style={{ color: "#ef4444", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", marginTop: 8 }}>{err}</p>}
        <div className="fu4" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 36 }}>
          {["Technical", "Content", "On-Page", "Schema", "Performance", "AI Readiness", "Images"].map(t => (
            <span key={t} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 100, padding: "5px 14px", color: "#363a4f", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", letterSpacing: .5 }}>{t}</span>
          ))}
        </div>
        <p className="fu4" style={{ color: "#363a4f", fontSize: 12, marginTop: 28, fontFamily: "'JetBrains Mono',monospace" }}>
          Analysis based on Claude's knowledge · not a live crawl
        </p>
      </div>
    </div>
  );

  if (phase === "loading") return (
    <div style={{ minHeight: "100vh", background: "#07080f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 420, padding: 40 }}>
        <div style={{ width: 72, height: 72, margin: "0 auto 28px", position: "relative" }}>
          <svg className="spin" width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#1c1f2e" strokeWidth="3" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="#f0a030" strokeWidth="3"
              strokeLinecap="round" strokeDasharray="52 136" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🔍</div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", color: "#f0a030", fontSize: 11, letterSpacing: 3, marginBottom: 14 }}>ANALYZING</div>
        <div style={{ color: "#f0ece4", fontSize: 17, fontWeight: 600, marginBottom: 32, wordBreak: "break-all" }}>{url}</div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "20px 24px", textAlign: "left" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", opacity: i === step ? 1 : i < step ? .35 : .12, transition: "opacity .3s" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: i < step ? "#22c55e" : i === step ? "#f0a030" : "#363a4f", minWidth: 12 }}>
                {i < step ? "✓" : i === step ? "▶" : "○"}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: i === step ? "#f0ece4" : "#5a6070" }}>{s}</span>
              {i === step && <span className="blink" style={{ color: "#f0a030", fontSize: 12 }}>_</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (phase === "results" && audit) {
    const radarData = audit.categories.map(c => ({ subject: c.name.replace(" & Structure", "").replace(" Quality", "").replace("On-Page", "On-Page"), score: c.score }));

    return (
      <div style={{ minHeight: "100vh", background: "#07080f", fontFamily: "'Outfit',sans-serif", color: "#f0ece4", paddingBottom: 60 }}>
        {/* Topbar */}
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,8,15,.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#f0a030", letterSpacing: 2 }}>AUDIT COMPLETE</span>
            <span style={{ color: "#22253a" }}>|</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#363a4f", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
          </div>
          <button onClick={() => { setPhase("input"); setAudit(null); setCat(null); setUrl(""); }}
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "6px 14px", color: "#5a6070", fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", letterSpacing: .5, transition: "color .18s" }}
            onMouseEnter={e => e.target.style.color = "#f0ece4"} onMouseLeave={e => e.target.style.color = "#5a6070"}>
            ← NEW AUDIT
          </button>
        </div>

        <div style={{ maxWidth: 1020, margin: "0 auto", padding: "32px 20px" }}>

          {/* Hero row */}
          <div className="fu" style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            {/* Score card */}
            <div style={{ background: "linear-gradient(135deg,rgba(240,160,48,.07) 0%,rgba(240,160,48,.02) 100%)", border: "1px solid rgba(240,160,48,.18)", borderRadius: 18, padding: "28px 32px", minWidth: 200, flex: "0 0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#5a6070", letterSpacing: 3, marginBottom: 10 }}>HEALTH SCORE</div>
              <ScoreGauge score={audit.overall_score} />
              <div style={{ marginTop: 10, fontSize: 12, color: "#5a6070", fontFamily: "'JetBrains Mono',monospace", maxWidth: 160, textAlign: "center" }}>{audit.business_type}</div>
            </div>

            {/* Summary + mini bars */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: -.5 }}>SEO Health Report</h2>
              <p style={{ color: "#8890a0", fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>{audit.summary}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px" }}>
                {audit.categories.map(c => (
                  <div key={c.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "#5a6070", fontFamily: "'JetBrains Mono',monospace", letterSpacing: .5 }}>{c.name.slice(0, 11).toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: scoreColor(c.score), fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{c.score}</span>
                    </div>
                    <AnimBar score={c.score} />
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart */}
            <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "20px 16px", minWidth: 200, flex: "0 0 200px" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#5a6070", letterSpacing: 3, marginBottom: 12, textAlign: "center" }}>RADAR</div>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1c1f2e" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#363a4f", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }} />
                  <Radar dataKey="score" stroke="#f0a030" fill="#f0a030" fillOpacity={0.12} strokeWidth={1.5} />
                  <Tooltip contentStyle={{ background: "#0f1118", border: "1px solid rgba(240,160,48,.2)", borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#f0ece4" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical + Wins */}
          <div className="fu2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "rgba(239,68,68,.04)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 14 }}>⚠ CRITICAL ISSUES</div>
              {audit.critical_issues?.map((x, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 11, alignItems: "flex-start" }}>
                  <span style={{ color: "#ef4444", fontSize: 13, marginTop: 1, flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: 13, color: "#c8ccd6", lineHeight: 1.5 }}>{x}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(34,197,94,.04)", border: "1px solid rgba(34,197,94,.15)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#22c55e", letterSpacing: 3, marginBottom: 14 }}>⚡ QUICK WINS</div>
              {audit.quick_wins?.map((x, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 11, alignItems: "flex-start" }}>
                  <span style={{ color: "#22c55e", fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#c8ccd6", lineHeight: 1.5 }}>{x}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category explorer */}
          <div className="fu3" style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#5a6070", letterSpacing: 3, marginBottom: 14 }}>CATEGORY DEEP DIVE</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {audit.categories.map(c => (
                <button key={c.name} onClick={() => setCat(c)}
                  style={{ background: cat?.name === c.name ? "rgba(240,160,48,.09)" : "rgba(255,255,255,.03)", border: `1px solid ${cat?.name === c.name ? "rgba(240,160,48,.4)" : "rgba(255,255,255,.07)"}`, borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: cat?.name === c.name ? "#f0a030" : "#5a6070", transition: "all .15s", letterSpacing: .5, display: "flex", gap: 7, alignItems: "center" }}>
                  <span style={{ color: scoreColor(c.score), fontWeight: 700 }}>{c.score}</span>
                  {c.name}
                </button>
              ))}
            </div>
            {cat && (
              <div style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "24px 26px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: "#5a6070", fontFamily: "'JetBrains Mono',monospace" }}>WEIGHT · {cat.weight}% OF TOTAL SCORE</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: scoreColor(cat.score), lineHeight: 1 }}>{cat.score}</div>
                    <div style={{ fontSize: 11, color: "#5a6070", fontFamily: "'JetBrains Mono',monospace" }}>{scoreLabel(cat.score)}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 3, marginBottom: 12 }}>ISSUES FOUND</div>
                    {cat.issues?.map((x, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, paddingBottom: 11, marginBottom: 11, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                        <span style={{ color: "#ef4444", fontSize: 11, marginTop: 2, flexShrink: 0 }}>▸</span>
                        <span style={{ fontSize: 13, color: "#8890a0", lineHeight: 1.55 }}>{x}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 3, marginBottom: 12 }}>RECOMMENDATIONS</div>
                    {cat.recommendations?.map((x, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, paddingBottom: 11, marginBottom: 11, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                        <span style={{ color: "#22c55e", fontSize: 11, marginTop: 2, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#8890a0", lineHeight: 1.55 }}>{x}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action plan */}
          <div className="fu4">
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#5a6070", letterSpacing: 3, marginBottom: 14 }}>ACTION PLAN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {audit.action_plan?.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 11, padding: "13px 18px", flexWrap: "wrap" }}>
                  <span style={{ background: `${PCOL[item.priority]}18`, border: `1px solid ${PCOL[item.priority]}38`, borderRadius: 100, padding: "3px 12px", fontSize: 10, color: PCOL[item.priority], fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap", flexShrink: 0 }}>{item.priority}</span>
                  <span style={{ flex: 1, minWidth: 180, fontSize: 13, color: "#c8ccd6" }}>{item.action}</span>
                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    {[["IMPACT", item.impact, item.impact === "High" ? "#22c55e" : item.impact === "Medium" ? "#f0a030" : "#6b7280"],
                      ["EFFORT", item.effort, item.effort === "Low" ? "#22c55e" : item.effort === "Medium" ? "#f0a030" : "#ef4444"],
                      ["WHEN", item.timeline, "#5a6070"]].map(([label, val, col]) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#363a4f", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2, letterSpacing: 1 }}>{label}</div>
                        <div style={{ fontSize: 11, color: col, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
