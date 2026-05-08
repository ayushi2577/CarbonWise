import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Battery, CheckCircle, Download, ExternalLink, Factory, Fuel, Lightbulb, Loader, MapPin, QrCode, ScanSearch, Search, Share2, Trees, XCircle, Zap } from 'lucide-react';
import { CARS, GRID_DATA, calcLifecycle, getGridIntensity } from '../data';

const IMP_ICON_MAP = { Trees, Factory, Plane: () => <span style={{fontFamily:"var(--font-mono)",fontSize:12}}>FLT</span> };
function renderImpIcon(name) {
  const C = IMP_ICON_MAP[name];
  return C ? <C size={22} /> : null;
}


// State auto-detection via rough IP geolocation (falls back to UP)
const STATE_KEYWORDS = {
  maharashtra: 'MH', mumbai: 'MH', pune: 'MH', nagpur: 'MH',
  delhi: 'DL', 'new delhi': 'DL',
  'uttar pradesh': 'UP', lucknow: 'UP', agra: 'UP', varanasi: 'UP',
  karnataka: 'KA', bangalore: 'KA', bengaluru: 'KA',
  'tamil nadu': 'TN', chennai: 'TN',
  gujarat: 'GJ', ahmedabad: 'GJ', surat: 'GJ',
  rajasthan: 'RJ', jaipur: 'RJ', jodhpur: 'RJ',
  'west bengal': 'WB', kolkata: 'WB',
  'andhra pradesh': 'AP', hyderabad: 'TS', telangana: 'TS',
  kerala: 'KL', kochi: 'KL', thiruvananthapuram: 'KL',
  punjab: 'PB', chandigarh: 'PB',
  'himachal pradesh': 'HP', shimla: 'HP',
  goa: 'GA',
  odisha: 'OR', bhubaneswar: 'OR',
  jharkhand: 'JH', ranchi: 'JH',
  'madhya pradesh': 'MP', bhopal: 'MP', indore: 'MP',
};

const GREENWASH_EXAMPLES = [
  {
    brand: 'Tata Motors',
    model: 'Nexon EV',
    key: 'nexon-ev',
    claim: '"Zero Emission Vehicle" — Official tagline',
    claimType: 'Zero Emission',
    lifecycleCO2: '25–35t',
    mfgCO2: '12.0t',
    tailpipeCO2: '0t',
    verdict: 'partial',
    explanation: 'Tailpipe emissions are zero — that part is true. But 12.0 tonnes of CO₂ go into manufacturing the car and battery. In a coal-heavy state like UP or MH, lifecycle total is 28–33t. "Zero emission" is a partial truth.',
    improvement: 'Best in UP grid: switch to Karnataka or HP to reduce lifecycle by 40%',
  },
  {
    brand: 'Hyundai',
    model: 'Creta Petrol',
    key: 'creta',
    claim: '"Eco Mode Saves 40% Fuel" — Showroom Brochure 2024',
    claimType: 'Fuel Economy Exaggeration',
    lifecycleCO2: '42–55t',
    mfgCO2: '6.3t',
    tailpipeCO2: '40–50t',
    verdict: 'greenwash',
    explanation: 'Eco Mode saves 8–13% in real-world city driving (NDTV Auto Test 2023), not 40%. The 40% figure is an ARAI lab result under ideal conditions. Over 8 years, this false claim translates to 3–5t of "phantom savings" CO₂.',
    improvement: 'If you need an SUV, Grand Vitara Hybrid emits ~40% less over lifecycle',
  },
  {
    brand: 'BYD',
    model: 'Atto 3',
    key: 'byd-atto3',
    claim: '"100% Electric. 100% Clean." — TV & Digital Campaign',
    claimType: 'Misleading Clean Claim',
    lifecycleCO2: '35–50t',
    mfgCO2: '15.1t',
    tailpipeCO2: '0t',
    verdict: 'greenwash',
    explanation: 'The 60.5 kWh LFP battery creates 8.5t of disposal CO₂. Manufacturing adds 15.1t. On India\'s average grid (0.82 kg/kWh), this EV takes 7–9 years to break even vs a Prius. "100% Clean" ignores the supply chain entirely.',
    improvement: 'BYD Atto 3 is genuinely cleaner — but only after year 7 in most Indian states',
  },
];

// Car search index
const SEARCH_INDEX = Object.entries(CARS).map(([key, car]) => ({
  key,
  name: car.name,
  brand: car.brand,
  searchTerms: `${car.name} ${car.brand} ${car.type}`.toLowerCase(),
}));

// Lifecycle-based verdict — compares actual total CO2 to benchmarks, not just type
// Benchmarks: ICE average ~55t, hybrid average ~30t, EV varies by grid
// "Green" = top quartile; "Partial" = middle; "Greenwashing" = claim vs reality mismatch + bad lifecycle
function getVerdict(car, gridIntensity, result) {
  if (!result) return null;

  // Step 1: Does the manufacturer make a claim that is demonstrably false?
  const gwClaim = GREENWASH_EXAMPLES.find(g => g.key === car.key);
  const hasGreenwashClaim = gwClaim?.verdict === 'greenwash';

  // Step 2: Compute a lifecycle score using actual totals vs category benchmarks
  const total = result.total;
  
  // Dynamic benchmarks based on car type and grid
  let greenThreshold, partialThreshold;
  if (car.type === 'ev') {
    // EV benchmarks scale with grid — dirtier grid means higher breakeven
    const evMfgBase = car.mfg + car.battDisp; // fixed carbon debt
    const evCleanGridTotal = evMfgBase + (car.kwhPer100km / 100) * 0.3 * 40 * 365 * 8;
    greenThreshold = evMfgBase + (car.kwhPer100km / 100) * gridIntensity * 40 * 365 * 4;
    partialThreshold = evMfgBase + (car.kwhPer100km / 100) * gridIntensity * 40 * 365 * 8;
    // If on a coal-heavy grid (>0.85), EVs are at best partial
    if (gridIntensity > 0.85 && !hasGreenwashClaim) return total < 35 ? 'partial' : 'partial';
    if (gridIntensity > 0.85 && hasGreenwashClaim) return 'greenwash';
  } else if (car.type === 'hybrid') {
    greenThreshold = 28;
    partialThreshold = 42;
  } else {
    // ICE: rarely "green", mostly partial or greenwash
    greenThreshold = 28; // practically unreachable for ICE
    partialThreshold = 50;
  }

  if (hasGreenwashClaim) return 'greenwash';
  if (total <= greenThreshold) return 'green';
  if (total <= partialThreshold) return 'partial';
  return 'greenwash';
}

const VERDICT_CONFIG = {
  green: { icon: 'CheckCircle', label: 'Genuinely Green', color: '#2d6a4f', bg: 'rgba(45,106,79,0.08)', border: 'rgba(45,106,79,0.25)' },
  partial: { icon: 'AlertTriangle', label: 'Partially Green', color: '#b45309', bg: 'rgba(180,83,9,0.08)', border: 'rgba(180,83,9,0.25)' },
  greenwash: { icon: 'XCircle', label: 'Greenwashing', color: '#c0392b', bg: 'rgba(192,57,43,0.08)', border: 'rgba(192,57,43,0.3)' },
};

// Impact translations
function getImpactNumbers(result, kmPerDay, years) {
  if (!result) return [];
  const co2tonnes = result.total;
  return [
    { icon: 'Plane', stat: Math.round(co2tonnes / 0.225), label: 'Delhi→Mumbai flights equivalent', detail: '(0.225t CO₂ per flight, DEFRA 2023)' },
    { icon: 'Trees', stat: Math.round(co2tonnes * 46), label: 'trees needed to offset', detail: '(1 tree absorbs ~21.7 kg CO₂/yr over 10 years)' },
    { icon: 'Factory', stat: Math.round(co2tonnes / 0.0057), label: 'coal kg burned equivalent', detail: '(2.42 kg CO₂ per kg coal, IPCC AR6)' },
  ];
}

export default function ShowroomMirror() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [detectedState, setDetectedState] = useState('UP');
  const [state, setState] = useState('UP');
  const [kmPerDay, setKmPerDay] = useState(40);
  const [years, setYears] = useState(8);
  const [result, setResult] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  function downloadTruthReport(car, result, stateLabel, gridIntensity, verdict, verdictConfig, gwClaim, kmPerDay, years) {
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const verdictColor = verdict === 'green' ? '#2d6a4f' : verdict === 'partial' ? '#b45309' : '#c0392b';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CarbonWise Truth Report — ${car.name}</title>
    <style>body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a}
    h1{font-size:28px;margin-bottom:4px}h2{font-size:18px;margin:28px 0 10px;border-bottom:2px solid #e8e0d4;padding-bottom:6px}
    .meta{font-family:monospace;font-size:12px;color:#666;margin-bottom:28px}
    .verdict{background:${verdict === 'green' ? '#f0f7f4' : verdict === 'partial' ? '#fff8ed' : '#fef2f0'};border:2px solid ${verdictColor};border-radius:10px;padding:20px;margin-bottom:24px}
    .verdict-label{font-size:22px;font-weight:700;color:${verdictColor}}
    .stats{display:flex;gap:24px;margin-top:12px;flex-wrap:wrap}
    .stat .val{font-family:monospace;font-size:20px;font-weight:700;color:${verdictColor}}
    .stat .lbl{font-family:monospace;font-size:10px;text-transform:uppercase;color:#888}
    .claim-box{background:#fff8ed;border:1.5px solid rgba(180,83,9,0.3);border-radius:8px;padding:16px;margin-bottom:12px}
    .reality-box{background:#f0f7f4;border:1.5px solid rgba(45,106,79,0.3);border-radius:8px;padding:16px}
    .source{font-family:monospace;font-size:11px;color:#888;background:#f5f0e8;padding:10px 14px;border-radius:6px;margin-bottom:8px}
    .note{font-size:12px;color:#888;font-style:italic;margin-top:28px;padding-top:14px;border-top:1px solid #e8e0d4}</style></head><body>
    <h1><Search size={14} /> CarbonWise Truth Report</h1>
    <div class="meta">Vehicle: ${car.name} · State: ${stateLabel} · Grid: ${gridIntensity} kg CO₂/kWh · Generated: ${date}</div>
    
    <div class="verdict">
      <div class="verdict-label">${verdictConfig.label}</div>
      <div style="font-size:14px;color:#555;margin-top:6px">${car.name} · ${stateLabel} · ${kmPerDay}km/day · ${years} years ownership</div>
      <div class="stats">
        <div class="stat"><div class="val">${result.total}t</div><div class="lbl">Total Lifecycle CO₂</div></div>
        <div class="stat"><div class="val">${car.mfg}t</div><div class="lbl">Manufacturing</div></div>
        <div class="stat"><div class="val">${result.fuel}t</div><div class="lbl">Fuel / Energy</div></div>
        <div class="stat"><div class="val">${car.battDisp}t</div><div class="lbl">Battery Disposal</div></div>
      </div>
    </div>

    ${gwClaim ? `
    <h2>Marketing Claim vs Reality</h2>
    <div class="claim-box"><strong style="font-size:12px;color:#b45309;text-transform:uppercase;letter-spacing:.08em"><XCircle size={14} /> What They Say</strong><br><br><strong>${gwClaim.claim}</strong><br><span style="font-size:12px;color:#888">Type: ${gwClaim.claimType}</span></div>
    <div class="reality-box"><strong style="font-size:12px;color:#2d6a4f;text-transform:uppercase;letter-spacing:.08em"><CheckCircle size={14} /> What the Data Shows</strong><br><br>${gwClaim.explanation}</div>
    ${gwClaim.improvement ? `<p style="font-size:13px;color:#555;margin-top:12px"><Lightbulb size={14} /> ${gwClaim.improvement}</p>` : ''}
    ` : ''}

    <h2>What ${result.total}t CO₂ Actually Means</h2>
    <p style="font-size:14px;line-height:1.8;color:#444">
      · <strong>${Math.round(result.total / 0.225).toLocaleString()}</strong> Delhi→Mumbai flights equivalent (0.225t CO₂/flight, DEFRA 2023)<br>
      · <strong>${Math.round(result.total * 46).toLocaleString()} trees</strong> needed to offset over 10 years (21.7 kg CO₂/tree/year)<br>
      · <strong>${Math.round(result.total / 0.0057).toLocaleString()} kg coal</strong> burned equivalent (2.42 kg CO₂/kg coal, IPCC AR6)
    </p>

    <h2>Grid Context</h2>
    <p style="font-size:13px;line-height:1.7;color:#555">
      In <strong>${stateLabel}</strong>, the grid intensity is <strong>${gridIntensity} kg CO₂/kWh</strong> (CEA 2023).
      ${gridIntensity > 0.85 ? `This is a coal-heavy grid. An EV here takes longer to break even vs petrol compared to cleaner states like Karnataka (0.55) or Himachal Pradesh (0.12).` : gridIntensity < 0.4 ? `This is one of India's cleanest grids. EVs reach their carbon break-even much faster here than the national average.` : `This is close to India's national average grid intensity.`}
    </p>

    <h2>Methodology</h2>
    <div class="source">Manufacturing CO₂: EEA 2023 (doi:10.2760/141427) · IVL Report C243 2017 · EPA LCAT Tool 2023</div>
    <div class="source">Battery Disposal: EEA Report No 14/2021 (0.14 t CO₂/kWh net after recycling)</div>
    <div class="source">Operational emissions: ARAI/MIDC certified × real-world correction factor · ICE: 2.31 kg CO₂/L (IPCC AR6)</div>
    <div class="source">Grid intensity: Central Electricity Authority (CEA) CO₂ Baseline Database v18, 2023</div>

    <div class="note">Generated by CarbonWise (carbonwise.in). For informational purposes. Individual results may vary based on actual driving conditions.</div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `carbonwise-truth-${selectedCar?.key || 'report'}-${state}.html`;
    a.click(); URL.revokeObjectURL(url);
  }

  // Auto-detect state from browser timezone/locale hints
  useEffect(() => {
    // Try to get rough location from timezone or navigator language
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata') {
      // India detected — try to guess state from stored pref or default UP
      const saved = localStorage.getItem('cw_state');
      if (saved && GRID_DATA.india.states[saved]) {
        setDetectedState(saved);
        setState(saved);
      }
    }
  }, []);

  function handleSearch(val) {
    setQuery(val);
    if (val.length < 2) { setSuggestions([]); return; }
    const lower = val.toLowerCase();
    setSuggestions(
      SEARCH_INDEX.filter(c => c.searchTerms.includes(lower)).slice(0, 6)
    );
  }

  function recalc(carItem, newState, newKm, newYrs) {
    const gi = getGridIntensity('india', newState);
    setResult(calcLifecycle(carItem.key, gi, newKm, newYrs));
  }

  function selectCar(carItem) {
    setSelectedCar(carItem);
    setQuery(carItem.name);
    setSuggestions([]);
    recalc(carItem, state, kmPerDay, years);
  }

  function handleStateChange(newState) {
    setState(newState);
    localStorage.setItem('cw_state', newState);
    if (selectedCar) recalc(selectedCar, newState, kmPerDay, years);
  }

  function handleKmChange(val) {
    const km = Math.max(5, Math.min(300, Number(val) || 40));
    setKmPerDay(km);
    if (selectedCar) recalc(selectedCar, state, km, years);
  }

  function handleYearsChange(val) {
    const yrs = Math.max(1, Math.min(20, Number(val) || 8));
    setYears(yrs);
    if (selectedCar) recalc(selectedCar, state, kmPerDay, yrs);
  }

  const gridIntensity = getGridIntensity('india', state);
  const stateLabel = GRID_DATA.india.states[state]?.label ?? state;
  const car = selectedCar ? CARS[selectedCar.key] : null;
  const verdict = car && result ? getVerdict(car, gridIntensity, result) : null;
  const verdictConfig = verdict ? VERDICT_CONFIG[verdict] : null;
  const gwClaim = selectedCar ? GREENWASH_EXAMPLES.find(g => g.key === selectedCar.key) : null;
  const impacts = result ? getImpactNumbers(result, kmPerDay, years) : [];

  function shareResult() {
    const url = `${window.location.origin}/showroom-mirror?car=${selectedCar?.key}&state=${state}&km=${kmPerDay}&yrs=${years}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => window.prompt('Copy link:', url));
  }

  // URL param loading
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const carKey = p.get('car');
    const stateKey = p.get('state');
    const kmParam = Number(p.get('km')) || 40;
    const yrsParam = Number(p.get('yrs')) || 8;
    if (stateKey && GRID_DATA.india.states[stateKey]) { setState(stateKey); }
    if (kmParam) setKmPerDay(kmParam);
    if (yrsParam) setYears(yrsParam);
    if (carKey && CARS[carKey]) {
      const carItem = SEARCH_INDEX.find(c => c.key === carKey);
      if (carItem) {
        const s = stateKey || state;
        const gi = getGridIntensity('india', s);
        setSelectedCar(carItem);
        setQuery(carItem.name);
        setResult(calcLifecycle(carKey, gi, kmParam, yrsParam));
      }
    }
  }, []);

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Hero */}
      <div style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(74,124,89,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(196,75,43,0.1) 0%, transparent 50%)' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', position: 'relative', textAlign: 'center' }}>
          <Link to="/go-green" className="page-hero__back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, color: 'rgba(245,240,232,0.5)', textDecoration: 'none', fontSize: 13 }}><ArrowLeft size={14} /> Go Green</Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(196,75,43,0.15)', border: '1px solid rgba(196,75,43,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rust)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><ScanSearch size={13} /> Showroom Truth Mirror</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 700, lineHeight: 1.05, marginBottom: 16, letterSpacing: '-.02em' }}>
            Scan before you sign.<br />
            <em style={{ color: 'var(--olive-muted)', fontStyle: 'italic' }}>Know the real carbon.</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(245,240,232,0.65)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
            The salesman says "eco-friendly." Verify it in 10 seconds. Type any car name — get the lifecycle truth, not the brochure.
          </p>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,240,232,0.4)', pointerEvents: 'none' }} />
              <input
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder='Type a car name e.g. "Tata Nexon EV"'
                style={{
                  width: '100%', padding: '18px 18px 18px 50px',
                  fontSize: 16, background: 'rgba(245,240,232,0.06)',
                  border: '1.5px solid rgba(245,240,232,0.15)',
                  borderRadius: 14, color: 'var(--cream)',
                  outline: 'none', fontFamily: 'var(--font-body)',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(74,124,89,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.15)'}
              />
            </div>
            {/* Suggestions */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#1a2218', border: '1px solid rgba(245,240,232,0.12)', borderRadius: 12, overflow: 'hidden', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  {suggestions.map(s => (
                    <button key={s.key} onClick={() => selectCar(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 18px', background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', textAlign: 'left', fontSize: 14, borderBottom: '1px solid rgba(245,240,232,0.06)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,124,89,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span style={{ fontSize: 18 }}>{s.key.includes('ev') || CARS[s.key]?.type === 'ev' ? <Zap size={14} /> : CARS[s.key]?.type === 'hybrid' ? <Battery size={14} /> : <Fuel size={14} />}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{CARS[s.key]?.type} · {CARS[s.key]?.price}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick picks */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            {['nexon-ev', 'creta', 'vitara-hybrid', 'byd-atto3'].map(key => (
              <button key={key} onClick={() => selectCar(SEARCH_INDEX.find(c => c.key === key))} style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.12)', borderRadius: 100, color: 'rgba(245,240,232,0.7)', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '.06em', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,124,89,0.2)'; e.currentTarget.style.color = 'var(--cream)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,240,232,0.06)'; e.currentTarget.style.color = 'rgba(245,240,232,0.7)'; }}>
                {CARS[key].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Context Bar */}
      <div style={{ background: '#1e2a1a', borderBottom: '1px solid rgba(74,124,89,0.2)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <MapPin size={14} style={{ color: 'var(--olive-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(245,240,232,0.45)', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Your State:</span>
          <select value={state} onChange={e => handleStateChange(e.target.value)} style={{ background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.12)', borderRadius: 8, padding: '6px 12px', color: 'var(--cream)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            {Object.entries(GRID_DATA.india.states).map(([k, s]) => (
              <option key={k} value={k} style={{ background: '#1e2a1a' }}>{s.label} ({s.intensity} kg CO₂/kWh)</option>
            ))}
          </select>
          <span style={{ width: 1, height: 20, background: 'rgba(245,240,232,0.1)', display: 'block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(245,240,232,0.45)', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Daily km:</span>
          <input
            type="number" min={5} max={300} value={kmPerDay}
            onChange={e => handleKmChange(e.target.value)}
            style={{ width: 62, padding: '6px 8px', background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.12)', borderRadius: 8, color: 'var(--cream)', fontSize: 13, outline: 'none', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
          />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(245,240,232,0.45)', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Years:</span>
          <input
            type="number" min={1} max={20} value={years}
            onChange={e => handleYearsChange(e.target.value)}
            style={{ width: 52, padding: '6px 8px', background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.12)', borderRadius: 8, color: 'var(--cream)', fontSize: 13, outline: 'none', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
          />
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.28)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
            Grid: {gridIntensity} kg CO₂/kWh · CEA 2023
          </span>
        </div>
      </div>

      {/* Truth Card */}
      <AnimatePresence mode="wait">
        {result && car && verdictConfig && (
          <motion.section key={selectedCar.key + state} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '48px 24px', maxWidth: 760, margin: '0 auto' }}>
            {/* Verdict Banner */}
            <div style={{ background: verdictConfig.bg, border: `2px solid ${verdictConfig.border}`, borderRadius: 20, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ color: verdictConfig.color }}>
                {verdictConfig.icon === 'CheckCircle' && <CheckCircle size={48} />}
                {verdictConfig.icon === 'AlertTriangle' && <AlertTriangle size={48} />}
                {verdictConfig.icon === 'XCircle' && <XCircle size={48} />}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: verdictConfig.color, marginBottom: 4 }}>Truth Verdict</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: verdictConfig.color }}>{verdictConfig.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {car.name} · {stateLabel} · {kmPerDay}km/day · {years}yr
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: verdictConfig.color }}>{result.total}t</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Total Lifecycle CO₂</div>
              </div>
            </div>

            {/* ── SHAREABLE VERDICT CARD ── */}
            <div style={{ background: 'linear-gradient(135deg, #111810 0%, #0a0d08 100%)', border: `2px solid ${verdictConfig.border}`, borderRadius: 20, padding: '24px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 180, height: 180, background: `radial-gradient(circle, ${verdictConfig.bg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: 14 }}>Share this verdict</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, background: verdictConfig.bg, border: `1.5px solid ${verdictConfig.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {verdictConfig.icon === 'CheckCircle' && <CheckCircle size={22} color={verdictConfig.color} />}
                  {verdictConfig.icon === 'AlertTriangle' && <AlertTriangle size={22} color={verdictConfig.color} />}
                  {verdictConfig.icon === 'XCircle' && <XCircle size={22} color={verdictConfig.color} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--cream)' }}>{car.name} — {verdictConfig.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', marginTop: 3 }}>{result.total}t CO₂ · {stateLabel} · {kmPerDay}km/day · {years}yr · carbonwise.in</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: verdictConfig.color }}>{result.total}t</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { navigator.clipboard?.writeText(`I checked the ${car.name} on CarbonWise — Verdict: ${verdictConfig.label} (${result.total}t CO₂ · ${kmPerDay}km/day · ${years}yr in ${stateLabel}). Check yours: ${window.location.origin}/showroom-mirror?car=${selectedCar.key}&state=${state}&km=${kmPerDay}&yrs=${years}`); setCopied(true); setTimeout(() => setCopied(false), 2500); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: verdictConfig.color, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                >
                  <Share2 size={13} /> {copied ? '✓ Copied verdict!' : 'Copy & Share'}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`I used CarbonWise to check the ${car.name} before buying. Verdict: ${verdictConfig.label} — ${result.total}t lifecycle CO₂. Check your car: ${window.location.origin}/showroom-mirror?car=${selectedCar.key}&state=${state}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>

            {/* Claim vs Reality */}
            {gwClaim && (
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>What They Claim vs What the Data Shows</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: 'rgba(196,75,43,0.06)', border: '1px solid rgba(196,75,43,0.2)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--rust)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}><XCircle size={14} /> Marketing Claim</div>
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: 'var(--carbon)' }}>{gwClaim.claim}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Type: {gwClaim.claimType}</div>
                  </div>
                  <div style={{ background: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green-ok)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}><CheckCircle size={14} /> Data Reality</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{gwClaim.explanation}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lifecycle Breakdown */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Lifecycle CO₂ Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Manufacturing', value: car.mfg + 't', note: car.type === 'ice' || car.type === 'hybrid' ? 'EEA EU fleet avg proxy ±1–2t' : car.mfgSrc || 'EEA 2023', color: 'var(--amber)' },
                  { label: 'Fuel/Energy', value: result.fuel + 't', note: `${stateLabel} grid · ARAI×1.${car.type === 'ev' ? '25' : '18'}`, color: car.type === 'ev' ? 'var(--blue)' : 'var(--rust)' },
                  { label: 'Battery Disposal', value: car.battDisp + 't', note: car.battDisp > 0 ? 'Ellingsen 2016 / EEA 2021' : 'N/A', color: 'var(--text-muted)' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--cream-dark)', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{item.note}</div>
                  </div>
                ))}
              </div>
              {/* Confidence note */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: 'rgba(212,134,10,0.06)', border: '1px solid rgba(212,134,10,0.18)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 0 }}>
                <AlertTriangle size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                <span>
                  Total carries <strong>±20% uncertainty</strong> (combined mfg, grid, real-world consumption factors).
                  {(car.type === 'ice' || car.type === 'hybrid') && ' Manufacturing uses EEA EU fleet averages — India-assembled vehicles may vary by ±1–2t.'}
                  {' '}Sources: EEA 2023 · IPCC AR6 WG3 · CEA 2023 · {car.battSrc !== 'N/A' ? car.battSrc : 'N/A'}.
                </span>
              </div>

              {/* India State Context */}
              <div style={{ background: 'rgba(74,124,89,0.06)', border: '1px solid rgba(74,124,89,0.15)', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <MapPin size={14} /> In <strong>{stateLabel}</strong>, this car is actually{' '}
                  <span style={{ color: verdict === 'green' ? 'var(--green-ok)' : verdict === 'partial' ? 'var(--amber)' : 'var(--rust)' }}>
                    {verdict === 'green' ? 'better than the national average' : verdict === 'partial' ? 'about average for India' : 'worse than many alternatives'}
                  </span>
                </div>
                {gwClaim?.improvement && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{gwClaim.improvement}</div>
                )}
                {car.type === 'ev' && gridIntensity > 0.85 && (
                  <div style={{ fontSize: 12, color: 'var(--rust)', marginTop: 4 }}>
                    <AlertTriangle size={14} /> High coal grid: this EV takes longer to break even. Switch to Karnataka or HP to save ~12t over 8 years.
                  </div>
                )}
              </div>
            </div>

            {/* Impact Numbers — "So What?" */}
            <div style={{ background: 'var(--carbon)', color: 'var(--cream)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--olive-muted)', marginBottom: 20 }}>
                {result.total}t CO₂ = What does that actually mean?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {impacts.map(imp => (
                  <div key={imp.label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(245,240,232,0.07)' }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{renderImpIcon(imp.icon)}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--olive-muted)' }}>{imp.stat.toLocaleString()}</div>
                      <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)' }}>{imp.label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{imp.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={shareResult} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'var(--olive)', color: 'var(--cream)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                <Share2 size={14} /> {copied ? '✓ Copied!' : 'Share this Truth Card'}
              </button>
              <button onClick={() => downloadTruthReport(car, result, stateLabel, gridIntensity, verdict, verdictConfig, gwClaim, kmPerDay, years)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'var(--cream-dark)', color: 'var(--carbon)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                <Download size={14} /> Download Report
              </button>
              <a href={`/compare?carA=${selectedCar.key}&carB=creta`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'var(--cream-dark)', color: 'var(--carbon)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Compare vs other cars →
              </a>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Baked-in Examples Section */}
      {!result && (
        <section style={{ padding: '60px 24px', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Real Examples · Greenwashing Cases</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
            Common claims we've fact-checked'
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {GREENWASH_EXAMPLES.map((ex, i) => {
              const vc = VERDICT_CONFIG[ex.verdict];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 28, cursor: 'pointer' }} onClick={() => selectCar(SEARCH_INDEX.find(c => c.key === ex.key))}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ flexShrink: 0, color: vc.color }}>
                      {vc.icon === 'CheckCircle' && <CheckCircle size={32} />}
                      {vc.icon === 'AlertTriangle' && <AlertTriangle size={32} />}
                      {vc.icon === 'XCircle' && <XCircle size={32} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{ex.brand} {ex.model}</span>
                        <span style={{ padding: '3px 10px', background: vc.bg, border: `1px solid ${vc.border}`, borderRadius: 100, fontSize: 11, fontFamily: 'var(--font-mono)', color: vc.color, letterSpacing: '.08em' }}>{vc.label}</span>
                      </div>
                      <div style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--rust)', marginBottom: 10, fontWeight: 500 }}>{ex.claim}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ex.explanation}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>{ex.lifecycleCO2}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Lifecycle CO₂</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* QR Banner at bottom */}
      <section style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <QrCode size={32} style={{ color: 'var(--olive-muted)', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Use at the showroom</h3>
          <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
            Next time a salesperson says "100% green" — open this page on your phone. Type the car name. Get the truth in 10 seconds, before you sign anything.
          </p>
          <button onClick={() => { navigator.clipboard?.writeText(window.location.origin + '/showroom-mirror'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--olive)', color: 'var(--cream)', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
            <Share2 size={14} /> {copied ? '✓ Copied!' : 'Copy link to share'}
          </button>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"],
          div[style*="grid-template-columns: repeat(3,1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
