import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ArrowUpRight, BarChart2, Battery, Calculator, CheckCircle, Factory, Fuel, ScanSearch, Search, XCircle } from 'lucide-react';
import { CARS, GRID_DATA, GREENWASH_DB, calcLifecycle } from '../data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const SEARCH_INDEX = Object.entries(CARS).map(([key, car]) => ({
  key, name: car.name, brand: car.brand,
  searchStr: `${car.name} ${car.brand} ${car.type}`.toLowerCase(),
}));

const VERDICT_CONFIG = {
  green:     { icon: CheckCircle,   label: 'Genuinely Green', color: '#2d6a4f', bg: 'rgba(45,106,79,0.12)',  border: 'rgba(45,106,79,0.3)'  },
  partial:   { icon: AlertTriangle, label: 'Partially Green', color: '#b45309', bg: 'rgba(180,83,9,0.10)',   border: 'rgba(180,83,9,0.3)'   },
  greenwash: { icon: XCircle,       label: 'Greenwashing',    color: '#c0392b', bg: 'rgba(192,57,43,0.10)',  border: 'rgba(192,57,43,0.35)' },
};

function getVerdict(car) {
  if (!car) return null;
  const result = calcLifecycle(car.key, 0.82, 40, 8);
  if (!result) return null;
  const verdict = result.total < 30 ? 'green' : result.total < 55 ? 'partial' : 'greenwash';
  return { ...result, verdict, config: VERDICT_CONFIG[verdict] };
}

const LEADERBOARD_CARS = [
  'prius','tiago-ev','comet-ev','nexon-ev','city-hybrid','vitara-hybrid',
  'mg-zs-ev','brezza','swift','creta','scorpio-n','innova','fortuner',
];

const GW_ALERTS = GREENWASH_DB.slice(0, 3);

function RatingBadge({ rating }) {
  const cls = rating === 'A+' ? 'rating-aplus' : rating === 'A' ? 'rating-a' : rating === 'B' ? 'rating-b' : 'rating-c';
  return <div className={`rating ${cls}`}>{rating}</div>;
}

function TruthMirrorWidget() {
  const [query, setQuery]      = useState('');
  const [suggestions, setSugg] = useState([]);
  const [result, setResult]    = useState(null);
  const navigate = useNavigate();

  function onInput(val) {
    setQuery(val); setResult(null);
    if (val.length < 2) { setSugg([]); return; }
    setSugg(SEARCH_INDEX.filter(c => c.searchStr.includes(val.toLowerCase())).slice(0, 4));
  }

  function selectCar(car) {
    setQuery(car.name); setSugg([]);
    setResult(getVerdict(car));
  }

  const QUICK = ['Nexon EV', 'Fortuner', 'Swift', 'Prius'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
      style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.1)', borderRadius: 20, padding: 24, backdropFilter: 'blur(10px)', position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, background: 'rgba(196,75,43,0.2)', border: '1px solid rgba(196,75,43,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ScanSearch size={15} color="var(--rust)" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--cream)' }}>Showroom Truth Mirror</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)' }}>Type any car → get the real CO₂</div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(245,240,232,0.07)', border: '1px solid rgba(245,240,232,0.15)', borderRadius: 10 }}>
          <Search size={14} style={{ marginLeft: 12, color: 'rgba(245,240,232,0.35)', flexShrink: 0 }} />
          <input value={query} onChange={e => onInput(e.target.value)} placeholder="e.g. Nexon EV, Fortuner..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--cream)', fontSize: 13, padding: '10px 10px', fontFamily: 'var(--font-body)', caretColor: 'var(--olive-muted)' }} />
          {query && <button onClick={() => { setQuery(''); setResult(null); setSugg([]); }} style={{ marginRight: 8, background: 'none', border: 'none', color: 'rgba(245,240,232,0.3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>}
        </div>
        <AnimatePresence>
          {suggestions.length > 0 && !result && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'rgba(20,26,16,0.98)', border: '1px solid rgba(245,240,232,0.1)', borderRadius: 10, overflow: 'hidden', zIndex: 100 }}>
              {suggestions.map(s => (
                <button key={s.key} onClick={() => selectCar(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(245,240,232,0.05)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,240,232,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <span style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase' }}>{CARS[s.key]?.type}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!result && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {QUICK.map(name => {
            const found = SEARCH_INDEX.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
            return (
              <button key={name} onClick={() => found && selectCar(found)}
                style={{ padding: '4px 12px', background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.1)', borderRadius: 100, fontSize: 11, color: 'rgba(245,240,232,0.5)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                {name}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: result.config.bg, border: `1.5px solid ${result.config.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {(() => { const Icon = result.config.icon; return <Icon size={22} color={result.config.color} />; })()}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: result.config.color }}>{result.config.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 1 }}>{result.name} · MH grid · 40km · 8yrs</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--cream)' }}>{result.total}t</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase' }}>Total CO₂</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
              {[['Mfg', result.mfg + 't', 'var(--rust)'], ['Fuel', result.fuel + 't', 'var(--amber)'], ['Disposal', result.battDisp + 't', 'var(--olive-muted)']].map(([l, v, c]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(`/showroom-mirror?car=${result.key}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: result.config.color, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
              <ScanSearch size={13} /> Full Truth Report →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.2)', textAlign: 'center', letterSpacing: '.08em' }}>
        Maharashtra grid · 40km/day · 8yr ownership
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [lbFilter, setLbFilter] = useState('all');
  const [gwInput,  setGwInput]  = useState('');
  const [gwResult, setGwResult] = useState(null);
  const navigate = useNavigate();

  const leaderboard = LEADERBOARD_CARS.map(key => calcLifecycle(key, 0.82, 40, 8)).filter(Boolean).sort((a, b) => a.total - b.total);
  const filtered = lbFilter === 'all' ? leaderboard : leaderboard.filter(c => c.type === lbFilter);
  const maxCO2   = Math.max(...leaderboard.map(c => c.total));

  function checkGreenwash() {
    const lower = gwInput.toLowerCase();
    const FLAGS = [
      { term: 'zero emission',  score: -18, msg: '"Zero emissions" ignores manufacturing & battery disposal' },
      { term: 'carbon neutral', score: -22, msg: '"Carbon neutral" rarely includes supply chain'             },
      { term: 'eco mode',       score: -8,  msg: '"Eco mode" savings are lab-tested, not real-world'        },
      { term: 'green',          score: -6,  msg: 'Vague "green" language without data'                      },
      { term: 'clean energy',   score: -8,  msg: '"Clean energy" depends entirely on your grid'             },
      { term: 'sustainable',    score: -5,  msg: 'Unverified "sustainable" claim'                           },
      { term: 'co2 free',       score: -20, msg: 'No car is CO₂-free when manufacturing is included'        },
      { term: 'net zero',       score: -15, msg: '"Net zero": by when? By whose accounting?'               },
      { term: 'lifecycle',      score: +12, msg: null },
      { term: 'verified',       score: +8,  msg: null },
    ];
    let score = 70; const flags = [];
    FLAGS.forEach(f => { if (lower.includes(f.term)) { score += f.score; if (f.msg) flags.push(f.msg); } });
    score = Math.max(5, Math.min(95, score));
    setGwResult({ score, flags });
  }

  return (
    <div style={{ paddingTop: 72 }}>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: '100vh', background: 'var(--carbon)',
        color: 'var(--cream)', display: 'flex', alignItems: 'center',
        overflow: 'hidden', padding: '120px 0 80px',
        backgroundImage: "url('https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&q=80')",
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(61,74,46,0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 20% 80%, rgba(196,75,43,0.08) 0%, transparent 60%), rgba(14,18,10,0.78)' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 60, alignItems: 'center', position: 'relative', zIndex: 2, width: '100%' }}>
          {/* Left */}
          <div>
            <motion.div {...fadeUp(0.1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--olive-muted)', marginBottom: 24 }}>
              <Activity size={14} /> Lifecycle Emissions Intelligence
            </motion.div>
            <motion.h1 {...fadeUp(0.2)} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px,6vw,84px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.025em', color: 'var(--cream)', marginBottom: 24 }}>
              Your car has a<br />
              <em style={{ fontStyle: 'italic', color: 'var(--olive-muted)' }}>secret carbon</em><br />
              past.
            </motion.h1>
            <motion.p {...fadeUp(0.3)} style={{ fontSize: 17, color: 'rgba(245,240,232,0.65)', lineHeight: 1.7, maxWidth: 440, marginBottom: 36 }}>
              Manufacturing. Fuel. Battery disposal. We show the full lifecycle cost —
              adjusted for your grid, state, and how you actually drive.
            </motion.p>
            <motion.div {...fadeUp(0.4)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
              <Link to="/compare"    className="btn btn--primary"><BarChart2 size={15} /> Compare Cars</Link>
              <Link to="/calculator" className="btn btn--ghost"><Calculator size={15} /> My Carbon Score</Link>
            </motion.div>
            <motion.div {...fadeUp(0.5)} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, paddingTop: 36, borderTop: '1px solid rgba(245,240,232,0.08)' }}>
              {[['14', 'Vehicles tracked'], ['67%', "India's grid on coal"], ['3', 'Hidden cost factors'], ['50+', 'Countries & regions']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--cream)' }}>{num}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,0.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Truth Mirror widget */}
          <TruthMirrorWidget />
        </div>
      </section>

      {/* ── AHA MOMENT ── */}
      <section style={{ background: 'var(--cream)', padding: '100px 0' }}>
        <div className="container">
          <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>What car ads hide</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, lineHeight: 1.1, maxWidth: 580, marginBottom: 52 }}>
            What they show you <em style={{ fontStyle: 'italic', color: 'var(--olive)' }}>vs</em><br />what we show you.
          </motion.h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ flex: 1, minWidth: 280, background: 'var(--cream-dark)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 36 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 24, opacity: .6 }}>⚠ What car ads show</div>
              {[
                { icon: <Fuel size={22} color="var(--olive)" />,   label: 'Fuel efficiency',      val: '18 km/L ✓', hidden: false },
                { icon: <Factory size={22} color="#ccc" />,         label: 'Manufacturing carbon', val: 'not shown',  hidden: true  },
                { icon: <Battery size={22} color="#ccc" />,         label: 'Battery disposal',     val: 'not shown',  hidden: true  },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  {m.icon}<span style={{ flex: 1, fontSize: 14 }}>{m.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: m.hidden ? 'var(--text-muted)' : 'var(--olive)', opacity: m.hidden ? .5 : 1 }}>{m.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 10, background: 'rgba(196,75,43,0.08)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700 }}>??t</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 6, opacity: .7 }}>Real total: unknown</div>
              </div>
            </motion.div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: 'var(--text-muted)', flexShrink: 0 }}>vs</div>
            <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ flex: 1, minWidth: 280, background: 'var(--carbon)', color: 'var(--cream)', border: '1.5px solid rgba(245,240,232,0.08)', borderRadius: 20, padding: 36 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 24, opacity: .6 }}>✓ What CarbonWise shows</div>
              {[
                { icon: <Factory size={22} color="var(--rust)" />,       label: '🏭 Manufacturing',    val: '12t CO₂', color: 'var(--rust)'        },
                { icon: <Fuel    size={22} color="var(--amber)" />,       label: '⛽ Fuel / Energy',    val: '28t CO₂', color: 'var(--amber)'       },
                { icon: <Battery size={22} color="var(--olive-muted)" />, label: '🔋 Battery Disposal', val: '8t CO₂',  color: 'var(--olive-muted)' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
                  {m.icon}<span style={{ flex: 1, fontSize: 14 }}>{m.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: m.color }}>{m.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 10, background: 'rgba(74,124,89,0.12)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700 }}>48t</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 6, opacity: .7 }}>Total lifecycle: the honest number</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── IMAGE STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', height: 260, overflow: 'hidden' }}>
        {[
          { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80', label: "India's coal grid reality" },
          { img: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=700&q=80', label: 'EV manufacturing carbon' },
          { img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80', label: 'Clean energy future' },
        ].map((item, i) => (
          <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
            <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.45)' }} />
            <span style={{ position: 'absolute', bottom: 16, left: 20, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.7)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── LEADERBOARD ── */}
      <section style={{ background: 'var(--carbon)', padding: '100px 0', color: 'var(--cream)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div className="section-label" style={{ color: 'var(--olive-muted)' }}>Car Rankings</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--cream)' }}>The honest<br />leaderboard.</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'ev', 'hybrid', 'ice'].map(f => (
                <button key={f} onClick={() => setLbFilter(f)} className={`filter-pill ${lbFilter === f ? 'active' : ''}`} style={{ borderColor: 'rgba(245,240,232,0.14)', color: lbFilter === f ? 'var(--cream)' : 'rgba(245,240,232,0.5)' }}>
                  {f === 'all' ? 'All' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(245,240,232,0.08)' }}>
                {['#', 'Vehicle', 'Type', 'Lifecycle CO₂', 'Carbon Score', 'Rating'].map(h => (
                  <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.28)', padding: '12px 20px', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((car, i) => {
                const pct = (car.total / maxCO2) * 100;
                const barColor = car.total < 30 ? 'var(--green-ok)' : car.total < 55 ? 'var(--amber)' : 'var(--rust)';
                const rankStyle = i === 0 ? { color: '#D4A82A' } : i === 1 ? { color: 'rgba(245,240,232,0.5)' } : i === 2 ? { color: '#C47840' } : { color: 'rgba(245,240,232,0.25)' };
                return (
                  <motion.tr key={car.key} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    style={{ borderBottom: '1px solid rgba(245,240,232,0.05)', cursor: 'pointer' }}
                    onClick={() => navigate(`/showroom-mirror?car=${car.key}`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,240,232,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '20px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, ...rankStyle }}>{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cream)' }}>{car.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,0.3)', marginTop: 3 }}>{car.brand} · 2024</div>
                    </td>
                    <td style={{ padding: '20px' }}><span className={`type-badge type-${car.type}`}>{car.type.toUpperCase()}</span></td>
                    <td style={{ padding: '20px', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--cream)' }}>{car.total}t CO₂</td>
                    <td style={{ padding: '20px 20px', paddingLeft: 8 }}>
                      <div style={{ height: 5, background: 'rgba(245,240,232,0.07)', borderRadius: 3, overflow: 'hidden', width: 160 }}>
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.08 }} style={{ height: '100%', background: barColor, borderRadius: 3 }} />
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}><RatingBadge rating={car.rating} /></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)', fontFamily: 'var(--font-mono)' }}>Click any row → opens the full Truth Mirror report</p>
          </div>
        </div>
      </section>

      {/* ── GREENWASHING ── */}
      <section style={{ background: 'var(--cream-dark)', padding: '100px 0' }}>
        <div className="container">
          <div className="section-label">Greenwashing Exposed</div>
          <h2 className="section-title" style={{ marginBottom: 8 }}>They lie.<br /><em>We expose it.</em></h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 48 }}>Real marketing claims. Real data contradicting them.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {GW_ALERTS.map((gw, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ display: 'flex', gap: 16, padding: '20px 24px', background: 'var(--white)', border: '1.5px solid rgba(196,75,43,0.15)', borderRadius: 14 }}>
                  <div style={{ width: 36, height: 36, flexShrink: 0, background: 'rgba(196,75,43,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rust)' }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{gw.brand}: {gw.claim}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{gw.reality}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ background: 'var(--carbon)', color: 'var(--cream)', borderRadius: 20, padding: 32, position: 'sticky', top: 96 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>🔍 Greenwash Detector</h3>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', marginBottom: 20 }}>Paste any car ad claim. We score its honesty.</p>
              <textarea value={gwInput} onChange={e => setGwInput(e.target.value)} placeholder="e.g. 'This vehicle produces zero emissions and is carbon neutral...'" style={{ width: '100%', minHeight: 100, padding: '12px 14px', resize: 'vertical', background: 'rgba(245,240,232,0.06)', border: '1.5px solid rgba(245,240,232,0.1)', borderRadius: 8, color: 'var(--cream)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
              <button onClick={checkGreenwash} className="btn btn--rust" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>Check Honesty Score</button>
              {gwResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, padding: 16, background: 'rgba(196,75,43,0.08)', border: '1px solid rgba(196,75,43,0.2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,0.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Honesty</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(245,240,232,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${gwResult.score}%` }} transition={{ duration: 0.8 }} style={{ height: '100%', background: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)' }}>{gwResult.score}/100</span>
                  </div>
                  {gwResult.flags.length > 0 && (
                    <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)', lineHeight: 1.6 }}>
                      <strong style={{ display: 'block', marginBottom: 6 }}>🚩 Red flags:</strong>
                      {gwResult.flags.map((f, i) => <div key={i} style={{ marginBottom: 4 }}>• {f}</div>)}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── REALITY TEASER ── */}
      <section style={{ background: 'var(--olive)', padding: '100px 0', color: 'var(--cream)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.5vw,30px)', fontStyle: 'italic', lineHeight: 1.5, borderLeft: '3px solid rgba(245,240,232,0.3)', paddingLeft: 28, marginBottom: 16 }}>
              "India added 3.2 million new cars in 2023. Each one will emit carbon for the next 10–15 years. Nobody told the buyers the full story."
            </blockquote>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'rgba(245,240,232,0.45)' }}>CEA India · SIAM Annual Report 2023</p>
            <Link to="/the-reality" className="btn btn--ghost" style={{ marginTop: 28 }}>Read Why This Matters →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { num: '2.1M', label: 'Indians die from air pollution yearly', img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70' },
              { num: '14%',  label: 'Global CO₂ from transport',             img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=70' },
              { num: '67%',  label: "India's electricity from coal",          img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
              { num: '₹0',   label: 'Carbon cost shown in any car ad',       img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70' },
            ].map(s => (
              <motion.div key={s.label} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', height: 130 }}>
                <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,18,10,0.85) 40%, rgba(14,18,10,0.25) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, right: 8 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--cream)', lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.6)', letterSpacing: '.08em', marginTop: 4 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          section > .container > div[style*="grid-template-columns: 1fr 420px"],
          section > .container > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          table { font-size: 12px; }
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
