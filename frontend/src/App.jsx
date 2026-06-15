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

const EXAMPLES = [
  "On the morning of October 12, 2023, Secretary of State Antony Blinken arrived in Tel Aviv, Israel, to meet with Prime Minister Benjamin Netanyahu at the Kirya military headquarters. Following the meeting, Blinken scheduled a brief press conference before flying to Amman, Jordan, to hold urgent diplomatic talks with King Abdullah II regarding the escalating humanitarian crisis in the Middle East.",
  "During the Worldwide Developers Conference (WWDC) held at Apple Park in Cupertino, California, on June 5, 2023, Apple CEO Tim Cook unveiled the highly anticipated Vision Pro mixed-reality headset. The groundbreaking device, which has been in development for over seven years under the codename Project Alaska, is set to launch in the United States early next year with a starting price of $3,499.",
  "Dr. Jane Goodall, the renowned British primatologist and anthropologist, delivered a passionate keynote address at the United Nations Climate Change Conference (COP28) in Dubai, United Arab Emirates, on Thursday afternoon. She urged delegates from over 190 countries, including representatives from Greenpeace and the World Wildlife Fund, to commit to stricter environmental regulations by the end of the decade.",
  "In a landmark legal decision on Friday, the Supreme Court of the United States ruled 6-3 in favor of the Environmental Protection Agency (EPA) in the controversial case of West Virginia v. EPA. Chief Justice John Roberts authored the majority opinion, which significantly restricts the federal government's authority to regulate greenhouse gas emissions from existing power plants under the Clean Air Act of 1970.",
  "SpaceX's colossal Starship rocket, designed by Elon Musk and his engineering team, successfully completed its third integrated flight test after lifting off from the Starbase facility in Boca Chica, Texas, at 8:25 AM Central Time. The spacecraft achieved orbital velocity and coasted across the Indian Ocean before initiating a controlled splashdown west of Australia approximately 65 minutes later.",
  "The Swedish Academy announced in Stockholm on Thursday that the 2023 Nobel Prize in Literature has been awarded to Norwegian author and playwright Jon Fosse. The committee praised his innovative plays and prose, which span over four decades, noting that his masterpiece, 'A New Name: Septology VI-VII', was finalized while he was living in his rural home in western Norway.",
  "Following a highly volatile trading week on the New York Stock Exchange, Federal Reserve Chairman Jerome Powell held a press conference in Washington, D.C., on Wednesday at 2:00 PM EST. He confirmed that the Federal Open Market Committee (FOMC) has unanimously decided to keep the benchmark interest rate steady at 5.25%, easing fears of an impending recession among Wall Street investors.",
  "At the Geneva Motor Show in Switzerland, Toyota Motor Corporation unveiled its next-generation solid-state battery technology, promising an impressive range of 1,200 kilometers on a single 10-minute charge. Chief Technology Officer Hiroki Nakajima stated that the Japanese automaker plans to mass-produce these revolutionary batteries at their newly constructed manufacturing plant in Aichi Prefecture by 2027.",
  "Archaeologists from the University of Cambridge and the Egyptian Ministry of Antiquities have unearthed a beautifully preserved Ptolemaic-era temple near the ancient city of Alexandria. Dr. Sarah Parcak, the lead researcher on the expedition, reported that the site contains intricate hieroglyphics referencing Queen Cleopatra VII and dates back to approximately 30 BC, shortly before the Roman conquest of Egypt.",
  "The International Olympic Committee (IOC), headquartered in Lausanne, Switzerland, officially announced that the 2032 Summer Olympic Games will be hosted by Brisbane, Australia. Australian Prime Minister Anthony Albanese celebrated the decision during a televised broadcast from Parliament House in Canberra, assuring the public that the government has allocated $5 billion AUD for infrastructure upgrades over the next nine years.",
  "On the evening of April 14, 1912, the RMS Titanic, a luxury passenger liner operated by the White Star Line, struck an iceberg in the North Atlantic Ocean during its maiden voyage from Southampton, England, to New York City. Despite the valiant efforts of Captain Edward Smith and the crew, the ship sank roughly two hours and forty minutes later, resulting in the tragic loss of more than 1,500 lives.",
  "Amazon Web Services (AWS), the cloud computing subsidiary of Amazon.com, announced a massive $10 billion investment to build a state-of-the-art data center complex in Hilliard, Ohio. Governor Mike DeWine and AWS CEO Adam Selipsky attended the groundbreaking ceremony on Tuesday morning, highlighting that the multi-year project is expected to create over 1,000 high-paying engineering jobs by 2026.",
  "During a tense emergency session of the United Nations Security Council in New York on Monday, the French Ambassador to the UN, Nicolas de Rivière, proposed a draft resolution calling for an immediate ceasefire in Sudan. The motion was strongly supported by the United Kingdom and the United States, but faced significant pushback from the Russian Federation, raising concerns about a potential veto.",
  "In a stunning upset at the Wimbledon Championships in London, 20-year-old Carlos Alcaraz defeated seven-time champion Novak Djokovic in a grueling five-set final on Centre Court. The match, which lasted exactly 4 hours and 42 minutes, was watched by a star-studded crowd including King Felipe VI of Spain and Hollywood actor Brad Pitt from the Royal Box.",
  "The European Space Agency (ESA) successfully launched the Jupiter Icy Moons Explorer (JUICE) from the Guiana Space Centre in Kourou, French Guiana, utilizing an Ariane 5 rocket. The ambitious mission, led by project scientist Olivier Witasse, is scheduled to arrive at the Jovian system in July 2031, where it will conduct detailed observations of Jupiter and its three large ocean-bearing moons: Ganymede, Callisto, and Europa.",
  "According to a newly released report by the World Bank in Washington, D.C., global economic growth is projected to slow down to 2.4% in 2024, marking the third consecutive year of deceleration. World Bank President Ajay Banga warned that developing nations in Sub-Saharan Africa and Latin America will be disproportionately affected by tightening global financial conditions and persistent inflation.",
  "The highly anticipated blockbuster film 'Oppenheimer', directed by Christopher Nolan and starring Cillian Murphy as the theoretical physicist J. Robert Oppenheimer, premiered at the Le Grand Rex theater in Paris on July 11, 2023. Produced by Universal Pictures and Syncopy Inc., the three-hour historical epic explores the secretive Manhattan Project conducted at the Los Alamos Laboratory in New Mexico during World War II.",
  "In response to the devastating 7.8 magnitude earthquake that struck southeastern Turkey and northern Syria on February 6, the International Federation of Red Cross and Red Crescent Societies (IFRC) launched a massive humanitarian relief operation. Secretary General Jagan Chapagain coordinated the deployment of thousands of volunteers and millions of dollars in emergency medical supplies from their headquarters in Geneva.",
  "During a high-profile technology summit in Seoul, South Korea, Samsung Electronics announced a strategic partnership with Nvidia Corporation to develop advanced semiconductor chips optimized for generative artificial intelligence. Samsung's co-CEO, Kyung Kye-hyun, emphasized that the collaboration will leverage Samsung's cutting-edge 3-nanometer foundry process to produce next-generation GPUs by the fourth quarter of next year.",
  "On Tuesday afternoon, the Nobel Committee at the Karolinska Institute in Solna, Sweden, awarded the 2023 Nobel Prize in Physiology or Medicine to Katalin Karikó and Drew Weissman. Their groundbreaking research on nucleoside base modifications, conducted primarily at the University of Pennsylvania in Philadelphia, was instrumental in the rapid development of highly effective mRNA vaccines against COVID-19 by Pfizer-BioNTech and Moderna."
]

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

  const fillRandom = () => {
    const random = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]
    setText(random)
    setTimeout(() => ref.current?.focus(), 50)
  }

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
      let actualStart = e.start
      let actualEnd = e.end

      if (actualStart < c) actualStart = c
      if (actualStart >= actualEnd) return

      let entText = analyzed.slice(actualStart, actualEnd)
      
      const leadingMatch = entText.match(/^\s+/)
      if (leadingMatch) {
        actualStart += leadingMatch[0].length
        entText = entText.slice(leadingMatch[0].length)
      }

      const trailingMatch = entText.match(/\s+$/)
      if (trailingMatch) {
        actualEnd -= trailingMatch[0].length
        entText = entText.slice(0, entText.length - trailingMatch[0].length)
      }

      if (entText.length === 0) return

      if (actualStart > c) {
        parts.push(<span key={`t${i}`}>{analyzed.slice(c, actualStart)}</span>)
      }

      const code = e.entity_group.toLowerCase()
      parts.push(
        <span key={`e${i}`} className={`mark ${code}`} title={`${NAMES[code] || e.entity_group} · ${(e.score*100).toFixed(1)}%`}>
          {entText}<span className="mark-type">{NAMES[code] || e.entity_group}</span>
        </span>
      )
      c = actualEnd
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
  const Sparkles = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
  const Plus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  const Clock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  const GH = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>

  const groups = grouped()

  return (
    <div className="app">
      <nav className="topbar">
        <button className="topbar-logo" onClick={reset}><img src="/logo.svg" alt="Home"/></button>
        <div className="topbar-actions">
          {view === 'results' && (
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
          )}
          {view === 'results' && <button className="text-btn" onClick={reset}><Plus/> New</button>}
          <a className="icon-btn" href={GITHUB} target="_blank" rel="noopener noreferrer" title="GitHub"><GH/></a>
        </div>
      </nav>

      {view === 'home' ? (
        <>
          <div className="hero">
            <div className="search-box">
              <textarea ref={ref} className="search-field" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run() } }} placeholder="Paste any text to extract entities…" rows={1} />
              <div className="search-toolbar">
                <button className="example-btn" onClick={fillRandom}>
                  <Sparkles/>
                  Surprise me
                </button>
                <button className="search-go" onClick={() => run()} disabled={loading || !text.trim()}>
                  {loading ? <div className="dot-spin"/> : <Arrow/>}
                </button>
              </div>
            </div>
            {error && <div className="error" style={{maxWidth:520,width:'100%'}}>{error}</div>}
          </div>
          <footer className="home-footer">
            Named Entity Recognition · DeBERTa + LoRA
          </footer>
        </>
      ) : (
        <div className="results">
          {error && <div className="error">{error}</div>}
          <div className="output">{highlighted()}</div>

          {entities.length > 0 && (
            <div className="summary">
              {Object.entries(groups).map(([code, ents]) => (
                <div key={code} className="summary-card">
                  <div className="summary-card-header">
                    <div className={`legend-dot ${code}`} />
                    <span>{NAMES[code] || code}</span>
                  </div>
                  <div className="summary-card-body">
                    {ents.map((e, j) => (
                      <div key={j} className="summary-row">
                        <span className="summary-row-text" title={e.word}>{e.word}</span>
                        <span className={`summary-row-score ${code}`}>{(e.score*100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
