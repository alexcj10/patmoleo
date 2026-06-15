import { useState, useRef, useEffect } from 'react'
import './App.css'

const NAMES = {
  per: 'Person',
  geo: 'Location',
  org: 'Organization',
  tim: 'Time',
  gpe: 'Geopolitical',
  art: 'Artifact',
  eve: 'Event',
  nat: 'Natural',
}

const GITHUB = 'https://github.com/alexcj10/patmoleo'
const KEY = 'patmoleo_history'

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const save = (h) => localStorage.setItem(KEY, JSON.stringify(h))

export default function App() {
  const [view, setView] = useState('home')
  const [text, setText] = useState('')
  const [entities, setEntities] = useState([])
  const [analyzed, setAnalyzed] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState(load)
  const [histOpen, setHistOpen] = useState(false)
  const ref = useRef(null)
  const histRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const hasOverflow = el.scrollHeight > 112
    el.style.height = (hasOverflow ? 112 : el.scrollHeight) + 'px'
    el.style.overflowY = hasOverflow ? 'auto' : 'hidden'
  }, [text])

  useEffect(() => {
    const fn = (e) => { if (histRef.current && !histRef.current.contains(e.target)) setHistOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const run = async (t) => {
    const input = (t ?? text).trim()
    if (!input) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })
      if (!r.ok) throw new Error('Cannot reach API — is FastAPI running on port 8000?')
      const d = await r.json()
      setEntities(d || [])
      setAnalyzed(input)
      setView('results')
      const next = [{ text: input, entities: d || [], ts: Date.now() }, ...history.filter(x => x.text !== input)].slice(0, 10)
      setHistory(next)
      save(next)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const reset = () => { setView('home'); setText(''); setEntities([]); setAnalyzed(''); setError(null); setTimeout(() => ref.current?.focus(), 50) }
  const pick = (h) => { setEntities(h.entities); setAnalyzed(h.text); setText(h.text); setView('results'); setHistOpen(false) }

  const highlighted = () => {
    if (!entities.length) return <span>{analyzed}</span>
    const sorted = [...entities].sort((a, b) => a.start - b.start)
    const parts = []
    let c = 0
    sorted.forEach((e, i) => {
      if (e.start < c) return
      if (e.start > c) parts.push(<span key={`t${i}`}>{analyzed.slice(c, e.start)}</span>)
      const code = e.entity_group.toLowerCase()
      parts.push(
        <span key={`e${i}`} className={`mark ${code}`} title={`${NAMES[code] || e.entity_group} · ${(e.score*100).toFixed(1)}%`}>
          {analyzed.slice(e.start, e.end)}<span className="mark-type">{NAMES[code] || e.entity_group}</span>
        </span>
      )
      c = e.end
    })
    if (c < analyzed.length) parts.push(<span key="z">{analyzed.slice(c)}</span>)
    return parts
  }

  const grouped = () => {
    const g = {}
    entities.forEach(e => { const k = e.entity_group.toLowerCase(); (g[k] = g[k] || []).push(e) })
    return g
  }

  /* ── Icons (inline SVG, no deps) ── */
  const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
  const Plus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  const Clock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  const GH = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>

  // ── HOME ──
  if (view === 'home') return (
    <div className="app">
      <div className="top-left-logo">
        <img src="/logo.svg" alt="Patmoleo" />
      </div>
      <div className="top-right-actions">
        <a className="icon-btn" href={GITHUB} target="_blank" rel="noopener noreferrer" title="GitHub"><GH/></a>
      </div>
      <div className="hero">
        <div className="search-box">
          <textarea ref={ref} className="search-field" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run() } }} placeholder="Paste any text to extract entities…" rows={1} />
          <button className="search-go" onClick={() => run()} disabled={loading || !text.trim()}>
            {loading ? <div className="dot-spin"/> : <Arrow/>}
          </button>
        </div>
        {error && <div className="error" style={{maxWidth:520,width:'100%'}}>{error}</div>}
      </div>
      <footer className="home-footer">
        Named Entity Recognition · DeBERTa + LoRA
      </footer>
    </div>
  )

  // ── RESULTS ──
  const groups = grouped()
  return (
    <div className="app">
      <nav className="topbar">
        <button className="topbar-logo" onClick={reset}><img src="/logo.svg" alt="Home"/></button>
        <div className="topbar-actions">
          <div className="history-anchor" ref={histRef}>
            <button className="text-btn" onClick={() => setHistOpen(v => !v)}><Clock/> History</button>
            {histOpen && (
              <div className="history-panel">
                {history.length === 0
                  ? <div className="history-empty">No saved queries yet</div>
                  : history.map((h, i) => (
                    <button key={i} className="history-entry" onClick={() => pick(h)}>
                      <div>{h.text.length > 70 ? h.text.slice(0, 67) + '…' : h.text}</div>
                      <div className="history-meta">{h.entities.length} entities</div>
                    </button>
                  ))
                }
              </div>
            )}
          </div>
          <button className="text-btn" onClick={reset}><Plus/> New</button>
          <a className="icon-btn" href={GITHUB} target="_blank" rel="noopener noreferrer" title="GitHub"><GH/></a>
        </div>
      </nav>

      <div className="results">
        {error && <div className="error">{error}</div>}
        <div className="output">{highlighted()}</div>

        {entities.length > 0 && (
          <div className="summary">
            {Object.entries(groups).map(([code, ents]) => (
              <div key={code} className="summary-group">
                <div className="summary-label">{NAMES[code] || code}</div>
                <div className="summary-pills">
                  {ents.map((e, j) => (
                    <span key={j} className={`pill ${code}`}>
                      {e.word}<span className="pill-score">{(e.score*100).toFixed(0)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="legend">
          {Object.entries(NAMES).map(([c, n]) => (
            <div key={c} className="legend-item"><div className={`legend-dot ${c}`}/><span>{n}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}
