import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Layers, Search, Code2, FlaskConical, Send, CheckCircle } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const TEAM = [
  {
    name: 'Ayushi Agrawal',
    role: 'Full Stack Development',
    desc: 'Worked across the full stack with a primary focus on backend architecture. Built the core data pipeline and emission calculation engine that powers CarbonWise.',
    icon: <Layers size={20} />,
    color: 'var(--olive)',
    initials: 'AA',
  },
  {
    name: 'Neha Malhotra',
    role: 'Backend & UI Design',
    desc: 'Engineered the backend systems and shaped the visual identity of CarbonWise: the design language, color system, and component library.',
    icon: <Code2 size={20} />,
    color: 'var(--rust)',
    initials: 'NM',
  },
  {
    name: 'Reshmi Yadav',
    role: 'Frontend & Research',
    desc: 'Built and debugged frontend interfaces, led data research sourcing lifecycle figures from EPA, EEA, CEA India and ARAI, and drove the emoji-to-icon migration and JS syntax fixes that shipped the final build.',
    icon: <Search size={20} />,
    color: 'var(--amber)',
    initials: 'RY',
  },
  {
    name: 'Jhalak Mittal',
    role: 'Frontend, Prototyping & Research',
    desc: 'Contributed to frontend development, drove early prototyping and UX validation, and researched the greenwashing database and India-specific emissions data.',
    icon: <FlaskConical size={20} />,
    color: '#7B9E6B',
    initials: 'JM',
  },
];

export default function About() {
  const [form, setForm] = useState({ name: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitted(true);
  }

  return (
    <div style={{ paddingTop: 72 }}>

      {/* ── WHAT IS CARBONWISE ── */}
      <section style={{ background: 'var(--cream)', padding: '100px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <motion.div {...fadeUp(0)}>
              <div className="section-label">The project</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
                What is<br /><em style={{ fontStyle: 'italic', color: 'var(--olive)' }}>CarbonWise?</em>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16 }}>
                CarbonWise is a lifecycle carbon comparison tool built specifically for Indian consumers. Unlike generic CO₂ calculators, we account for the three costs that car ads always leave out: manufacturing, real-world fuel use, and battery disposal.
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                We adjust every calculation for your exact state's grid intensity, your daily mileage, and how long you plan to own the vehicle. The result is the most honest car comparison available for Indian conditions.'
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.15)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Data Sources', val: 'EPA · EEA · CEA India · ARAI · IEA' },
                { label: 'Vehicles in database', val: '14 models across EV, Hybrid & ICE' },
                { label: 'States covered', val: 'All Indian states with individual grid intensity' },
              ].map(item => (
                <div key={item.label} style={{ padding: '18px 24px', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{item.val}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ background: 'var(--carbon)', padding: '100px 0', color: 'var(--cream)' }}>
        <div className="container">
          <motion.div {...fadeUp(0)}>
            <div className="section-label" style={{ color: 'var(--olive-muted)' }}>The team</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--cream)', marginBottom: 56 }}>
Four contributors.<br />One honest tool.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                {...fadeUp(i * 0.1)}
                style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.08)', borderRadius: 20, padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {member.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>{member.name}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: member.color, marginBottom: 12 }}>
                    {member.icon} {member.role}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', lineHeight: 1.7 }}>{member.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: 'var(--cream-dark)', padding: '100px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

            <motion.div {...fadeUp(0)}>
              <div className="section-label">Get in touch</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>
                Suggestions,<br />feedback, or<br />
                <em style={{ fontStyle: 'italic', color: 'var(--olive)' }}>just say hi.</em>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
                Found a data error? Have a car you want us to add? Think our methodology is off? We want to hear it. This is a student project and we're actively improving it.'
              </p>
              <a
                href="https://github.com/reshmicc/carbonwise/issues"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--olive)', letterSpacing: '.08em' }}
              >
                <Github size={15} /> Or open a GitHub issue →
              </a>
            </motion.div>

            <motion.div {...fadeUp(0.15)}>
              {!submitted ? (
                <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Your name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="What should we call you?"
                      required
                      style={{ padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', background: 'var(--cream)', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--olive)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Message / suggestion
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us what you think, what's broken, or what you'd like to see added…"
                      required
                      rows={5}
                      style={{ padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', background: 'var(--cream)', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--olive)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn--primary"
                    style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Send size={14} /> Send Message
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                    No account needed. No spam. Promise.
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', minHeight: 300 }}
                >
                  <CheckCircle size={48} color="var(--olive)" strokeWidth={1.5} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Message received!</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.7 }}>
                    Thanks for reaching out. We read every message and will get back to you if needed.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', message: '' }); }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--olive)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 8 }}
                  >
                    Send another →
                  </button>
                </motion.div>
              )}
            </motion.div>

          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          section > .container > div[style*="grid-template-columns: 1fr 1fr"],
          section > .container > div[style*="grid-template-columns: repeat(2"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}