import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Battery, Calculator, CheckCircle, ChevronRight, Factory, Info, ScanSearch, Zap } from 'lucide-react';

const ICON_MAP = { Factory, Zap, Battery: () => <span style={{fontFamily:'var(--font-mono)',fontSize:16,fontWeight:700}}>±%</span> };
function renderIcon(name, size=22) {
  const C = ICON_MAP[name];
  return C ? <C size={size} /> : null;
}


const TOOLS = [
  {
    to: '/compare',
    icon: <BarChart2 size={28} />,
    tag: 'Most popular',
    tagColor: 'badge-green',
    title: 'Compare Cars',
    sub: 'Head-to-head lifecycle battle',
    desc: 'Pick up to 3 vehicles and compare full lifecycle carbon — manufacturing, fuel/energy, battery disposal. Adjust for your state grid and driving pattern. Includes D3 breakeven chart.',
    cta: 'Start Comparing',
    color: 'var(--olive)',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70',
    stats: ['3-car comparison', 'Breakeven chart', 'Shareable link'],
  },
  {
    to: '/calculator',
    icon: <Calculator size={28} />,
    tag: 'Personalised',
    tagColor: 'badge-amber',
    title: 'Personal Calculator',
    sub: 'Find the best car for your life',
    desc: 'Tell us your daily km, years of ownership, state, and budget. We rank every car in our database by lifecycle carbon and surface the lowest-emission option for your exact situation.',
    cta: 'Calculate My Score',
    color: 'var(--rust)',
    img: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=600&q=70',
    stats: ['All car types', 'State grid aware', 'Budget filter'],
  },
];

const QUICK_FACTS = [
  { icon: 'Factory', title: 'Manufacturing matters', body: 'An EV carries 9–16t of CO₂ before it moves 1km. This upfront carbon debt is never shown in ads. Our tools show all three phases: manufacture, fuel, disposal.' },
  { icon: 'Zap', title: 'Grid = everything for EVs', body: 'The same EV in Himachal Pradesh (0.12 kg/kWh) emits 10× less than in Jharkhand (1.10 kg/kWh). Your state grid is the single biggest variable in EV carbon math.' },
  { icon: 'Battery', title: 'Battery disposal is real', body: 'A 60 kWh battery adds ~8.5t of end-of-life CO₂ (Ellingsen 2016). Hybrids with small packs (1–3 kWh) have negligible disposal impact.' },
  { icon: 'Percent', title: 'All figures ±20%', body: 'Lifecycle numbers carry uncertainty. Manufacturing uses EEA EU fleet averages — a proxy for India-assembled cars. Real-world consumption differs from ARAI lab results by 18–25%.' },
];

const HOW_STEPS = [
  { n: '01', title: 'Choose your tools', body: 'Use Compare for side-by-side battles. Use Calculator if you want us to rank everything for your situation.' },
  { n: '02', title: 'Set your state', body: "India's 18 state grids range from 0.12 (HP hydro) to 1.10 (JH coal). This changes EV rankings dramatically — always set your real state." },
  { n: '03', title: 'Enter your actual usage', body: 'Daily km and ownership years are the biggest drivers of lifecycle totals. The default is 40km/8yr — change it to your reality.' },
  { n: '04', title: 'Read the breakeven chart', body: 'The D3 chart in Compare shows exactly when an EV\'s upfront carbon debt is repaid by its cleaner running emissions. That\'s your decision point.' },
];

export default function GoGreen() {
  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,16,0.68)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <div className="section-label" style={{ color: 'var(--olive-muted)' }}>Make It Count</div>
          <h1 className="page-hero__title">
            Go Green.<br />
            <em style={{ color: 'var(--olive-muted)', fontStyle: 'italic' }}>Know the numbers first.</em>
          </h1>
          <p className="page-hero__sub">
            Two tools. One goal: find the lowest lifecycle carbon vehicle for your actual driving situation — not a brochure's best case.'
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
            <Link to="/compare" className="btn btn--primary">Compare Cars <ArrowRight size={14} /></Link>
            <Link to="/calculator" className="btn btn--ghost">Personal Calculator <ArrowRight size={14} /></Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '72px 0' }}>
        <div className="container">
          <div className="section-label" style={{ color: 'var(--olive-muted)' }}>How to use these tools</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 700, marginBottom: 48, color: 'var(--cream)' }}>
            Four steps to a <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>real</em> answer.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {HOW_STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ borderTop: '2px solid var(--olive)', paddingTop: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--olive-muted)', letterSpacing: '.12em', marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--cream)', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', lineHeight: 1.7 }}>{s.body}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool cards */}
      <section style={{ background: 'var(--cream)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 960, margin: '0 auto' }}>
            {TOOLS.map((tool, i) => (
              <motion.div key={tool.to} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6 }} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', padding: '40px 36px 32px', color: 'var(--cream)', overflow: 'hidden', minHeight: 200 }}>
                  <img src={tool.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: tool.color, opacity: 0.84 }} />
                  <div style={{ position: 'relative' }}>
                    <div style={{ marginBottom: 16, opacity: .9 }}>{renderIcon(tool.icon)}</div>
                    <span className={`badge ${tool.tagColor}`} style={{ marginBottom: 12 }}>{tool.tag}</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>{tool.title}</h2>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6 }}>{tool.sub}</div>
                  </div>
                </div>
                <div style={{ padding: '24px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, flex: 1, marginBottom: 20 }}>{tool.desc}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                    {tool.stats.map(s => (
                      <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', color: 'var(--text-muted)' }}>
                        <CheckCircle size={9} style={{ color: 'var(--green-ok)' }} /> {s}
                      </span>
                    ))}
                  </div>
                  <Link to={tool.to} className="btn btn--primary" style={{ justifyContent: 'center' }}>
                    {tool.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What these tools actually measure */}
      <section style={{ background: 'var(--cream-dark)', padding: '72px 0' }}>
        <div className="container">
          <div className="section-label">Methodology in plain English</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,40px)', fontWeight: 700, marginBottom: 48 }}>
            What we actually <em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>measure.</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
            {QUICK_FACTS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 28px', display: 'flex', gap: 18 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{renderIcon(f.icon)}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.body}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip — Showroom Mirror */}
      <section style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '56px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(196,75,43,0.15)', border: '1px solid rgba(196,75,43,0.3)', borderRadius: 100, padding: '4px 12px', marginBottom: 12 }}>
              <ScanSearch size={11} style={{ color: 'var(--rust)' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rust)' }}>At the showroom?</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 700, marginBottom: 6 }}>
              Check any car's truth in 10 seconds.'
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.55)', maxWidth: 460 }}>
              Salesman says zero emissions? Our Truth Mirror checks the lifecycle reality against what any car in our database actually produces.
            </p>
          </div>
          <Link to="/showroom-mirror" className="btn btn--primary" style={{ flexShrink: 0, fontSize: 14, padding: '13px 26px' }}>
            <ScanSearch size={15} /> Open Truth Mirror
          </Link>
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          div[style*="grid-template-columns: repeat(4"]{grid-template-columns:1fr 1fr!important}
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
          div[style*="grid-template-columns: repeat(2"]{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
