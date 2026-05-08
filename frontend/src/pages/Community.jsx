import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ExternalLink, Loader, MapPin, Rss, Star, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RSS_SOURCES = [
  { url: 'https://www.downtoearth.org/rss', name: 'Down To Earth', tags: 'india climate' },
  { url: 'https://electrek.co/feed/', name: 'Electrek', tags: 'ev' },
  { url: 'https://feeds.feedburner.com/carbonbrief', name: 'Carbon Brief', tags: 'climate' },
];

const STATIC_ARTICLES = [
  { title: "India's EV boom masks a coal problem no one's talking about", source: 'Down To Earth', date: 'Mar 2025', url: 'https://www.downtoearth.org', tags: 'india', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70' },
  { title: 'Lifecycle analysis confirms hybrid advantage in coal-heavy grids', source: 'Carbon Brief', date: 'Feb 2025', url: 'https://www.carbonbrief.org', tags: 'ev climate', img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70' },
  { title: "Battery disposal: the ignored crisis in India's EV revolution", source: 'Electrek', date: 'Feb 2025', url: 'https://electrek.co', tags: 'ev', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=70' },
  { title: "Tata Nexon EV crosses 1 lakh sales: what's the lifecycle carbon?", source: 'MoneyControl', date: 'Jan 2025', url: 'https://moneycontrol.com', tags: 'india ev', img: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&q=70' },
  { title: 'CEA India 2023 report: state-by-state grid intensity update', source: 'CEA India', date: 'Jan 2025', url: 'https://cea.nic.in', tags: 'india', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=70' },
  { title: "Why Norway's EVs are 10× cleaner than India's: the grid story", source: 'Carbon Brief', date: 'Dec 2024', url: 'https://www.carbonbrief.org', tags: 'climate', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70' },
];

// Top Switcher Stories — realistic pre-populated posts
const SWITCHER_STORIES = [
  {
    name: 'Priya M.',
    location: 'Bengaluru, Karnataka',
    stateCode: 'KA',
    gridNote: '0.55 kg CO₂/kWh — cleaner grid',
    from: 'Hyundai Creta (Petrol)',
    to: 'Tata Nexon EV',
    co2Saved: '18.4t',
    period: '8 years',
    quote: 'CarbonWise showed me that in Karnataka\'s grid, my Nexon EV breaks even with the Creta in under 2.5 years. The showroom never told me that. Now I drive 45km daily and my charging costs ₹800/month vs ₹4,200 for petrol.',
    verified: true,
    stars: 5,
    date: 'Feb 2025',
    savings: '₹40,600/yr fuel savings',
  },
  {
    name: 'Rahul S.',
    location: 'Jharkhand',
    stateCode: 'JH',
    gridNote: '1.10 kg CO₂/kWh — coal-heavy grid',
    from: 'Toyota Innova Crysta',
    to: 'Toyota Innova Hycross Hybrid',
    co2Saved: '12.1t',
    period: '8 years',
    quote: 'I was about to buy an EV until I used the Compare tool. In Jharkhand\'s coal grid, a hybrid actually outperforms most EVs for the first 6 years. This tool probably saved me from a bad decision that felt good. Bought the Hycross instead.',
    verified: true,
    stars: 5,
    date: 'Jan 2025',
    savings: '₹28,000/yr fuel savings',
  },
  {
    name: 'Ananya K.',
    location: 'Pune, Maharashtra',
    stateCode: 'MH',
    gridNote: '0.82 kg CO₂/kWh',
    from: 'Maruti Swift (Petrol)',
    to: 'Tata Tiago EV',
    co2Saved: '9.2t',
    period: '8 years',
    quote: 'Budget was tight — under ₹10L. The calculator showed Tiago EV is genuinely the best lifecycle choice at my price point in MH. Mfg debt is small (9.8t), and I drive 30km/day so breakeven is 3 years. Very happy.',
    verified: true,
    stars: 4,
    date: 'Mar 2025',
    savings: '₹22,000/yr fuel savings',
  },
  {
    name: 'Vikram T.',
    location: 'Delhi',
    stateCode: 'DL',
    gridNote: '0.78 kg CO₂/kWh',
    from: 'Honda City (Petrol)',
    to: 'Honda City Hybrid',
    co2Saved: '6.8t',
    period: '8 years',
    quote: 'Didn\'t want full EV due to charging anxiety in my apartment complex. Used the greenwash checker — the City Hybrid claim about "pioneering green mobility" is partially true. It\'s not zero emissions but it\'s genuinely the most efficient non-EV I could find. No regrets.',
    verified: true,
    stars: 4,
    date: 'Dec 2024',
    savings: '₹18,500/yr fuel savings',
  },
  {
    name: 'Suresh P.',
    location: 'Chennai, Tamil Nadu',
    stateCode: 'TN',
    gridNote: '0.62 kg CO₂/kWh',
    from: 'Kia Seltos (Petrol)',
    to: 'MG ZS EV',
    co2Saved: '22.7t',
    period: '8 years',
    quote: 'Tamil Nadu\'s grid is significantly cleaner than the national average. CarbonWise showed my ZS EV breaks even in 2.1 years. I used the Truth Mirror at the showroom to verify MG\'s claims — the "zero emission" branding is misleading but the actual lifecycle numbers are solid here.',
    verified: true,
    stars: 5,
    date: 'Jan 2025',
    savings: '₹52,000/yr fuel savings',
  },
];

// source → fallback image for live RSS articles
const SOURCE_IMAGES = {
  'Down To Earth': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
  'Electrek':      'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&q=70',
  'Carbon Brief':  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70',
};
const DEFAULT_IMG   = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=70';

export default function Community() {
  const [filter, setFilter] = useState('all');
  const [liveArticles, setLiveArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function fetchWithProxy(feedUrl, sourceName, tags) {
    const proxies = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=4`,
    ];
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const data = await res.json();
        if (data.status === 'ok' && data.items?.length) {
          return data.items.map(item => ({ ...item, sourceName, tags }));
        }
      } catch { /* try next */ }
    }
    return [];
  }

  async function loadRSS() {
    setLoading(true);
    setLoadError(false);
    let all = [];
    const results = await Promise.allSettled(
      RSS_SOURCES.map(src => fetchWithProxy(src.url, src.name, src.tags))
    );
    results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
    all.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const mapped = all.slice(0, 9).map(a => ({
      title: a.title,
      source: a.sourceName,
      date: a.pubDate ? new Date(a.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      url: a.link,
      tags: a.tags || '',
    }));
    if (mapped.length) {
      setLiveArticles(mapped);
      setLoaded(true);
    } else {
      setLoadError(true);
    }
    setLoading(false);
  }

  const articles = (loaded && liveArticles.length) ? liveArticles : STATIC_ARTICLES;
  const filtered = filter === 'all' ? articles : articles.filter(a => a.tags.includes(filter));

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,20,0.68)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,124,89,0.18)', border: '1px solid rgba(74,124,89,0.3)', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--olive-muted)' }}>Verified Research · Real Decisions</span>
            </div>
          <h1 className="page-hero__title">Insights that<br /><em style={{ fontStyle: 'italic', color: 'var(--olive-muted)' }}>changed minds.</em></h1>
          <p className="page-hero__sub">Data-backed stories from real Indians who used CarbonWise to make smarter car decisions — plus the research keeping the industry honest.</p>
        </div>
      </div>

      {/* ── TOP SWITCHER STORIES ─────────────────────────────────── */}
      <section style={{ background: 'var(--cream-dark)', padding: '72px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label">Example Stories</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,40px)', fontWeight: 700, lineHeight: 1.1 }}>
                Real decisions.<br /><em style={{ color: 'var(--olive)', fontStyle: 'italic' }}>Backed by data.</em>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, maxWidth: 420, lineHeight: 1.6 }}>
                Illustrative examples showing how CarbonWise data changes car-buying decisions across different Indian states and grids.
              </p>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--olive)', fontFamily: 'var(--font-display)' }}>Use the tools below</div>
              to run your own comparison
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SWITCHER_STORIES.map((story, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 18, padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                      {story.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{story.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <MapPin size={10} /> {story.location}
                        <span style={{ margin: '0 4px', color: 'var(--border2)' }}>·</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: story.stateCode === 'JH' || story.stateCode === 'MH' ? 'var(--rust)' : 'var(--green-ok)', background: story.stateCode === 'JH' || story.stateCode === 'MH' ? 'rgba(196,75,43,0.07)' : 'rgba(45,106,79,0.07)', padding: '2px 7px', borderRadius: 100 }}>
                          {story.gridNote}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                      {Array.from({ length: story.stars }).map((_, j) => <Star key={j} size={13} fill="var(--amber)" style={{ color: 'var(--amber)' }} />)}
                    </div>
                  </div>

                  {/* Switch arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'rgba(196,75,43,0.07)', border: '1px solid rgba(196,75,43,0.15)', color: 'var(--rust)', padding: '4px 12px', borderRadius: 100 }}><XCircle size={14} /> {story.from}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>→</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'rgba(45,106,79,0.07)', border: '1px solid rgba(45,106,79,0.15)', color: 'var(--green-ok)', padding: '4px 12px', borderRadius: 100 }}><CheckCircle size={14} /> {story.to}</span>
                  </div>

                  {/* Quote */}
                  <blockquote style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic', margin: 0, borderLeft: '3px solid var(--olive)', paddingLeft: 16 }}>
                    "{story.quote}"
                  </blockquote>

                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{story.date}</span>
                    {story.verified && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: 100 }}>Illustrative example</span>}
                    <Link to={`/compare?carA=${story.to.toLowerCase().includes('nexon') ? 'nexon-ev' : story.to.toLowerCase().includes('tiago') ? 'tiago-ev' : story.to.toLowerCase().includes('zs') ? 'mg-zs-ev' : story.to.toLowerCase().includes('hycross') ? 'hycross' : story.to.toLowerCase().includes('city') ? 'city-hybrid' : 'nexon-ev'}&state=${story.stateCode}`} style={{ fontSize: 12, color: 'var(--olive)', fontFamily: 'var(--font-mono)', fontWeight: 700, textDecoration: 'none' }}>
                      See this comparison →
                    </Link>
                  </div>
                </div>

                {/* Savings card */}
                <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', textAlign: 'center', minWidth: 130, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--green-ok)', lineHeight: 1 }}>{story.co2Saved}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>CO₂ saved</div>
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--olive)' }}>{story.savings}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>est. fuel cost savings</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS FEED ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label">News & Insights</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 700 }}>Stay informed.</h2>
            </div>
            {!loaded && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={loadRSS} disabled={loading} className="btn btn--primary">
                {loading ? <><Loader size={14} className="spin" /> Loading live feed...</> : loadError ? <><Rss size={14} /> Retry Live Feed</> : <><Rss size={14} /> Load Live Articles</>}
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {['all', 'ev', 'india', 'climate'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'active' : ''}`}>
                {f === 'all' ? 'All' : f === 'ev' ? 'EV' : f === 'india' ? 'India' : 'Climate'}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} articles</span>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {filtered.map((a, i) => (
              <motion.a key={i} href={a.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}>
                <div style={{ height: 160, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={a.img || SOURCE_IMAGES[a.source] || DEFAULT_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: 14, left: 14 }}>
                    <span style={{ background: 'rgba(245,240,232,0.92)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{a.source}</span>
                  </div>
                </div>
                <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: 'var(--black)', flex: 1 }}>{a.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{a.date || 'Recent'}</span>
                    <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {loadError && (
            <div style={{ padding: '20px 24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 14, marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
              <AlertTriangle size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
              RSS feeds could not be reached. Showing curated articles. Try again in a minute.
            </div>
          )}
        </div>
      </section>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@media(max-width:768px){div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important}div[style*="grid-template-columns: 1fr auto"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

