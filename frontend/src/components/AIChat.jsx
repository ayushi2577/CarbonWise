import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';

const SUGGESTIONS = [
  'I drive 40km/day in Delhi: what should I buy?',
  'Is Prius better than Nexon EV in Jharkhand?',
  "What's the break-even for EVs in India?",
];

export default function AIChat() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hey! I know the carbon math on every car in India. Ask me anything: budget, state, mileage.' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef               = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  async function send(text) {
    const q = text || input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history: messages.slice(1) }),  // skip initial greeting
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* FAB */}
      <div className="ai-fab">
        <motion.button
          className="ai-fab__btn"
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          <div className="ai-pulse" />
          <Bot size={22} />
        </motion.button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="ai-chat__header">
              <Bot size={18} style={{ color: 'var(--olive-muted)' }} />
              <span className="ai-chat__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bot size={14} /> CarbonWise AI</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--olive-muted)', marginLeft: 'auto', marginRight: 8 }}>Powered by Groq</span>
              <button onClick={() => setOpen(false)} style={{ color: 'rgba(245,240,232,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <div className="ai-chat__messages" ref={msgsRef}>
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg chat-msg--${m.role}`}
                  dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br>') }}
                />
              ))}
              {messages.length === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="chat-suggestion" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              )}
              {loading && (
                <div className="chat-msg chat-msg--ai" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                  Calculating...
                </div>
              )}
            </div>

            <div className="ai-chat__input-area">
              <input
                className="ai-chat__input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about any car..."
              />
              <button className="ai-chat__send" onClick={() => send()} disabled={loading}>
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
