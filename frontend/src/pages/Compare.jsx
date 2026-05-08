import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowLeft, BarChart2, Battery, Bot, CheckCircle, Download, Factory, Fuel, Heart, Info, Leaf, Lightbulb, Loader, Search, Send, Share2, Trees, Trophy, XCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import D3BreakevenChart from '../components/D3BreakevenChart';
import { CARS, GRID_DATA, calcLifecycle, getGridIntensity, getConfidenceRange, RATING_LEGEND } from '../data';

// ── Impact translation helpers ──────────────────────────────────
function getImpactLines(totalTonnes, mileage, years) {
  const saved = Math.max(0, 45 - totalTonnes); // vs avg ICE baseline
  return [
    `Equivalent to ${Math.round(totalTonnes / 0.225).toLocaleString()} Delhi→Mumbai flights over ${years} years`,
    `<Trees size={14} /> Needs ${Math.round(totalTonnes * 46).toLocaleString()} trees planted to offset (over 10 years each)`,
    saved > 0 ? `<Heart size={14} style={{color:"var(--green-ok)"}} /> Switching from avg ICE saves ${saved.toFixed(1)}t CO₂ — equal to planting ${Math.round(saved * 46)} trees` : `<AlertTriangle size={14} /> Higher than expected — equivalent to ${Math.round(Math.abs(saved) * 46)} extra trees needed`,
  ];
}

// ── Real greenwash examples baked in ────────────────────────────
const GW_REAL_EXAMPLES = [
  {
    brand: 'Tata Motors (Nexon EV)',
    claim: '"Zero Emission Vehicle"',
    reality: 'Tailpipe zero, yes — but 12.0t manufacturing + 4.2t battery disposal. Lifecycle total in MH: ~29t. "Zero" refers to tailpipe only.',
    verdict: 'partial',
    score: 42,
  },
  {
    brand: 'Hyundai (Creta)',
    claim: '"Eco Mode Saves 40% Fuel"',
    reality: 'NDTV Auto independent test (2023) found 9.4% real-world saving in city driving. The 40% figure is an ARAI lab result under controlled conditions.',
    verdict: 'greenwash',
    score: 18,
  },
  {
    brand: 'BYD (Atto 3)',
    claim: '"100% Electric. 100% Clean."',
    reality: '60.5 kWh battery = 8.5t disposal CO₂. Mfg: 15.1t. On India avg grid, EV advantage takes 7–9 years to materialise. Not "100% clean" from day one.',
    verdict: 'greenwash',
    score: 15,
  },
];

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CAR_OPTIONS = Object.entries(CARS).map(([key, car]) => ({ value: key, label: `${car.name} (${car.type.toUpperCase()})` }));

const COUNTRY_OPTIONS = Object.entries(GRID_DATA)
  .filter(([k]) => k !== 'india')
  .map(([key, g]) => ({ value: key, label: `${g.label} (${g.intensity})`, intensity: g.intensity }));

function RatingBadge({ rating }) {
  const cls = rating === 'A+' ? 'rating-aplus' : rating === 'A' ? 'rating-a' : rating === 'B' ? 'rating-b' : 'rating-c';
  return <div className={`rating ${cls}`}>{rating}</div>;
}

export default function Compare() {
  const [carA, setCarA] = useState('nexon-ev');
  const [carB, setCarB] = useState('creta');
  const [carC, setCarC] = useState('');
  const [country, setCountry] = useState('india');
  const [state, setState]     = useState('MH');
  const [mileage, setMileage] = useState(40);
  const [years, setYears]     = useState(8);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  function downloadReport({ cars, winner, mileage, years, country, state, gridIntensity }) {
    const region = country === 'india' ? (GRID_DATA.india.states[state]?.label ?? state) : (GRID_DATA[country]?.label ?? country);
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const rows = cars.map(c => `
      <tr style="border-bottom:1px solid #e8e0d4">
        <td style="padding:12px 16px;font-weight:600">${c.name}</td>
        <td style="padding:12px 16px;text-align:center">${c.type.toUpperCase()}</td>
        <td style="padding:12px 16px;text-align:center">${c.mfg}t</td>
        <td style="padding:12px 16px;text-align:center">${c.fuel}t</td>
        <td style="padding:12px 16px;text-align:center">${c.battDisp}t</td>
        <td style="padding:12px 16px;text-align:center;font-weight:700;color:${c.total === winner.total ? '#2d6a4f' : '#c44b2b'}">${c.total}t</td>
        <td style="padding:12px 16px;text-align:center">${c.rating}</td>
      </tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CarbonWise Report</title>
    <style>body{font-family:Georgia,serif;max-width:860px;margin:0 auto;padding:40px;color:#1a1a1a;background:#fff}
    h1{font-size:32px;font-weight:700;margin-bottom:4px}h2{font-size:20px;margin:32px 0 12px;border-bottom:2px solid #e8e0d4;padding-bottom:8px}
    .meta{font-family:monospace;font-size:12px;color:#666;margin-bottom:32px}
    table{width:100%;border-collapse:collapse;font-size:14px}
    th{font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#666;padding:10px 16px;background:#f5f0e8;text-align:left}
    .winner{background:#f0f7f4;border:2px solid #2d6a4f;border-radius:8px;padding:20px;margin-bottom:24px}
    .winner-name{font-size:24px;font-weight:700;color:#2d6a4f}
    .stat{display:inline-block;margin-right:24px;margin-top:8px}
    .stat-val{font-family:monospace;font-size:20px;font-weight:700;color:#2d6a4f}
    .stat-label{font-family:monospace;font-size:10px;text-transform:uppercase;color:#666}
    .source{font-family:monospace;font-size:11px;color:#888;background:#f5f0e8;padding:12px 16px;border-radius:6px;margin-bottom:8px}
    .note{font-size:12px;color:#888;font-style:italic;margin-top:32px;padding-top:16px;border-top:1px solid #e8e0d4}
    .flag{font-size:12px;color:#888;margin-top:4px}</style></head><body>
    <h1><Leaf size={14} /> CarbonWise Lifecycle Report</h1>
    <div class="meta">Generated: ${date} · ${region} · ${mileage} km/day · ${years} years · Grid: ${gridIntensity} kg CO₂/kWh</div>

    <h2>Winner</h2>
    <div class="winner">
      <div class="winner-name">${winner.name}</div>
      <div style="margin-top:12px">
        <div class="stat"><div class="stat-val">${winner.total}t</div><div class="stat-label">Total CO₂</div></div>
        <div class="stat"><div class="stat-val">${winner.mfg}t</div><div class="stat-label">Manufacturing</div></div>
        <div class="stat"><div class="stat-val">${winner.fuel}t</div><div class="stat-label">Fuel/Energy</div></div>
        <div class="stat"><div class="stat-val">${winner.battDisp}t</div><div class="stat-label">Battery Disposal</div></div>
        <div class="stat"><div class="stat-val">${winner.rating}</div><div class="stat-label">Rating</div></div>
      </div>
      <p style="margin-top:12px;font-size:14px;color:#444">
        For someone driving <strong>${mileage} km/day</strong> in <strong>${region}</strong> over <strong>${years} years</strong>, 
        the ${winner.name} produces the lowest lifecycle CO₂ of the vehicles compared — 
        ${winner.total}t total. ${winner.type === 'ev' ? `Despite a ${winner.mfg}t manufacturing carbon debt, its near-zero running emissions dominate over ${years} years.` : winner.type === 'hybrid' ? `Its efficient engine balances upfront manufacturing cost with low running emissions.` : `Its lower manufacturing footprint gives it a meaningful edge.`}
      </p>
    </div>

    <h2>Full Comparison</h2>
    <table>
      <thead><tr>
        <th>Vehicle</th><th>Type</th><th>Manufacturing</th><th>Fuel/Energy</th><th>Battery Disposal</th><th>Total CO₂</th><th>Rating</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <h2>What These Numbers Mean</h2>
    <p style="font-size:14px;color:#444;line-height:1.7">
      ${winner.total}t CO₂ is equivalent to approximately <strong>${Math.round(winner.total / 0.225).toLocaleString()} Delhi→Mumbai flights</strong>, 
      or requires <strong>${Math.round(winner.total * 46).toLocaleString()} trees</strong> planted today (absorbing CO₂ over 10 years each) to offset.
      ${cars.length > 1 ? `Compared to the highest-emitting option (${cars.reduce((a,b)=>a.total>b.total?a:b).name} at ${cars.reduce((a,b)=>a.total>b.total?a:b).total}t), choosing the ${winner.name} avoids ${(cars.reduce((a,b)=>a.total>b.total?a:b).total - winner.total).toFixed(1)}t CO₂.` : ''}
    </p>

    <h2>Methodology</h2>
    <p style="font-size:13px;color:#555;line-height:1.7">Lifecycle CO₂ = Manufacturing + Operational Emissions + End-of-Life Battery Disposal.</p>
    <div class="source">Manufacturing CO₂: EEA 2023 (doi:10.2760/141427) + EPA LCAT Tool 2023 + per-OEM LCA reports (Toyota 2022, Honda 2021, Suzuki 2023)</div>
    <div class="source">Battery Disposal: EEA Report No 14/2021 — 0.14 t CO₂/kWh net (after recycling credit) · Ellingsen et al. 2016 · Romare &amp; Dahlöf 2017 (IVL C243)</div>
    <div class="source">EV Energy Use: ARAI/MIDC certified × 1.25 real-world factor · ICE Fuel Use: ARAI certified × 1.18 real-world factor</div>
    <div class="source">ICE CO₂ factor: 2.31 kg CO₂/litre petrol (IPCC AR6 WG3, MoEFCC India)</div>
    <div class="source">Grid Intensity — India states: Central Electricity Authority (CEA) CO₂ Baseline Database v18, 2023 · Global: IEA Electricity 2023 · USA: EPA eGRID 2023</div>

    <h2>Assumptions</h2>
    <p style="font-size:13px;color:#555;line-height:1.8">
      · Daily mileage: ${mileage} km/day (${(mileage * 365).toLocaleString()} km/year)<br>
      · Ownership period: ${years} years (${(mileage * 365 * years).toLocaleString()} km total)<br>
      · Grid intensity: ${gridIntensity} kg CO₂/kWh (${region})<br>
      · Battery disposal cost applied at end of vehicle life<br>
      · Real-world energy/fuel use applies manufacturer correction factors<br>
      · Petrol emission factor: 2.31 kg CO₂/L (IPCC AR6)
    </p>

    <div class="note">This report was generated by CarbonWise (carbonwise.in). Data sourced from EPA, EEA, CEA, IEA, and per-manufacturer LCA reports. 
    All lifecycle estimates use publicly available data and standard IPCC methodology. This is an informational tool — individual results may vary.</div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `carbonwise-report-${winner.key}-${state || country}.html`;
    a.click(); URL.revokeObjectURL(url);
  }

  function shareResults() {
    const params = new URLSearchParams({ carA, carB, mileage, years, country, state });
    if (carC) params.set('carC', carC);
    const url = `${window.location.origin}/compare?${params.toString()}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        window.prompt('Copy this link:', url);
      });
    } else {
      window.prompt('Copy this link:', url);
    }
  }

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading]   = useState(false);

  const [gwInput, setGwInput]       = useState('');
  const [gwResult, setGwResult]     = useState(null);
  const [gwLoading, setGwLoading]   = useState(false);

  const resultsRef = useRef(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('carA')) setCarA(p.get('carA'));
    if (p.get('carB')) setCarB(p.get('carB'));
    if (p.get('carC')) setCarC(p.get('carC'));
    if (p.get('mileage')) setMileage(+p.get('mileage'));
    if (p.get('years'))   setYears(+p.get('years'));
    if (p.get('country')) setCountry(p.get('country'));
    if (p.get('state'))   setState(p.get('state'));
  }, []);

  const gridIntensity = getGridIntensity(country, country === 'india' ? state : null);

  function runCompare() {
    const ra = calcLifecycle(carA, gridIntensity, mileage, years);
    const rb = calcLifecycle(carB, gridIntensity, mileage, years);
    const rc = carC ? calcLifecycle(carC, gridIntensity, mileage, years) : null;
    setResults({ ra, rb, rc });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  async function askAI() {
    if (!aiQuestion.trim() || !results) return;
    const q = aiQuestion.trim();
    setAiQuestion('');
    setAiMessages(prev => [...prev, { role: 'user', text: q }]);
    setAiLoading(true);
    const region = country === 'india'
      ? (GRID_DATA.india.states[state]?.label ?? state)
      : (GRID_DATA[country]?.label ?? country);
    const carSummary = [results.ra, results.rb, results.rc].filter(Boolean)
      .map(c => `${c.name} (${c.type.toUpperCase()}): mfg=${c.mfg}t, fuel=${c.fuel}t, battDisp=${c.battDisp}t, TOTAL=${c.total}t`)
      .join(' | ');
    const dynamicContext = `User scenario: ${region}, grid=${gridIntensity}kg CO₂/kWh, ${mileage}km/day, ${years} years ownership. Live lifecycle results: ${carSummary}. Battery disposal uses 0.14t CO₂/kWh formula (EEA 2021). Manufacturing from IVL/ARAI/GREET sources.`;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, context: dynamicContext, history: aiMessages }),
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Connection error.' }]);
    }
    setAiLoading(false);
  }

  async function checkGW() {
    if (!gwInput.trim()) return;
    setGwLoading(true);
    setGwResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/greenwash-ai/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: gwInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGwResult(data);
    } catch {
      setGwResult({ score: 50, verdict: 'misleading', summary: 'Analysis failed. Please try again.', flags: [], what_they_should_say: '' });
    }
    setGwLoading(false);
  }

  const cars = results ? [results.ra, results.rb, results.rc].filter(Boolean) : [];
  const winner = cars.length ? cars.reduce((a, b) => a.total < b.total ? a : b) : null;

  const barData = results ? {
    labels: cars.map(c => c.name),
    datasets: [{
      label: 'Total CO₂ (t)',
      data: cars.map(c => c.total),
      backgroundColor: cars.map(c => c.type === 'ev' ? '#4A7C59' : c.type === 'hybrid' ? '#D4860A' : '#C44B2B'),
      borderRadius: 4,
    }]
  } : null;

  const chartOpts = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v + 't' } } } };

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Page Hero */}
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(25,32,18,0.70)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <Link to="/go-green" className="page-hero__back"><ArrowLeft size={14} /> Back to Go Green</Link>
          <h1 className="page-hero__title">Compare Cars<br /><em style={{ fontStyle: 'italic', color: 'var(--olive-muted)' }}>by carbon,</em><br />not horsepower.</h1>
          <p className="page-hero__sub">Full lifecycle breakdown. Pick your cars. Set your scenario. See the truth.</p>
        </div>
      </div>

      {/* Form */}
      <section style={{ background: 'var(--cream)', padding: '60px 0' }}>
        <div className="container">
          <div className="section-label">Step 1: Choose Vehicles</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 32 }}>
            {[['Vehicle A', carA, setCarA], ['Vehicle B', carB, setCarB], ['Vehicle C (optional)', carC, setCarC]].map(([label, val, setter]) => (
              <div key={label} style={{ background: '#fff', border: `2px solid ${val ? 'var(--olive)' : 'var(--border)'}`, borderRadius: 14, padding: 24, transition: 'border-color 0.2s' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>{label}</div>
                <select className="form-select" value={val} onChange={e => setter(e.target.value)}>
                  {label.includes('optional') && <option value="">None</option>}
                  {CAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="section-label" style={{ marginTop: 32 }}>Step 2: Your Scenario</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, padding: 24, background: 'var(--cream-dark)', borderRadius: 14 }}>
            <div>
              <label className="form-label">Daily Mileage: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{mileage} km/day</span></label>
              <input type="range" className="form-range" min={10} max={150} value={mileage} onChange={e => setMileage(+e.target.value)} />
            </div>
            <div>
              <label className="form-label">Years of Ownership: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{years} years</span></label>
              <input type="range" className="form-range" min={1} max={15} value={years} onChange={e => setYears(+e.target.value)} />
            </div>
            <div>
              <label className="form-label">Country</label>
              <select className="form-select" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="india">India (select state below)</option>
                {COUNTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {country === 'india' && (
              <div>
                <label className="form-label">State Grid: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{gridIntensity} kg CO₂/kWh</span></label>
                <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                  {Object.entries(GRID_DATA.india.states).map(([k, s]) => (
                    <option key={k} value={k}>{s.label} ({s.intensity})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runCompare} className="btn btn--primary" style={{ padding: '16px 48px', fontSize: 14 }}>
              <BarChart2 size={16} /> Compare Now
            </motion.button>
          </div>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.section ref={resultsRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--cream-dark)', padding: '60px 0' }}>
            <div className="container">
              <div className="section-label">Results</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 8 }}>
                {cars.map(c => c.name).join(' vs ')}
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.08em', marginBottom: 16 }}>
                {country === 'india' ? GRID_DATA.india.states[state]?.label : GRID_DATA[country]?.label} · {mileage}km/day · {years} years · {gridIntensity} kg CO₂/kWh
              </p>
              {/* Confidence range notice + Rating legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', background: 'rgba(212,134,10,0.07)', border: '1px solid rgba(212,134,10,0.18)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  <AlertTriangle size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  <span>All figures carry ±20% uncertainty. <a href="https://doi.org/10.2760/141427" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--olive)', textDecoration: 'underline' }}>EEA 2023</a> · <a href="https://www.ipcc.ch/report/ar6/wg3/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--olive)', textDecoration: 'underline' }}>IPCC AR6</a></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginRight: 2 }}>Rating:</span>
                  {RATING_LEGEND.map(r => (
                    <span key={r.rating} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span className={`rating ${r.cls}`} style={{ width: 24, height: 24, fontSize: 10 }}>{r.rating}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{r.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 32 }}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Total Lifecycle CO₂ (tonnes)</div>
                  <Bar data={barData} options={chartOpts} />
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Upfront Carbon Debt vs Long-Term Savings</div>
                    <div title="Manufacturing + battery disposal carbon is paid upfront. As km accumulates, the vehicle with lowest fuel emissions pulls ahead. Where lines diverge = your savings compound." style={{ cursor: 'help', color: 'var(--text-muted)' }}><Info size={13} /></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '.06em' }}>
                    D3.js · Shaded band = manufacturing carbon debt zone · Hover for values
                  </div>
                  <D3BreakevenChart cars={cars} mileage={mileage} years={years} />
                </div>
              </div>

              {/* Scorecard */}
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <thead>
                  <tr>
                    <th style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 20px', background: 'var(--cream-dark)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Category</th>
                    {cars.map(c => <th key={c.key} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 20px', background: 'var(--cream-dark)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{c.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Manufacturing', key: 'mfg', icon: 'Factory', note: 'ICE/Hybrid: EEA EU fleet avg proxy — India-assembled cars may vary ±1–2t' },
                    { label: 'Fuel / Energy', key: 'fuel', icon: 'Fuel' },
                    { label: 'Battery Disposal', key: 'battDisp', icon: 'Battery' },
                    { label: 'TOTAL LIFECYCLE', key: 'total', bold: true },
                  ].map(row => (
                    <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '18px 20px', fontSize: row.bold ? 12 : 14, fontWeight: row.bold ? 700 : 400, fontFamily: row.bold ? 'var(--font-mono)' : 'inherit', textTransform: row.bold ? 'uppercase' : 'none', letterSpacing: row.bold ? '.1em' : 0 }}><span style={{display:'flex',alignItems:'center',gap:6}}>{row.icon === 'Factory' ? <Factory size={12} /> : row.icon === 'Fuel' ? <Fuel size={12} /> : row.icon === 'Battery' ? <Battery size={12} /> : null}{row.label}</span></td>
                      {cars.map(c => {
                        const val = c[row.key];
                        const minVal = Math.min(...cars.map(x => x[row.key] || 0));
                        const color = row.bold ? (val === minVal ? 'var(--green-ok)' : 'var(--rust)') : 'inherit';
                        return (
                          <td key={c.key} style={{ padding: '18px 20px', fontSize: row.bold ? 18 : 14, fontWeight: row.bold ? 700 : 400, color }}>
                            {row.bold && val ? (
                              <div>
                                <span>{val}t CO₂</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>
                                  ±20%
                                </span>
                                {val === minVal ? <CheckCircle size={14} style={{ color: 'var(--green-ok)', display: 'inline', marginLeft: 6 }} /> : <XCircle size={14} style={{ color: 'var(--rust)', display: 'inline', marginLeft: 6 }} />}
                              </div>
                            ) : val ? `${val}t CO₂` : 'N/A'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Impact Numbers — "So what?" */}
              {winner && (
                <div style={{ background: 'var(--carbon)', color: 'var(--cream)', borderRadius: 14, padding: 28, marginTop: 28 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--olive-muted)', marginBottom: 16 }}>
                    <Lightbulb size={14} /> {winner.total}t CO₂ — what does that actually mean?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {getImpactLines(winner.total, mileage, years).map((line, i) => (
                      <div key={i} style={{ fontSize: 14, color: 'rgba(245,240,232,0.85)', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(245,240,232,0.07)' : 'none', lineHeight: 1.5 }}>
                        {line}
                      </div>
                    ))}
                  </div>
                  {cars.length > 1 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(245,240,232,0.1)', fontSize: 12, color: 'rgba(245,240,232,0.45)', fontFamily: 'var(--font-mono)' }}>
                      Worst option: {cars.reduce((a,b)=>a.total>b.total?a:b).name} at {cars.reduce((a,b)=>a.total>b.total?a:b).total}t — 
                      {' '}{(cars.reduce((a,b)=>a.total>b.total?a:b).total - winner.total).toFixed(1)}t more than the winner · {Math.round((cars.reduce((a,b)=>a.total>b.total?a:b).total - winner.total)*46)} extra trees needed to offset
                    </div>
                  )}
                </div>
              )}

              {/* AI Panel */}
              <div style={{ background: 'var(--carbon)', color: 'var(--cream)', borderRadius: 14, padding: 36, marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <Bot size={20} style={{ color: 'var(--olive-muted)' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>AI Recommendation</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--olive-muted)', marginLeft: 'auto' }}>Powered by Groq</span>
                </div>
                <div style={{ fontSize: 15, color: 'rgba(245,240,232,.8)', lineHeight: 1.7, marginBottom: 20 }}>
                  {winner && `In ${country === 'india' ? GRID_DATA.india.states[state]?.label : GRID_DATA[country]?.label} at ${mileage}km/day over ${years} years, the `}
                  <strong>{winner?.name}</strong>
                  {winner && ` wins with ${winner.total}t total lifecycle CO₂, the lowest of your selected vehicles. ${winner.type === 'ev' ? `Despite higher manufacturing cost (${winner.mfg}t), its clean running emissions dominate over ${years} years.` : winner.type === 'hybrid' ? `Its efficient engine balances manufacturing and running costs well on your grid.` : `Lower manufacturing and moderate running costs give it the edge here.`}`}
                </div>

                {aiMessages.map((m, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 8, background: m.role === 'user' ? 'rgba(245,240,232,0.08)' : 'rgba(61,74,46,0.2)', fontSize: 14 }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', opacity: .6 }}>{m.role === 'user' ? 'YOU ASKED' : 'AI REPLY'}</strong>
                    <div style={{ marginTop: 6, lineHeight: 1.6 }}>{m.text}</div>
                  </div>
                ))}
                {aiLoading && <div style={{ padding: '10px 16px', opacity: .5, fontStyle: 'italic', fontSize: 14 }}>Thinking...</div>}

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <input
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAI()}
                    placeholder="Ask a follow-up e.g. 'what if I move to Himachal Pradesh?'"
                    style={{ flex: 1, background: 'rgba(245,240,232,.06)', border: '1px solid rgba(245,240,232,.12)', borderRadius: 8, padding: '12px 16px', color: 'var(--cream)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }}
                  />
                  <button onClick={askAI} className="btn btn--rust" disabled={aiLoading}>
                    <Send size={14} /> Ask AI
                  </button>
                </div>
              </div>

              {/* Greenwash Detector */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 32, marginTop: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={20} style={{ color: 'var(--rust)' }} /> Greenwash Detector
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Paste any marketing claim to check its honesty — or see real examples below.</p>

                {/* Real Examples */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Verified Real-World Cases</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {GW_REAL_EXAMPLES.map((ex, i) => (
                      <div key={i} style={{ background: 'var(--cream-dark)', borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${ex.score > 40 ? 'var(--amber)' : 'var(--rust)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{ex.brand}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontStyle: 'italic', color: 'var(--rust)' }}>{ex.claim}</span>
                          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: ex.score > 40 ? 'var(--amber)' : 'var(--rust)' }}>{ex.score}/100</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ex.reality}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}><Search size={14} /> Check Your Own Claim — AI-Powered Analysis</div>
                  <textarea value={gwInput} onChange={e => setGwInput(e.target.value)} placeholder="Paste any car marketing claim e.g. 'This vehicle produces zero emissions and is carbon neutral...'" style={{ width: '100%', minHeight: 90, padding: '12px 14px', resize: 'vertical', background: 'var(--cream-dark)', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
                  <button onClick={checkGW} disabled={gwLoading} className="btn btn--rust" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {gwLoading ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analysing...</> : <><Search size={14} /> Analyse with AI</>}
                  </button>
                  <AnimatePresence>
                  {gwResult && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, background: '#fff', border: `2px solid ${gwResult.score > 65 ? 'rgba(45,106,79,0.3)' : gwResult.score > 40 ? 'rgba(180,83,9,0.3)' : 'rgba(192,57,43,0.3)'}`, borderRadius: 14, overflow: 'hidden' }}>
                      {/* Score bar */}
                      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${gwResult.score}%` }} transition={{ duration: 0.9 }} style={{ height: '100%', background: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)', flexShrink: 0 }}>{gwResult.score}/100</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 10px', borderRadius: 100, background: gwResult.score > 65 ? 'rgba(45,106,79,0.1)' : gwResult.score > 40 ? 'rgba(180,83,9,0.1)' : 'rgba(192,57,43,0.1)', color: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)', textTransform: 'uppercase', letterSpacing: '.1em', flexShrink: 0 }}>
                          {gwResult.verdict}
                        </span>
                      </div>
                      {/* Summary */}
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                        {gwResult.summary}
                      </div>
                      {/* Flags */}
                      {gwResult.flags?.length > 0 && (
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Issues Identified</div>
                          {gwResult.flags.map((f, i) => (
                            <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', gap: 8, lineHeight: 1.5 }}>
                              <AlertTriangle size={13} style={{ color: 'var(--rust)', flexShrink: 0, marginTop: 2 }} />{f}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* What they should say */}
                      {gwResult.what_they_should_say && (
                        <div style={{ padding: '14px 20px', background: 'rgba(45,106,79,0.04)' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-ok)', marginBottom: 6 }}><CheckCircle size={14} /> A More Honest Version</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>"{gwResult.what_they_should_say}"</div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Winner Banner */}
              {winner && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, var(--olive) 0%, var(--olive-light) 100%)', color: 'var(--cream)', borderRadius: 14, padding: 36, marginTop: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
                    <Trophy size={56} style={{ flexShrink: 0, opacity: .8 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,240,232,.6)', marginBottom: 8 }}>Best for your inputs</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700 }}>{winner.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(245,240,232,.7)', marginTop: 4 }}>
                        {winner.total}t total · Rating {winner.rating} · {mileage}km/day · {years} years
                      </div>
                    </div>
                  </div>

                  {/* What next CTA row */}
                  <div style={{ borderTop: '1px solid rgba(245,240,232,0.15)', paddingTop: 20, marginBottom: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', marginBottom: 14 }}>What's next?</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <button onClick={shareResults} className="btn btn--ghost">
                        <Share2 size={14} /> {copied ? '✓ Copied!' : 'Share Results'}
                      </button>
                      <button onClick={() => downloadReport({ cars, winner, mileage, years, country, state, gridIntensity })} className="btn" style={{ background: 'rgba(245,240,232,0.12)', color: 'var(--cream)', border: '1px solid rgba(245,240,232,0.2)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <Download size={14} /> Download Report
                      </button>
                      <Link to={`/showroom-mirror?car=${winner.key}&state=${state}`} className="btn" style={{ background: 'rgba(245,240,232,0.12)', color: 'var(--cream)', border: '1px solid rgba(245,240,232,0.2)' }}>
                        <Search size={14} /> Truth Mirror for {winner.name.split(' ').slice(-1)[0]}
                      </Link>
                      <Link to="/calculator" className="btn" style={{ background: '#fff', color: 'var(--olive)' }}>
                        Calculate Personally
                      </Link>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
                      <Lightbulb size={14} /> Share card copies a link you can paste on WhatsApp or Instagram
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3,1fr)"],
          div[style*="grid-template-columns: 1fr 1fr"],
          div[style*="grid-template-columns: repeat(2,1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
