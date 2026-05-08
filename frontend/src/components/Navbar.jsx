import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Menu, X, Sprout, ScanSearch } from 'lucide-react';

const NAV_LINKS = [
  { to: '/',                label: 'Home',                            icon: null },
  { to: '/the-reality',     label: 'The Reality',                     icon: null },
  { to: '/showroom-mirror', label: 'Truth Mirror', icon: <ScanSearch size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> },
  { to: '/community',       label: 'Insights',                        icon: null },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isDark = ['/', '/the-reality'].includes(location.pathname) && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <>
      <motion.nav
        className={`navbar ${isDark ? 'navbar--dark' : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          height: 72,
          background: isDark ? 'rgba(19,20,16,0.92)' : 'rgba(245,240,232,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${isDark ? 'rgba(245,240,232,0.07)' : 'rgba(61,74,46,0.14)'}`,
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.10)' : 'none',
          transition: 'all 0.3s ease',
        }}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: isDark ? 'var(--cream)' : 'var(--olive)', flexShrink: 0, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'var(--olive)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)' }}>
              <Leaf size={18} />
            </div>
            CarbonWise
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }} className="desktop-nav">
            {NAV_LINKS.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: '6px 14px', fontSize: 14, fontWeight: 500,
                    borderRadius: 6, transition: 'all 0.2s',
                    color: active
                      ? (isDark ? 'var(--cream)' : 'var(--olive)')
                      : (isDark ? 'rgba(245,240,232,0.6)' : 'var(--text-secondary)'),
                    background: active
                      ? (isDark ? 'rgba(245,240,232,0.08)' : 'rgba(61,74,46,0.08)')
                      : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  {link.icon}{link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA — Go Green */}
          <div style={{ flexShrink: 0 }} className="desktop-nav">
            <Link to="/go-green" className="btn btn--rust" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Sprout size={14} /> Go Green
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="mobile-menu-btn"
            style={{ display: 'none', padding: 6, borderRadius: 6, color: isDark ? 'var(--cream)' : 'var(--olive)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 72, left: 0, right: 0, zIndex: 998,
              background: 'var(--carbon)', padding: '20px 24px 28px',
              borderBottom: '1px solid rgba(245,240,232,0.08)',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '12px 16px', fontSize: 15, fontWeight: 500,
                  color: 'rgba(245,240,232,0.8)', borderRadius: 8,
                  textDecoration: 'none',
                  background: location.pathname === link.to ? 'rgba(245,240,232,0.06)' : 'transparent',
                }}
              >
                {link.icon}{link.label}
              </Link>
            ))}
            <Link to="/go-green" className="btn btn--rust" style={{ marginTop: 12, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Sprout size={14} /> Go Green
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
