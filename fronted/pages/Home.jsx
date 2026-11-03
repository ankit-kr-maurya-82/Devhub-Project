import { Link } from 'react-router-dom'

function HeroArtwork() {
  return (
    <svg className="landing-art" viewBox="0 0 560 520" role="img" aria-label="Code editor with a community conversation">
      <defs>
        <linearGradient id="editor-glow" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#b7f28b" stopOpacity=".24"/><stop offset="1" stopColor="#8ad8d2" stopOpacity=".02"/></linearGradient>
      </defs>
      <circle cx="312" cy="260" r="220" fill="url(#editor-glow)" />
      <g transform="rotate(-4 300 250)">
        <rect x="84" y="104" width="390" height="282" rx="18" fill="#242725" stroke="#545b54" />
        <path d="M84 150h390" stroke="#454b45" />
        <circle cx="109" cy="128" r="5" fill="#ef8078"/><circle cx="128" cy="128" r="5" fill="#e5bd69"/><circle cx="147" cy="128" r="5" fill="#9dcc7a"/>
        <text x="179" y="133" fill="#a5aaa2" fontSize="11" fontFamily="monospace">ideas.js</text>
        <g fontFamily="monospace" fontSize="14">
          <text x="110" y="185" fill="#788078">01</text><text x="148" y="185" fill="#d5a6ee">const</text><text x="194" y="185" fill="#e8e8dc">community</text><text x="281" y="185" fill="#b7f28b">=</text><text x="298" y="185" fill="#e8e8dc">{'{'}</text>
          <text x="110" y="218" fill="#788078">02</text><text x="164" y="218" fill="#a7d9d1">learn:</text><text x="220" y="218" fill="#e5bd69">'together'</text><text x="304" y="218" fill="#e8e8dc">,</text>
          <text x="110" y="251" fill="#788078">03</text><text x="164" y="251" fill="#a7d9d1">share:</text><text x="220" y="251" fill="#e5bd69">'freely'</text><text x="285" y="251" fill="#e8e8dc">,</text>
          <text x="110" y="284" fill="#788078">04</text><text x="164" y="284" fill="#a7d9d1">build:</text><text x="220" y="284" fill="#e5bd69">'anything'</text>
          <text x="110" y="317" fill="#788078">05</text><text x="148" y="317" fill="#e8e8dc">{'}'}</text>
        </g>
        <rect x="109" y="343" width="160" height="23" rx="11.5" fill="#303831" />
        <circle cx="123" cy="354.5" r="4" fill="#b7f28b"/><text x="134" y="359" fill="#c4d0c0" fontSize="10" fontFamily="monospace">all systems curious</text>
      </g>
      <g transform="rotate(5 376 399)">
        <rect x="287" y="340" width="208" height="91" rx="15" fill="#d7f7c3" />
        <circle cx="312" cy="367" r="11" fill="#252b25"/><path d="M307 367h10m-5-5v10" stroke="#d7f7c3" strokeWidth="1.5"/>
        <text x="333" y="370" fill="#344032" fontSize="11" fontFamily="sans-serif" fontWeight="700">A good question</text>
        <text x="310" y="394" fill="#455343" fontSize="11" fontFamily="sans-serif">can open up a whole new</text><text x="310" y="410" fill="#455343" fontSize="11" fontFamily="sans-serif">way of thinking.</text>
      </g>
      <path d="M76 426c75 34 129 34 190 4" fill="none" stroke="#a7d9d1" strokeWidth="1.5" strokeDasharray="3 7" />
      <circle cx="76" cy="426" r="4" fill="#b7f28b"/><circle cx="267" cy="430" r="4" fill="#b7f28b"/>
    </svg>
  )
}

export default function Home() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-wordmark" aria-label="DevHub home">DevHub</Link>
        <nav aria-label="Main navigation" className="landing-nav">
          <Link to="/questions">Explore</Link>
          <Link to="/blogs">Stories</Link>
          <Link to="/community">Community</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/register" className="landing-pill">Get started</Link>
        </nav>
      </header>
      <main className="landing-hero">
        <div className="landing-copy">
          <p className="landing-eyebrow"><span className="landing-spark" aria-hidden="true">✳</span> For the curious and the builders</p>
          <h1>Good ideas<br />grow together.</h1>
          <p className="landing-subtitle">Find your people, work through the tricky bits, and share what you discover along the way.</p>
          <Link to="/questions" className="landing-cta">Find your next idea <span aria-hidden="true">→</span></Link>
        </div>
        <HeroArtwork />
      </main>
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} DevHub</span>
        <nav aria-label="Footer navigation">
          <Link to="/community">Community</Link><Link to="/blogs">Blog</Link><Link to="/questions">Questions</Link><Link to="/login">Help</Link>
        </nav>
      </footer>
    </div>
  )
}
