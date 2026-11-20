import { ArrowUpRight, Menu, ScanSearch, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from './UI.jsx'

function Brand({ inverse = false }) {
  return (
    <Link aria-label="HireSense AI home" className={`brand${inverse ? ' brand--inverse' : ''}`} to="/">
      <span className="brand__mark"><ScanSearch aria-hidden="true" size={21} strokeWidth={2.1} /></span>
      <span>HireSense<span className="brand__ai"> AI</span></span>
    </Link>
  )
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Brand />
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav aria-label="Main navigation" className={`main-nav${menuOpen ? ' main-nav--open' : ''}`}>
          <div className="main-nav__links">
            <NavLink onClick={() => setMenuOpen(false)} to="/jobs">Find jobs</NavLink>
            <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="/#for-teams" onClick={() => setMenuOpen(false)}>For teams</a>
          </div>
          <div className="main-nav__actions">
            <Link className="nav-login" onClick={() => setMenuOpen(false)} to="/login">Log in</Link>
            <Button onClick={() => setMenuOpen(false)} size="small" to="/register" variant="primary">Get started</Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Brand inverse />
          <p>Better matches. Brighter workdays.</p>
        </div>
        <div className="site-footer__links">
          <div><span>Explore</span><Link to="/jobs">Find jobs</Link><a href="/#how-it-works">How it works</a></div>
          <div><span>Your account</span><Link to="/login">Log in</Link><Link to="/register">Create an account</Link></div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© 2026 HireSense AI</span>
        <span>Built around people, not just keywords.</span>
      </div>
      <ArrowUpRight aria-hidden="true" className="site-footer__spark" size={18} />
    </footer>
  )
}