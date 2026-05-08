import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Calculator, Zap, Trophy, Medal, Award, Share2, Zap as ZapIcon, Globe } from 'lucide-react';
import { CARS, GRID_DATA, calcLifecycle, getGridIntensity, RATING_LEGEND } from '../data';

const COUNTRY_OPTIONS = Object.entries(GRID_DATA)
  .filter(([k]) => k !== 'india')
  .map(([key, g]) => ({ value: key, label: `${g.label} (${g.intensity} kg/kWh)` }));

function RatingBadge({ rating }) {
  const cls = rating === 'A+' ? 'rating-aplus' : rating === 'A' ? 'rating-a' : rating === 'B' ? 'rating-b' : 'rating-c';
  return <div className={`rating ${cls}`}>{rating}</div>;
}

export default function CalcPage() {
  const [km, setKm]         = useState(40);
  const [yrs, setYrs]       = useState(8);
  const [country, setCountry] = useState('india');
  const [state, setState]   = useState('MH');
  const [budget, setBudget] = useState('all');
  const [vtype, setVtype]   = useState('all');
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  function shareResult() {
    const params = new URLSearchParams({ car: results.top3[0].key, km, yrs, country, state });
    const url = `${window.location.origin}/calculator?${params.toString()}`;
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

  const gridIntensity = getGridIntensity(country, country === 'india' ? state : null);
  const stateLabel = country === 'india'
    ? GRID_DATA.india.states[state]?.label
    : GRID_DATA[country]?.label;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('car')) {
      if (p.get('km'))      setKm(+p.get('km'));
      if (p.get('yrs'))     setYrs(+p.get('yrs'));
      if (p.get('country')) setCountry(p.get('country'));
      if (p.get('state'))   setState(p.get('state'));
    }
  }, []);

  function run() {
    const tiers = budget === 'low' ? ['low'] : budget === 'mid' ? ['low','mid'] : budget === 'high' ? ['mid','high'] : ['low','mid','high'];
    let keys = Object.keys(CARS).filter(k => {
      const c = CARS[k];
      return (vtype === 'all' || c.type === vtype) && tiers.includes(c.tier);
    });
    if (!keys.length) keys = Object.keys(CARS);

    const all = keys.map(k => calcLifecycle(k, gridIntensity, km, yrs)).filter(Boolean).sort((a,b) => a.total - b.total);
    const iceAvg = all.filter(c => c.type === 'ice').reduce((s, c, _, arr) => s + c.total / arr.length, 0);
    setResults({ top3: all.slice(0,3), iceAvg: Math.round(iceAvg) });
  }

  const MedalIcons = [
    <Trophy size={28} style={{ color: '#D4A82A' }} />,
    <Medal  size={24} style={{ color: '#A0A8A0' }} />,
    <Award  size={24} style={{ color: '#C47840' }} />,
  ];

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,28,20,0.68)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <Link to="/go-green" className="page-hero__back"><ArrowLeft size={14} /> Go Green</Link>
          <h1 className="page-hero__title">Which car is<br />best for <em style={{ color: 'var(--olive-muted)', fontStyle: 'italic' }}>your</em> life?</h1>
          <p className="page-hero__sub">Tell us how you drive. We find the lowest lifecycle carbon option for your exact situation.</p>
        </div>
      </div>

      <section style={{ background: 'var(--cream)', padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 40, alignItems: 'start' }}>

            {/* Form */}
            <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, position: 'sticky', top: 90 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Your Details</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>All calculations adjust for your grid, mileage, and budget.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="form-label">Daily Distance: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{km} km</span></label>
                  <input type="range" className="form-range" min={5} max={150} value={km} onChange={e => setKm(+e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Years of Ownership: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{yrs} yrs</span></label>
                  <input type="range" className="form-range" min={2} max={15} value={yrs} onChange={e => setYrs(+e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <select className="form-select" value={country} onChange={e => setCountry(e.target.value)}>
                    <option value="india">India</option>
                    {COUNTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                {country === 'india' && (
                  <div>
                    <label className="form-label">State: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{gridIntensity} kg CO₂/kWh</span></label>
                    <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                      {Object.entries(GRID_DATA.india.states).map(([k, s]) => (
                        <option key={k} value={k}>{s.label} ({s.intensity})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="form-label">Budget</label>
                  <select className="form-select" value={budget} onChange={e => setBudget(e.target.value)}>
                    <option value="all">All budgets</option>
                    <option value="low">Under ₹10L</option>
                    <option value="mid">₹10–25L</option>
                    <option value="high">Above ₹25L</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Vehicle Type</label>
                  <select className="form-select" value={vtype} onChange={e => setVtype(e.target.value)}>
                    <option value="all">All types (show best)</option>
                    <option value="ev">Electric only</option>
                    <option value="hybrid">Hybrid only</option>
                    <option value="ice">Petrol / Diesel only</option>
                  </select>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={run} className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: '14px' }}>
                <Calculator size={15} /> Find My Best Car
              </motion.button>
            </div>

            {/* Results */}
            <div>
              {!results ? (
                <div style={{ background: 'var(--cream-dark)', border: '2px dashed var(--border2)', borderRadius: 20, padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Calculator size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: .3 }} />
                  <p style={{ fontSize: 15 }}>Fill in your details and click<br /><strong style={{ color: 'var(--black)' }}>Find My Best Car</strong></p>
                  <p style={{ fontSize: 13, marginTop: 8 }}>We'll show the top 3 lowest carbon<br />vehicles for your exact situation.</p>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Confidence + Rating Legend */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(212,134,10,0.07)', border: '1px solid rgba(212,134,10,0.18)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                        <AlertTriangle size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                        <span>Figures carry ±20% uncertainty (EEA 2023 · IPCC AR6)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rating:</span>
                        {RATING_LEGEND.map(r => (
                          <span key={r.rating} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} title={r.desc}>
                            <span className={`rating ${r.cls}`} style={{ width: 22, height: 22, fontSize: 9, borderRadius: 5 }}>{r.rating}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{r.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Winner */}
                    <div style={{ border: '1.5px solid rgba(74,124,89,0.25)', borderRadius: 20, marginBottom: 20, overflow: 'hidden' }}><div style={{ height: 140, position: 'relative' }}><img src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75' alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,45,25,0.3), rgba(20,35,15,0.7))' }} /><div style={{ position: 'absolute', bottom: 16, left: 24, color: '#fff' }}><span className='badge badge-green'>Best for your life</span></div></div><div style={{ background: 'linear-gradient(135deg, var(--cream-dark), rgba(74,124,89,0.05))', padding: 32, position: 'relative', overflow: 'hidden' }}>
                      <span style={{ display: 'block', marginBottom: 10 }}>{MedalIcons[0]}</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>{results.top3[0].name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                        {results.top3[0].type.toUpperCase()} · {results.top3[0].price} · {km}km/day in {stateLabel}
                      </div>
                      <RatingBadge rating={results.top3[0].rating} />
                      <div style={{ display: 'flex', gap: 28, marginTop: 20, flexWrap: 'wrap' }}>
                        {[
                          { val: results.top3[0].total + 't ±20%', label: 'Total CO₂', color: 'var(--green-ok)' },
                          { val: results.top3[0].mfg + 't', label: 'Mfg Cost', color: 'var(--amber)' },
                          { val: results.top3[0].fuel + 't', label: 'Fuel CO₂', color: 'var(--blue)' },
                          { val: '−' + Math.max(0, results.iceAvg - results.top3[0].total) + 't', label: 'vs Avg ICE', color: 'var(--green-ok)' },
                        ].map(s => (
                          <div key={s.label}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div></div>

                    {/* Runners up */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                      {results.top3.slice(1).map((car, i) => (
                        <motion.div key={car.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ display: 'flex', alignItems: 'center' }}>{MedalIcons[i+1]}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{car.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{car.type.toUpperCase()} · {car.price}</div>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: car.total < 30 ? 'var(--green-ok)' : car.total < 55 ? 'var(--amber)' : 'var(--rust)' }}>{car.total}t</span>
                          <RatingBadge rating={car.rating} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Grid context */}
                    <div style={{ background: 'var(--cream-mid)', border: '1px solid var(--border2)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><ZapIcon size={12} /> Your Grid vs Other Regions</div>
                      {[
                        { label: 'Norway', val: 0.02 },
                        { label: stateLabel, val: gridIntensity },
                        { label: 'USA', val: 0.42 },
                        { label: 'Avg India', val: 0.82 },
                      ].sort((a,b) => a.val - b.val).map(g => {
                        const color = g.val < 0.3 ? 'var(--green-ok)' : g.val < 0.7 ? 'var(--amber)' : 'var(--rust)';
                        return (
                          <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                            <span style={{ fontSize: 13, width: 140, flexShrink: 0, color: 'var(--text-dim)' }}>{g.label}</span>
                            <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(g.val/1.1)*100}%` }} transition={{ duration: 0.8 }} style={{ height: '100%', background: color, borderRadius: 4 }} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, width: 36, textAlign: 'right' }}>{g.val}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* ── VERDICT NARRATIVE ── */}
                    <div style={{ background: 'var(--carbon)', color: 'var(--cream)', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(245,240,232,0.07)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--olive-muted)', marginBottom: 16 }}>
                        Your carbon verdict
                      </div>
                      <p style={{ fontSize: 15, color: 'rgba(245,240,232,0.85)', lineHeight: 1.8, marginBottom: 16 }}>
                        For someone driving <strong style={{ color: 'var(--cream)' }}>{km} km/day</strong> in <strong style={{ color: 'var(--cream)' }}>{stateLabel}</strong> over <strong style={{ color: 'var(--cream)' }}>{yrs} years</strong>, the <strong style={{ color: 'var(--olive-muted)' }}>{results.top3[0].name}</strong> produces the lowest lifecycle carbon of any car in your budget — <strong style={{ color: 'var(--cream)' }}>{results.top3[0].total}t CO₂ total.</strong>
                        {results.iceAvg > results.top3[0].total && (
                          <> That's <strong style={{ color: '#4a7c59' }}>{(results.iceAvg - results.top3[0].total).toFixed(1)}t less</strong> than the average petrol/diesel car in this category.</>
                        )}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {[
                          { val: Math.round(results.top3[0].total / 0.225).toLocaleString(), label: 'Delhi→Mumbai flights equivalent', color: 'var(--rust)' },
                          { val: Math.round(results.top3[0].total * 46).toLocaleString(), label: 'Trees needed to offset', color: 'var(--amber)' },
                          { val: results.iceAvg > results.top3[0].total ? `−${(results.iceAvg - results.top3[0].total).toFixed(1)}t` : `+${(results.top3[0].total - results.iceAvg).toFixed(1)}t`, label: 'vs avg petrol car', color: results.iceAvg > results.top3[0].total ? '#4a7c59' : 'var(--rust)' },
                        ].map(s => (
                          <div key={s.label} style={{ background: 'rgba(245,240,232,0.04)', borderRadius: 10, padding: '14px 16px' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase', marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── SHAREABLE CARD ── */}
                    <div style={{ background: 'linear-gradient(135deg, #1a2212 0%, #0e120a 100%)', borderRadius: 20, padding: 28, marginBottom: 16, border: '1.5px solid rgba(74,124,89,0.25)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(74,124,89,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: 14 }}>Share your result</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--cream)', lineHeight: 1.2 }}>{results.top3[0].name}</div>
                          <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', marginTop: 4 }}>{km}km/day · {stateLabel} · {yrs}yrs · {results.top3[0].price}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: '#4a7c59' }}>{results.top3[0].total}t</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase' }}>Lifetime CO₂</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link to="/compare" className="btn btn--ghost" style={{ fontSize: 13 }}>Compare Cars →</Link>
                        <button className="btn btn--outline" onClick={shareResult} style={{ fontSize: 13 }}>
                          <Share2 size={13} /> {copied ? 'Link copied!' : 'Copy shareable link'}
                        </button>
                        <Link to={`/showroom-mirror?car=${results.top3[0].key}&state=${state}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(196,75,43,0.15)', border: '1px solid rgba(196,75,43,0.3)', color: 'var(--rust)', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                          <Globe size={13} /> Verify at Showroom
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:860px){div[style*="grid-template-columns: 380px"]{grid-template-columns:1fr!important}div[style*="position: sticky"]{position:static!important}}`}</style>
    </div>
  );
}
