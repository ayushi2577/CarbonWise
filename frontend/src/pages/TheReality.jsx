import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Smile, Target, XCircle } from 'lucide-react';

const STATS = [
  { num: '2.1M', label: 'Indians die from air pollution every year', src: 'WHO 2023', img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70' },
  { num: '14%', label: 'Of global CO₂ comes from transport', src: 'IEA 2023', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=70' },
  { num: '67%', label: "India's electricity still from coal", src: 'CEA 2023', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
  { num: '3.2M', label: 'New cars sold in India in 2023. None showed lifecycle data', src: 'SIAM 2023', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70' },
];

const TACTICS = [
  { title: '"Zero Emissions"', reality: 'Hides 10–16 tonnes of manufacturing carbon. Every EV has a carbon debt before it moves 1 km.', severity: 'high' },
  { title: '"Carbon Neutral by 2030"', reality: 'No verified binding plan from any Indian automaker. Self-declared, third-party unverified.', severity: 'high' },
  { title: '"Eco Mode Saves 40%"', reality: 'Lab tested. Real-world saving: 8–13%. The gap is the lie.', severity: 'medium' },
  { title: '"Clean Energy Vehicle"', reality: 'An EV charged on Jharkhand\'s coal grid emits more than a Prius. "Clean" depends entirely on the grid.', severity: 'medium' },
  { title: '"Our EVs are Green"', reality: 'Manufacturing lithium batteries = 12–16t CO₂. This is never disclosed.', severity: 'high' },
];

const GRID_STATES = [
  { state: 'Himachal Pradesh', val: 0.12, bar: 11 },
  { state: 'Kerala', val: 0.18, bar: 16 },
  { state: 'Delhi', val: 0.78, bar: 71 },
  { state: 'Maharashtra', val: 0.82, bar: 75 },
  { state: 'Madhya Pradesh', val: 0.96, bar: 87 },
  { state: 'Jharkhand', val: 1.10, bar: 100 },
];


const QUIZ_QUESTIONS = [
  {
    q: `A Tata Nexon EV has "zero emissions". How much CO₂ does it actually produce in its lifetime (8 years, Maharashtra grid)?`,
    options: ['~5t — battery cars barely pollute', '~29t — manufacturing + grid + disposal', '~60t — same as a petrol car', 'Exactly 0t — it runs on electricity'],
    correct: 1,
    explanation: `The Nexon EV carries 12t of manufacturing carbon + ~4.2t battery disposal + ~13t from Maharashtra's 0.82 kg/kWh grid over 8 years at 40km/day = ~29t total. "Zero emission" refers only to tailpipe, not lifecycle.`,
    source: 'EEA 2023 · CEA 2023 · IPCC AR6',
  },
  {
    q: `Which Indian state makes an EV the most carbon-efficient to charge?`,
    options: ["Delhi — it's the capital, most modern grid", 'Maharashtra — largest economy', 'Himachal Pradesh — almost all hydroelectric', 'Tamil Nadu — has wind power'],
    correct: 2,
    explanation: `Himachal Pradesh's grid runs at just 0.12 kg CO₂/kWh — almost entirely hydro. That's 9× cleaner than Jharkhand (1.10) and makes EVs break even vs hybrids in under 2 years. Delhi is 0.78.`,
    source: 'CEA CO₂ Baseline Database v18, 2023',
  },
  {
    q: `Hyundai Creta's showroom says "Eco Mode saves 40% fuel". What's the real-world saving?`,
    options: ['35–40% — the brochure is accurate', '20–25% — still significant', '8–13% — ARAI lab vs real roads differ a lot', "Exactly 0% — it's marketing fiction"],
    correct: 2,
    explanation: `The 40% figure comes from an ARAI lab test under ideal conditions. Real-world city driving yields 8–13% saving. Over 8 years, the gap between the claim and reality is 3–5t of "phantom savings".`,
    source: 'NDTV Auto Real-World Test 2023 · ARAI Test Protocols',
  },
  {
    q: `In Jharkhand (coal-heavy grid, 1.10 kg CO₂/kWh), which is cleaner over 8 years at 40km/day?`,
    options: ["Tata Nexon EV — it's always cleaner than ICE", 'Toyota Prius Hybrid — low-carbon regardless of grid', 'Maruti Swift — manufacturing is so cheap it wins', "They're identical — grid doesn't change the outcome"],
    correct: 1,
    explanation: `In Jharkhand's coal grid, the Prius Hybrid (3.5L/100km, small battery) totals ~24t over 8 years vs the Nexon EV's ~34t. An EV on a dirty grid can take 10+ years to break even. Grid = the biggest variable.`,
    source: 'CarbonWise lifecycle model · CEA 2023 · IPCC AR6',
  },
];

function RealityQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUIZ_QUESTIONS[current];

  function choose(idx) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore(s => s + 1);
  }

  function next() {
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setCurrent(0); setSelected(null); setScore(0); setDone(false);
  }

  if (done) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 20, padding: '40px 36px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 60, fontWeight: 700, color: pct >= 75 ? 'var(--green-ok)' : pct >= 50 ? 'var(--amber)' : 'var(--rust)', lineHeight: 1 }}>{score}/{QUIZ_QUESTIONS.length}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 12, marginBottom: 8 }}>
          {pct >= 75 ? 'You know your lifecycle data <Target size={16} />' : pct >= 50 ? 'Decent — but the showroom may still fool you <AlertTriangle size={14} />' : 'The ads have been doing their job on you <Smile size={16} />'}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
          {pct >= 75 ? "Seriously impressive. You're ready to fact-check any showroom claim in real time." : 'The gap between ad claims and lifecycle reality is exactly what CarbonWise exists to close.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} style={{ padding: '10px 22px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Try again</button>
          <Link to="/compare" className="btn btn--primary">Compare Real Cars →</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 20, padding: '32px 36px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((current) / QUIZ_QUESTIONS.length) * 100}%`, background: 'var(--olive)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{current + 1} / {QUIZ_QUESTIONS.length}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, lineHeight: 1.4, marginBottom: 24 }}>{q.q}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--cream-dark)', border = 'var(--border)', color = 'var(--black)';
          if (selected !== null) {
            if (i === q.correct) { bg = 'rgba(74,124,89,0.1)'; border = 'var(--green-ok)'; color = 'var(--green-ok)'; }
            else if (i === selected) { bg = 'rgba(196,75,43,0.07)'; border = 'var(--rust)'; color = 'var(--rust)'; }
            else { bg = 'var(--cream-dark)'; border = 'var(--border)'; color = 'var(--text-muted)'; }
          }
          return (
            <button key={i} onClick={() => choose(i)} disabled={selected !== null}
              style={{ width: '100%', textAlign: 'left', padding: '13px 18px', border: `1.5px solid ${border}`, borderRadius: 10, fontSize: 14, background: bg, color, transition: 'all 0.2s', cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '14px 18px', background: selected === q.correct ? 'rgba(74,124,89,0.08)' : 'rgba(196,75,43,0.06)', border: `1px solid ${selected === q.correct ? 'rgba(74,124,89,0.2)' : 'rgba(196,75,43,0.2)'}`, borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: selected === q.correct ? 'var(--green-ok)' : 'var(--rust)' }}>
            {selected === q.correct ? <><CheckCircle size={14} /> Correct!</> : <><XCircle size={14} /> Not quite.</>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 6 }}>{q.explanation}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '.06em' }}>Source: {q.source}</div>
        </motion.div>
      )}
      {selected !== null && (
        <button onClick={next} className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
          {current < QUIZ_QUESTIONS.length - 1 ? 'Next question →' : 'See results →'}
        </button>
      )}
    </div>
  );
}

export default function TheReality() {
  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <div style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '120px 0 80px', position: 'relative', backgroundImage: 'url(https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.82)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <div className="section-label" style={{ color: 'var(--olive-muted)' }}>The Uncomfortable Truth</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px,7vw,88px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.025em', maxWidth: 720, marginBottom: 24, color: 'var(--cream)' }}>
            The car industry<br /><em style={{ fontStyle: 'italic', color: 'var(--rust)' }}>is lying to you.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(245,240,232,.6)', maxWidth: 520, lineHeight: 1.7 }}>
            Every car ad shows you fuel economy. None show you manufacturing emissions, battery disposal, or your state's coal grid. We do.'
          </p>
        </div>
      </div>

      {/* Stats */}
      <section style={{ background: 'var(--cream-dark)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ height: 110, overflow: 'hidden', position: 'relative' }}>
                  <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55))' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 16, fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{s.num}</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.src}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid reality */}
      <section style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="section-label" style={{ color: 'var(--olive-muted)' }}>India Grid Reality</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20, color: 'var(--cream)' }}>
              Same EV. Wildly different<br /><em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>carbon footprint.</em>
            </h2>
            <p style={{ color: 'rgba(245,240,232,.6)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
              A Nexon EV charged in Himachal Pradesh uses hydro power. The same car in Jharkhand uses coal. The carbon difference is massive, and nobody tells you this.
            </p>
            <Link to="/compare" className="btn btn--primary">See This in Action →</Link>
          </div>
          <div>
            {GRID_STATES.map((g, i) => {
              const color = g.val < 0.3 ? 'var(--green-ok)' : g.val < 0.7 ? 'var(--amber)' : 'var(--rust)';
              return (
                <motion.div key={g.state} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <span style={{ fontSize: 13, width: 160, flexShrink: 0, color: 'rgba(245,240,232,.6)' }}>{g.state}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(245,240,232,.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${g.bar}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.08 }} style={{ height: '100%', background: color, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, width: 36, textAlign: 'right' }}>{g.val}</span>
                </motion.div>
              );
            })}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,.3)', marginTop: 16, letterSpacing: '.08em' }}>kg CO₂/kWh · Source: CEA India 2023</p>
          </div>
        </div>
      </section>

      {/* Photo banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 320, overflow: 'hidden' }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80" alt="Coal power plant" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,18,10,0.7) 0%, rgba(14,18,10,0.2) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>67% coal.<br />Every EV charge.</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>CEA India 2023</div>
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80" alt="Car manufacturing" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(14,18,10,0.65) 0%, rgba(14,18,10,0.15) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 28, right: 32, textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>12–16t CO₂<br />before km 1.</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Manufacturing debt · IVL 2022</div>
          </div>
        </div>
      </div>

      {/* Greenwashing tactics */}
      <section style={{ background: 'var(--cream)', padding: '80px 0' }}>
        <div className="container">
          <div className="section-label">Greenwashing Tactics</div>
          <h2 className="section-title" style={{ marginBottom: 8 }}>The playbook<br /><em>they all use.</em></h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 48 }}>Five real tactics from Indian car marketing. Five ways you're being misled.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TACTICS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, padding: '24px 28px', background: 'var(--white)', border: `1.5px solid ${t.severity === 'high' ? 'rgba(196,75,43,0.25)' : 'var(--border)'}`, borderRadius: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--rust)', marginBottom: 6 }}>{t.title}</div>
                  <span className={`badge ${t.severity === 'high' ? 'badge-red' : 'badge-amber'}`}>{t.severity === 'high' ? 'High severity' : 'Medium'}</span>
                </div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: '2px solid var(--border)', paddingLeft: 24 }}>{t.reality}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tactics photo interlude */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1400&q=80" alt="Car marketing" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.72)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,36px)', fontStyle: 'italic', color: '#fff', lineHeight: 1.4, maxWidth: 680, marginBottom: 16 }}>
            "3.2 million new cars sold in India in 2023. Not one showed lifecycle emissions data."
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>SIAM Annual Report 2023</div>
        </div>
      </div>

      {/* Interactive Quiz */}
      <section style={{ background: 'var(--cream-dark)', padding: '72px 0' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="section-label">Test Yourself</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 700, marginBottom: 8 }}>
            How much do you <em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>actually know?</em>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.6 }}>Four questions. Real data. No tricks — just the things showrooms hope you never ask.</p>
          <RealityQuiz />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--olive)', color: 'var(--cream)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>Now you know the truth.<br /><em style={{ fontStyle: 'italic' }}>Use it.</em></h2>
          <p style={{ fontSize: 17, color: 'rgba(245,240,232,.6)', marginBottom: 36 }}>Compare any vehicle with real lifecycle data. No greenwashing, no spin.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/compare" className="btn btn--primary">Compare Cars</Link>
            <Link to="/calculator" className="btn btn--ghost">Personal Calculator</Link>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"],div[style*="grid-template-columns: repeat(4"]{grid-template-columns:1fr!important}div[style*="grid-template-columns: 200px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
