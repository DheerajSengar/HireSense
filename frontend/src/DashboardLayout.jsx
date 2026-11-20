import {
  ArrowLeft, BriefcaseBusiness, FileText, LayoutDashboard,
  ScanSearch, Settings2, UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { api, authConfig } from './api.js'
import { Button, Loading } from './UI.jsx'

const workspaceLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'My profile', icon: UserRound },
  { to: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { to: '/resume', label: 'Resume', icon: FileText },
]

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [applicationCount, setApplicationCount] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('hiresense_token')
    if (!token) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return undefined
    }

    let active = true
    api.get('/auth/me', authConfig())
      .then(({ data }) => { if (active) setUser(data.user) })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) {
          localStorage.removeItem('hiresense_token')
          localStorage.removeItem('hiresense_user')
          navigate('/login', { replace: true, state: { from: location.pathname } })
          return
        }
        setError(requestError.response?.data?.message || 'Could not connect to your account. Check that the API is running.')
      })
      .finally(() => { if (active) setIsLoading(false) })

    return () => { active = false }
  }, [location.pathname, navigate, retry])

  useEffect(() => {
    let active = true
    const loadCount = () => {
      api.get('/applications/count', authConfig())
        .then(({ data }) => { if (active) setApplicationCount(data.count) })
        .catch(() => { if (active) setApplicationCount(null) })
    }
    loadCount()
    window.addEventListener('hiresense:applications-changed', loadCount)
    return () => {
      active = false
      window.removeEventListener('hiresense:applications-changed', loadCount)
    }
  }, [location.pathname])

  function logOut() {
    localStorage.removeItem('hiresense_token')
    localStorage.removeItem('hiresense_user')
    navigate('/login', { replace: true })
  }

  if (isLoading) return <div className="workspace-gate"><Loading label="Loading your workspace" /></div>
  if (error) {
    return (
      <div className="workspace-gate">
        <div><p className="workspace-message workspace-message--error" role="alert">{error}</p><Button onClick={() => { setError(''); setIsLoading(true); setRetry((value) => value + 1) }}>Try again</Button></div>
      </div>
    )
  }

  const initials = (user?.name || user?.email || 'U')
    .split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="workspace">
      <aside className="workspace__sidebar">
        <Link aria-label="HireSense AI home" className="workspace__brand" to="/">
          <span className="brand__mark"><ScanSearch aria-hidden="true" size={21} /></span>
          <span>HireSense<span className="brand__ai"> AI</span></span>
        </Link>
        <div className="workspace__label">WORKSPACE</div>
        <nav aria-label="Workspace" className="workspace__nav">
          {workspaceLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink end={end} key={to} to={to}>
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Applications' && applicationCount !== null && <span className="workspace__count">{applicationCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="workspace__sidebar-bottom">
          <NavLink className="workspace__back" to="/jobs">
            <ArrowLeft aria-hidden="true" size={16} /> Browse opportunities
          </NavLink>
          <div className="workspace__user">
            <span className="workspace__avatar">{initials}</span>
            <span className="workspace__user-copy"><strong>{user?.name || 'Job seeker'}</strong><small>{user?.email || 'Personal workspace'}</small></span>
            <button className="workspace__logout" onClick={logOut} type="button">Log out</button>
          </div>
        </div>
      </aside>
      <div className="workspace__main">
        <header className="workspace__topbar">
          <span>Personal workspace</span>
          <button aria-label="Workspace settings" className="workspace__settings" type="button"><Settings2 size={18} /></button>
        </header>
        <main className="workspace__content"><Outlet context={{ user }} /></main>
      </div>
    </div>
  )
}