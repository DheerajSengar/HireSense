import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, BookmarkCheck, BriefcaseBusiness, Building2, CalendarDays, Check, ChevronRight,
  CircleHelp, FileText, LockKeyhole, Mail, MapPin, Search, ShieldCheck,
  Sparkles, Target, Trash2, Upload, UserRound, UsersRound, WandSparkles,
} from 'lucide-react'
import axios from 'axios'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { API_BASE_URL, api, authConfig } from './api.js'
import { Button, Card, Input, Loading } from './UI.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const steps = [
  { number: '01', icon: UserRound, title: 'Show us what matters', text: 'Build a profile around your strengths, goals, and the work you want to do next.' },
  { number: '02', icon: WandSparkles, title: 'See the full picture', text: 'Get a thoughtful read on role fit, with the reasons behind every recommendation.' },
  { number: '03', icon: Target, title: 'Make your next move', text: 'Keep your search focused and your applications organized in one calm workspace.' },
]

export function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-section__wash" aria-hidden="true" />
        <div className="hero-section__inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow__dot" /> A more human way to find your next role</div>
            <h1>Work that fits<br />who <em>you are.</em></h1>
            <p className="hero-copy__summary">A smarter job search starts with you. Discover opportunities that match your strengths, values, and where you want to go.</p>
            <div className="hero-copy__actions">
              <Button icon={ArrowUpRight} to="/register">Find your fit</Button>
              <a className="text-link" href="#how-it-works">See how it works <ArrowDown aria-hidden="true" size={15} /></a>
            </div>
            <div className="hero-proof">
              <span className="hero-proof__avatars" aria-hidden="true"><i>J</i><i>M</i><i>A</i><i>+</i></span>
              <span><strong>Made for the person behind the resume.</strong><small>More signal. Less searching.</small></span>
            </div>
          </div>

          <div className="match-visual" aria-label="Example HireSense role match preview">
            <div className="match-visual__orb match-visual__orb--one" />
            <div className="match-visual__orb match-visual__orb--two" />
            <Card className="match-card">
              <div className="match-card__top"><span className="match-card__label"><Sparkles size={14} /> YOUR MATCH SNAPSHOT</span><span className="match-card__dots">•••</span></div>
              <div className="match-card__role">
                <span className="match-card__company">n</span>
                <span><strong>Product Designer</strong><small>Northstar Labs · Remote</small></span>
                <span className="match-card__bookmark" aria-hidden="true"><ArrowUpRight size={17} /></span>
              </div>
              <div className="match-score">
                <div className="match-score__ring"><span>92<small>%</small></span></div>
                <div><strong>Strong alignment</strong><span>Your experience and priorities line up with this role.</span></div>
              </div>
              <div className="match-card__divider" />
              <div className="match-signals">
                <span><Check size={14} /> Product strategy</span>
                <span><Check size={14} /> Flexible work</span>
                <span><Check size={14} /> Growth stage</span>
              </div>
              <div className="match-card__bottom"><span><ShieldCheck size={15} /> Explained, not just ranked</span><span>1 of 24</span></div>
            </Card>
            <div className="floating-note"><span className="floating-note__icon"><Target size={18} /></span><span><strong>Your priorities</strong><small>Actually count here.</small></span><span className="floating-note__check"><Check size={14} /></span></div>
            <div className="visual-caption"><span>FIND THE FIT</span><span>01 / 03</span></div>
          </div>
        </div>
        <div className="hero-edge"><span>BUILT FOR WHAT’S NEXT</span><span>SCROLL TO EXPLORE <ChevronRight size={13} /></span></div>
      </section>

      <section aria-label="HireSense approach" className="belief-strip">
        <div><span>01</span><strong>People before keywords</strong></div>
        <div><span>02</span><strong>Context over guesswork</strong></div>
        <div><span>03</span><strong>Clarity at every step</strong></div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow__line" /> THE HIRING SEARCH, RECONSIDERED</div><h2>Good work starts<br />with a <em>better match.</em></h2></div>
          <p>Finding a role shouldn’t feel like searching for a needle in an endless feed. We help you focus on the opportunities that make sense for you.</p>
        </div>
        <div className="steps-grid">
          {steps.map(({ number, icon: Icon, title, text }) => (
            <article className="step" key={number}>
              <div className="step__meta"><span>{number}</span><Icon aria-hidden="true" size={21} strokeWidth={1.6} /></div>
              <h3>{title}</h3><p>{text}</p><span className="step__rule" />
            </article>
          ))}
        </div>
      </section>

      <section className="teams-section" id="for-teams">
        <div className="teams-section__symbol"><UsersRound aria-hidden="true" size={25} /></div>
        <div><span className="eyebrow eyebrow--light">FOR THOUGHTFUL TEAMS</span><h2>Meet people for<br />who they <em>could become.</em></h2></div>
        <div className="teams-section__aside"><p>HireSense brings a more complete picture to every connection, so teams can look beyond the checklist.</p><Link className="teams-section__link" to="/register">Explore HireSense <ArrowUpRight size={16} /></Link></div>
        <span className="teams-section__shape" aria-hidden="true" />
      </section>
      <div className="home-bottom-note"><span>HIRE SENSE, NOT JUST SKILLS.</span><span>YOUR NEXT CHAPTER STARTS HERE <ArrowRight size={14} /></span></div>
    </>
  )
}

export function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const location = useLocation()
  const navigate = useNavigate()
  const returnTo = location.state?.from
  const destination = typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : '/dashboard'
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: formData.get('email').trim().toLowerCase(),
      password: formData.get('password'),
    }
    if (isRegister) payload.name = formData.get('name').trim()

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/${isRegister ? 'register' : 'login'}`,
        payload,
      )
      const { token, user } = response.data

      if (!token || !user) {
        setError('The server returned an incomplete sign-in response. Please try again.')
        return
      }

      localStorage.setItem('hiresense_token', token)
      localStorage.setItem('hiresense_user', JSON.stringify(user))
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || 'Could not connect to HireSense. Check that the backend is running and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSuccess(googleResponse) {
    if (!googleResponse.credential) {
      setError('Google did not return a sign-in credential. Please try again.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        credential: googleResponse.credential,
      })
      const { token, user } = response.data

      if (!token || !user) {
        setError('The server returned an incomplete sign-in response. Please try again.')
        return
      }

      localStorage.setItem('hiresense_token', token)
      localStorage.setItem('hiresense_user', JSON.stringify(user))
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || 'Google sign-in failed. Check your connection and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel__content">
          <span className="eyebrow eyebrow--light"><Sparkles size={14} /> A SEARCH THAT SEES YOU</span>
          <h1>{isRegister ? <>Your next chapter<br />starts <em>with you.</em></> : <>Good to have<br />you <em>back.</em></>}</h1>
          <p>{isRegister ? 'Make room for a more considered kind of job search.' : 'Pick up where you left off and keep your search moving.'}</p>
          <div className="auth-panel__note"><span><ShieldCheck size={18} /></span><span><strong>Your career is yours.</strong><small>Your profile stays in your control.</small></span></div>
        </div>
        <span className="auth-panel__coordinates">37°46′49″N&nbsp;&nbsp; 122°25′09″W</span>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-form__heading"><span className="eyebrow"><span className="eyebrow__line" /> {isRegister ? 'A GOOD PLACE TO BEGIN' : 'YOUR SEARCH CONTINUES'}</span><h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2><p>{isRegister ? 'A few details, and you’re on your way.' : 'Sign in to your HireSense workspace.'}</p></div>
          <form onSubmit={handleSubmit}>
            {isRegister && <Input autoComplete="name" label="Full name" name="name" placeholder="Jordan Davis" required />}
            <Input autoComplete="email" icon={Mail} label="Email address" name="email" placeholder="you@example.com" required type="email" />
            <Input autoComplete={isRegister ? 'new-password' : 'current-password'} icon={LockKeyhole} label="Password" name="password" minLength={isRegister ? 6 : undefined} placeholder="At least 6 characters" required type="password" />
            {isRegister && <Input autoComplete="organization-title" label="What kind of role are you looking for?" name="target-role" placeholder="e.g. Product designer" />}
            {!isRegister && <div className="auth-form__options"><label><input type="checkbox" /> <span>Keep me signed in</span></label><a href="mailto:support@hiresense.ai">Forgot password?</a></div>}
            {error && <p className="auth-form__error" role="alert">{error}</p>}
            <Button className="auth-form__submit" disabled={isSubmitting} icon={ArrowRight} type="submit">{isSubmitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in to your account'}</Button>
          </form>
          <div className="auth-google">
            <span className="auth-google__divider">or continue with</span>
            {GOOGLE_CLIENT_ID ? (
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onError={() => setError('Google sign-in could not start. Please try again.')}
                  onSuccess={handleGoogleSuccess}
                  useOneTap={false}
                />
              </GoogleOAuthProvider>
            ) : (
              <p className="auth-google__setup">Google sign-in needs a Client ID. See the setup instructions in the README.</p>
            )}
          </div>
          <p className="auth-form__switch">{isRegister ? 'Already have an account?' : 'New to HireSense?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
          <p className="auth-form__legal">By continuing, you agree to our <a href="mailto:hello@hiresense.ai?subject=Terms">Terms</a> and <a href="mailto:hello@hiresense.ai?subject=Privacy">Privacy Policy</a>.</p>
        </div>
      </div>
    </section>
  )
}

const sections = {
  jobs: { eyebrow: 'OPPORTUNITIES', title: 'Find your next fit.', icon: BriefcaseBusiness, description: 'Thoughtful matches for the work you want to do next.' },
  'job-detail': { eyebrow: 'ROLE DETAILS', title: 'A closer look.', icon: Search, description: 'Role details and fit insights will live here.' },
  dashboard: { eyebrow: 'YOUR HIRING SEARCH', title: 'A fresh start.', icon: Sparkles, description: 'Your search workspace is ready when you are.' },
  profile: { eyebrow: 'YOUR STORY', title: 'Your profile.', icon: UserRound, description: 'Bring your experience, strengths, and priorities together.' },
  applications: { eyebrow: 'KEEP IT TOGETHER', title: 'Your applications.', icon: BriefcaseBusiness, description: 'A clear view of the opportunities you choose to pursue.' },
  resume: { eyebrow: 'YOUR EXPERIENCE', title: 'Resume workspace.', icon: FileText, description: 'Keep your career story ready for what comes next.' },
}

function ProfileSetup() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    headline: '',
    summary: '',
    details: { phone: '', location: '', linkedin: '', github: '', website: '' },
    skills: [],
    experience: [],
    education: [],
    projects: [],
    resume: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [suggestions, setSuggestions] = useState(null)

  function readProfile(data) {
    const saved = data.profile
    const candidateProfile = saved.candidateProfile || {}
    const withKeys = (items = []) => items.map((item, index) => ({
      ...item,
      clientKey: item._id || `${Date.now()}-${index}`,
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : '',
    }))
    return {
      name: saved.name || '',
      email: saved.email || '',
      headline: saved.profile?.headline || '',
      summary: saved.profile?.summary || '',
      details: {
        phone: saved.profile?.phone || '',
        location: saved.profile?.location || '',
        linkedin: saved.profile?.linkedin || '',
        github: saved.profile?.github || '',
        website: saved.profile?.website || '',
      },
      skills: (candidateProfile.skills || []).map((skill, index) => {
        const entry = typeof skill === 'string' ? { name: skill } : skill
        return { ...entry, clientKey: entry._id || `${Date.now()}-skill-${index}` }
      }),
      experience: withKeys(candidateProfile.experience),
      education: withKeys(candidateProfile.education),
      projects: withKeys(candidateProfile.projects).map((project) => ({
        ...project,
        technologies: (project.technologies || []).join(', '),
      })),
      resume: candidateProfile.resume?.url ? candidateProfile.resume : null,
    }
  }

  useEffect(() => {
    let active = true
    api.get('/profile', authConfig())
      .then(({ data }) => {
        if (!active) return
        setProfile(readProfile(data))
        setHasUnsavedChanges(false)
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) {
          localStorage.removeItem('hiresense_token')
          localStorage.removeItem('hiresense_user')
          navigate('/login', { replace: true })
          return
        }
        setError(requestError.response?.data?.message || 'Could not load your profile. Please try again.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [navigate])

  function updateField(event) {
    setHasUnsavedChanges(true)
    setSuggestions(null)
    setMessage('')
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function updateDetail(event) {
    setHasUnsavedChanges(true)
    setSuggestions(null)
    setMessage('')
    setProfile((current) => ({
      ...current,
      details: { ...current.details, [event.target.name]: event.target.value },
    }))
  }

  function updateItem(section, index, field, value) {
    setHasUnsavedChanges(true)
    setSuggestions(null)
    setMessage('')
    setProfile((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }))
  }

  function addItem(section) {
    setHasUnsavedChanges(true)
    setMessage('')
    setProfile((current) => {
      const clientKey = `${Date.now()}-${Math.random()}`
      const item = section === 'skills'
        ? { clientKey, name: '', proficiency: 'beginner', yearsExperience: 0 }
        : section === 'experience'
          ? { clientKey, company: '', position: '', description: '', startDate: '', endDate: '', current: false }
          : section === 'education'
            ? { clientKey, institution: '', degree: '', field: '', startDate: '', endDate: '', current: false }
            : { clientKey, title: '', description: '', technologies: '', link: '' }
      return { ...current, [section]: [...current[section], item] }
    })
  }

  function removeItem(section, index) {
    setHasUnsavedChanges(true)
    setSuggestions(null)
    setMessage('')
    setProfile((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  async function saveProfile(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')
    const cleanItems = (items, section) => items.map(({ clientKey: _clientKey, technologies, ...item }) => (
      section === 'projects'
        ? { ...item, technologies: (technologies || '').split(',').map((technology) => technology.trim()).filter(Boolean) }
        : item
    ))
    try {
      const { data } = await api.put('/profile', {
        name: profile.name.trim(),
        profile: {
          headline: profile.headline.trim(),
          summary: profile.summary.trim(),
          ...Object.fromEntries(Object.entries(profile.details).map(([field, value]) => [field, value.trim()])),
        },
        skills: profile.skills.map(({ clientKey: _clientKey, ...skill }) => ({
          ...skill,
          name: skill.name.trim(),
          yearsExperience: Number(skill.yearsExperience) || 0,
        })),
        experience: cleanItems(profile.experience, 'experience'),
        education: cleanItems(profile.education, 'education'),
        projects: cleanItems(profile.projects, 'projects'),
      }, authConfig())
      const storedUser = JSON.parse(localStorage.getItem('hiresense_user') || '{}')
      localStorage.setItem('hiresense_user', JSON.stringify({ ...storedUser, name: profile.name.trim() }))
      setProfile(readProfile(data))
      setHasUnsavedChanges(false)
      setMessage('Your profile has been saved.')
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        navigate('/login', { replace: true })
        return
      }
      setError(requestError.response?.data?.message || 'Could not save your profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function improveProfile() {
    setError('')
    setMessage('')
    setSuggestions(null)
    setIsImproving(true)
    try {
      const { data } = await api.post('/profile/improve', {}, authConfig())
      setSuggestions(data.suggestions)
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        navigate('/login', { replace: true })
        return
      }
      setError(requestError.response?.data?.message || 'AI profile improvements are temporarily unavailable.')
    } finally {
      setIsImproving(false)
    }
  }

  async function uploadResume(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      setError('Choose a PDF resume.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume files must be 5 MB or smaller.')
      return
    }
    setError('')
    setMessage('')
    setIsUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      await api.post('/profile/resume', formData, authConfig())
      const { data } = await api.get('/profile', authConfig())
      setProfile(readProfile(data))
      setHasUnsavedChanges(false)
      setMessage('Resume uploaded and analyzed. Your saved profile now includes the resume details.')
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        navigate('/login', { replace: true })
        return
      }
      setError(requestError.response?.data?.message || 'Resume upload failed. Please try again.')
    } finally {
      setIsUploadingResume(false)
    }
  }

  if (isLoading) return <Card className="workspace-card-message"><Loading label="Loading your profile" /></Card>
  if (error && !profile.email) {
    return <Card className="workspace-card-message"><p className="workspace-message workspace-message--error" role="alert">{error}</p><Button onClick={() => window.location.reload()}>Try again</Button></Card>
  }

  return (
    <Card className="profile-editor">
      <div className="profile-editor__heading">
        <span className="overview-link__icon overview-link__icon--mint"><UserRound size={19} /></span>
        <div><h2>Build your profile</h2><p>Add your details and skills to shape your job search.</p></div>
      </div>
      {error && <p className="workspace-message workspace-message--error" role="alert">{error}</p>}
      {message && <p className="workspace-message workspace-message--success" role="status">{message}</p>}
      <form className="profile-form" onSubmit={saveProfile}>
        <Input autoComplete="name" label="Full name" maxLength={120} name="name" onChange={updateField} required value={profile.name} />
        <Input autoComplete="email" label="Email address" name="email" readOnly type="email" value={profile.email} />
        <Input label="Professional headline" maxLength={160} name="headline" onChange={updateField} placeholder="e.g. Product designer focused on accessible experiences" value={profile.headline} />
        <Input autoComplete="tel" label="Phone" maxLength={40} name="phone" onChange={updateDetail} type="tel" value={profile.details.phone} />
        <Input autoComplete="address-level2" label="Location" maxLength={120} name="location" onChange={updateDetail} placeholder="City, country or Remote" value={profile.details.location} />
        <Input autoComplete="url" label="LinkedIn profile" maxLength={500} name="linkedin" onChange={updateDetail} placeholder="https://linkedin.com/in/you" type="url" value={profile.details.linkedin} />
        <Input autoComplete="url" label="GitHub profile" maxLength={500} name="github" onChange={updateDetail} placeholder="https://github.com/you" type="url" value={profile.details.github} />
        <Input autoComplete="url" label="Personal website" maxLength={500} name="website" onChange={updateDetail} placeholder="https://example.com" type="url" value={profile.details.website} />
        <label className="profile-form__wide field">
          <span className="field__label">Professional summary</span>
          <textarea maxLength="2000" name="summary" onChange={updateField} placeholder="Summarize your experience, strengths, and the work you want to do." rows="4" value={profile.summary} />
          <span className="field__hint">{profile.summary.length}/2000 characters</span>
        </label>

        <section className="profile-form__wide profile-section">
          <div className="profile-section__heading"><div><h3>Skills</h3><p>Record each skill with your current proficiency and experience.</p></div><button className="profile-add-button" disabled={profile.skills.length >= 100} onClick={() => addItem('skills')} type="button">Add skill</button></div>
          {profile.skills.length === 0 && <p className="profile-form__empty">No skills added yet.</p>}
          {profile.skills.map((skill, index) => (
            <div className="profile-entry profile-entry--skill" key={skill.clientKey}>
              <Input label="Skill" maxLength={80} name={`skill-${index}`} onChange={(event) => updateItem('skills', index, 'name', event.target.value)} placeholder="e.g. React" required value={skill.name || ''} />
              <label className="field"><span className="field__label">Proficiency</span><select onChange={(event) => updateItem('skills', index, 'proficiency', event.target.value)} value={skill.proficiency || 'beginner'}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></label>
              <Input label="Years" max={50} min={0} onChange={(event) => updateItem('skills', index, 'yearsExperience', event.target.value)} type="number" value={skill.yearsExperience ?? 0} />
              <button aria-label={`Remove ${skill.name || 'skill'}`} className="profile-remove-button" onClick={() => removeItem('skills', index)} type="button">Remove</button>
            </div>
          ))}
        </section>

        <ProfileEntrySection
          add={() => addItem('experience')}
          entries={profile.experience}
          fields={[
            ['position', 'Job title', 'text'],
            ['company', 'Company', 'text'],
            ['startDate', 'Start date', 'date'],
            ['endDate', 'End date', 'date'],
            ['description', 'Description', 'textarea'],
          ]}
          onChange={(index, field, value) => updateItem('experience', index, field, value)}
          onRemove={(index) => removeItem('experience', index)}
          requiredField="position"
          section="experience"
          title="Experience"
        />
        <ProfileEntrySection
          add={() => addItem('education')}
          entries={profile.education}
          fields={[
            ['institution', 'Institution', 'text'],
            ['degree', 'Degree', 'text'],
            ['field', 'Field of study', 'text'],
            ['startDate', 'Start date', 'date'],
            ['endDate', 'End date', 'date'],
          ]}
          onChange={(index, field, value) => updateItem('education', index, field, value)}
          onRemove={(index) => removeItem('education', index)}
          requiredField="institution"
          section="education"
          title="Education"
        />
        <ProfileEntrySection
          add={() => addItem('projects')}
          entries={profile.projects}
          fields={[
            ['title', 'Project name', 'text'],
            ['link', 'Project link', 'url'],
            ['technologies', 'Technologies (comma-separated)', 'text'],
            ['description', 'Description', 'textarea'],
          ]}
          onChange={(index, field, value) => updateItem('projects', index, field, value)}
          onRemove={(index) => removeItem('projects', index)}
          requiredField="title"
          section="projects"
          title="Projects"
        />
        <section className="profile-form__wide profile-section">
          <div className="profile-section__heading"><div><h3>Resume</h3><p>{profile.resume ? 'A resume is saved to your profile.' : 'Upload a text-based PDF (up to 5 MB).'}{profile.resume?.uploadedAt ? ` Last uploaded ${new Date(profile.resume.uploadedAt).toLocaleDateString()}.` : ''}{hasUnsavedChanges ? ' Save profile edits before uploading a resume.' : ''}</p>{profile.resume?.url && <a className="profile-resume-link" href={`${API_BASE_URL.replace(/\/api\/?$/, '')}${profile.resume.url}`} rel="noreferrer" target="_blank">View current resume <ArrowUpRight size={14} /></a>}</div><label className="profile-add-button">{isUploadingResume ? 'Analyzing…' : hasUnsavedChanges ? 'Save edits first' : profile.resume ? 'Replace resume' : 'Upload resume'}<input accept=".pdf,application/pdf" disabled={isUploadingResume || hasUnsavedChanges} onChange={uploadResume} type="file" /></label></div>
        </section>

        <div className="profile-form__wide profile-actions">
          <Button className="profile-form__submit" disabled={isSaving || isUploadingResume} icon={Check} type="submit">{isSaving ? 'Saving…' : 'Save profile'}</Button>
          <Button disabled={isImproving || isSaving || isUploadingResume || hasUnsavedChanges} icon={Sparkles} onClick={improveProfile} type="button">{isImproving ? 'Analyzing your profile…' : 'AI Improve Profile'}</Button>
          {hasUnsavedChanges && <span className="field__hint">Save your edits before requesting AI suggestions.</span>}
        </div>
      </form>
      {suggestions && <ProfileSuggestions suggestions={suggestions} />}
    </Card>
  )
}

function ProfileEntrySection({ add, entries, fields, onChange, onRemove, requiredField, section, title }) {
  return (
    <section className="profile-form__wide profile-section">
      <div className="profile-section__heading"><div><h3>{title}</h3><p>{title === 'Experience' ? 'Add your relevant work history.' : title === 'Education' ? 'Add your education and training.' : 'Showcase selected projects.'}</p></div><button className="profile-add-button" disabled={entries.length >= 30} onClick={add} type="button">Add {title.toLowerCase()}</button></div>
      {entries.length === 0 && <p className="profile-form__empty">No {title.toLowerCase()} entries added yet.</p>}
      {entries.map((entry, index) => (
        <div className="profile-entry" key={entry.clientKey}>
          <div className="profile-entry__heading"><strong>{entry.position || entry.title || entry.institution || `${title} ${index + 1}`}</strong><button className="profile-remove-button" onClick={() => onRemove(index)} type="button">Remove</button></div>
          <div className="profile-entry__fields">
            {fields.map(([field, label, type]) => (
              type === 'textarea'
                ? <label className="field profile-entry__wide" key={field}><span className="field__label">{label}</span><textarea maxLength={2000} onChange={(event) => onChange(index, field, event.target.value)} rows="3" value={entry[field] || ''} /></label>
                : <Input key={field} autoComplete={type === 'url' ? 'url' : undefined} label={label} maxLength={field === 'link' ? 500 : 160} name={`${section}-${index}-${field}`} onChange={(event) => onChange(index, field, event.target.value)} required={field === requiredField} type={type} value={entry[field] || ''} />
            ))}
            {(section === 'experience' || section === 'education') && <label className="profile-current"><input checked={Boolean(entry.current)} onChange={(event) => onChange(index, 'current', event.target.checked)} type="checkbox" /> {section === 'experience' ? 'I currently work here' : 'I am currently studying here'}</label>}
          </div>
        </div>
      ))}
    </section>
  )
}

function ProfileSuggestions({ suggestions }) {
  return (
    <section className="profile-suggestions" aria-live="polite">
      <div className="profile-section__heading"><div><span className="eyebrow">GEMINI CAREER COACH</span><h3>AI profile suggestions</h3></div><Sparkles size={19} /></div>
      {suggestions.summary && <p className="profile-suggestions__summary">{suggestions.summary}</p>}
      {suggestions.missingSkills?.length > 0 && <div><h4>Skills to consider learning</h4><ul>{suggestions.missingSkills.map((skill) => <li key={skill.name}><strong>{skill.name}</strong><span>{skill.reason}</span></li>)}</ul></div>}
      {suggestions.improvements?.length > 0 && <div><h4>Profile improvements</h4><ul>{suggestions.improvements.map((item, index) => <li key={`${item.section}-${index}`}><strong>{item.section}</strong><span>{item.suggestion}</span></li>)}</ul></div>}
      {!suggestions.summary && !suggestions.missingSkills?.length && !suggestions.improvements?.length && <p className="profile-form__empty">Gemini did not return suggestions for this profile. Try adding more experience or skills.</p>}
      <p className="profile-suggestions__notice">Suggestions are guidance only and haven’t been added to your profile. Only list skills and experience that accurately reflect your background.</p>
    </section>
  )
}

function JobListings() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/jobs', { params: { search: query || undefined, limit: 50 } })
      .then(({ data }) => { if (active) setJobs(data.jobs || []) })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load opportunities. Check that the API is running.')
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [query])

  function submitSearch(event) {
    event.preventDefault()
    const nextQuery = search.trim()
    if (nextQuery === query) return
    setIsLoading(true)
    setError('')
    setQuery(nextQuery)
  }

  return (
    <div className="job-browser">
      <form className="job-search" onSubmit={submitSearch}>
        <label className="job-search__field"><Search aria-hidden="true" size={17} /><input aria-label="Search opportunities" onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, skills, or keywords" value={search} /></label>
        <Button icon={Search} type="submit">Search</Button>
      </form>
      {error && <p className="workspace-message workspace-message--error" role="alert">{error}</p>}
      {isLoading ? <Card className="workspace-card-message"><Loading label="Finding opportunities" /></Card> : (
        jobs.length ? <div className="job-list">
          {jobs.map((job) => (
            <Card className="job-card" key={job._id}>
              <div className="job-card__top"><span className="job-card__icon"><BriefcaseBusiness size={18} /></span><span className="eyebrow">{job.employmentType || 'Opportunity'}</span></div>
              <h2><Link to={`/jobs/${job._id}`}>{job.title}</Link></h2>
              <p className="job-card__company">{job.recruiter?.recruiterProfile?.company || job.recruiter?.name || 'Hiring team'}</p>
              <div className="job-card__facts"><span><MapPin size={14} />{job.location}</span><span>{job.workType}</span><span>{job.experience} level</span></div>
              <p className="job-card__description">{job.description}</p>
              <div className="job-card__bottom"><div className="job-card__skills">{(job.skills || []).slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div><Link className="text-link" to={`/jobs/${job._id}`}>View opportunity <ArrowUpRight size={15} /></Link></div>
            </Card>
          ))}
        </div> : <Card className="workspace-card-message"><h2>No opportunities found</h2><p>{query ? 'Try another search term.' : 'New opportunities will appear here when employers publish them.'}</p></Card>
      )}
    </div>
  )
}

function JobDetail({ id }) {
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isMatchLoading, setIsMatchLoading] = useState(false)
  const [isCandidate, setIsCandidate] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [match, setMatch] = useState(null)
  const [matchError, setMatchError] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/jobs/${id}`)
      .then(({ data }) => {
        if (!active) return
        setJob(data.job)
        const token = localStorage.getItem('hiresense_token')
        setIsSignedIn(Boolean(token))
        if (!token) return

        let storedUser = {}
        try {
          storedUser = JSON.parse(localStorage.getItem('hiresense_user') || '{}')
        } catch {
          storedUser = {}
        }
        const candidate = storedUser.role === 'candidate'
        setIsCandidate(candidate)
        if (!candidate) return

        setIsMatchLoading(true)
        Promise.allSettled([
          api.get(`/applications/job-state/${id}`, authConfig()),
          api.get(`/match/${id}`, authConfig()),
        ]).then(([stateResult, matchResult]) => {
          if (!active) return
          if (stateResult.status === 'fulfilled') {
            setIsApplied(stateResult.value.data.applied)
            setIsSaved(stateResult.value.data.saved)
          } else if (stateResult.reason.response?.status === 401) {
            localStorage.removeItem('hiresense_token')
            localStorage.removeItem('hiresense_user')
            setIsSignedIn(false)
            setIsCandidate(false)
          }
          if (matchResult.status === 'fulfilled') {
            setMatch(matchResult.value.data)
          } else {
            setMatchError(matchResult.reason.response?.data?.message || 'Could not calculate your match right now.')
          }
        }).finally(() => {
          if (active) setIsMatchLoading(false)
        })
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load this opportunity.')
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [id])

  async function loadMatch() {
    setIsMatchLoading(true)
    setMatchError('')
    try {
      const { data } = await api.get(`/match/${id}`, authConfig())
      setMatch(data)
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        setIsSignedIn(false)
        setIsCandidate(false)
      }
      setMatchError(requestError.response?.data?.message || 'Could not calculate your match right now.')
    } finally {
      setIsMatchLoading(false)
    }
  }

  async function applyToJob() {
    const token = localStorage.getItem('hiresense_token')
    if (!token) {
      navigate('/login', { state: { from: `/jobs/${id}` } })
      return
    }
    if (!isCandidate) return
    if (isApplied) return
    setIsApplying(true)
    setError('')
    setMessage('')
    try {
      await api.post('/applications', { jobId: id }, authConfig())
      setIsApplied(true)
      setMessage('Application submitted successfully.')
      window.dispatchEvent(new Event('hiresense:applications-changed'))
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setIsApplied(true)
        setMessage('You have already applied to this opportunity.')
        return
      }
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        navigate('/login', { replace: true })
        return
      }
      setError(requestError.response?.data?.message || 'Could not submit your application. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  async function toggleSavedJob() {
    if (!localStorage.getItem('hiresense_token')) {
      navigate('/login', { state: { from: `/jobs/${id}` } })
      return
    }
    if (!isCandidate) return
    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      const { data } = await api.post('/applications/saved', { jobId: id }, authConfig())
      setIsSaved(data.saved)
      setMessage(data.message || (data.saved ? 'Job saved.' : 'Job removed from saved jobs.'))
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        navigate('/login', { replace: true, state: { from: `/jobs/${id}` } })
        return
      }
      setError(requestError.response?.data?.message || 'Could not update your saved jobs. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <Card className="workspace-card-message"><Loading label="Loading opportunity" /></Card>
  if (!job) return <Card className="workspace-card-message"><p className="workspace-message workspace-message--error" role="alert">{error || 'Opportunity not found.'}</p><Button icon={ArrowLeft} to="/jobs" size="small">Back to opportunities</Button></Card>

  const salary = job.salary && (job.salary.min != null || job.salary.max != null)
    ? `${job.salary.currency || 'USD'} ${job.salary.min != null ? job.salary.min.toLocaleString() : '—'} – ${job.salary.max != null ? job.salary.max.toLocaleString() : '—'}`
    : 'Not specified'

  return (
    <div className="job-detail-layout">
      <Card className="job-detail">
      <Link className="job-detail__back" to="/jobs"><ArrowLeft size={15} /> All opportunities</Link>
        <div className="job-detail__header">
          <span className="job-card__icon"><BriefcaseBusiness aria-hidden="true" size={20} /></span>
          <span className="eyebrow">{job.employmentType} · {job.workType}</span>
        </div>
        <h2>{job.title}</h2>
        <p className="job-detail__company"><Building2 aria-hidden="true" size={15} />{job.recruiter?.recruiterProfile?.company || job.recruiter?.name || 'Hiring team'} <span>·</span> <MapPin aria-hidden="true" size={14} />{job.location}</p>
        <div className="job-detail__facts">
          <span><strong>Experience</strong>{job.experience} level</span>
          <span><strong>Employment</strong>{job.employmentType}</span>
          <span><strong>Work arrangement</strong>{job.workType}</span>
          <span><strong>Salary</strong>{salary}</span>
        </div>
        <section className="job-detail__section"><h3>About the role</h3><p className="job-detail__description">{job.description}</p></section>
        <section className="job-detail__section"><h3>Skills and experience</h3>{job.skills?.length ? <div className="job-card__skills">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p className="job-detail__description">No specific skills were listed for this role.</p>}</section>
        {error && <p className="workspace-message workspace-message--error" role="alert">{error}</p>}
        {message && <p className="workspace-message workspace-message--success" role="status">{message}</p>}
        <div className="job-detail__actions">
          <Button disabled={isApplying || isApplied || (isSignedIn && !isCandidate)} icon={isApplied ? Check : ArrowRight} onClick={applyToJob}>{isApplying ? 'Submitting…' : isApplied ? 'Already applied' : isSignedIn && !isCandidate ? 'Candidate account required' : 'Apply for this role'}</Button>
          <Button disabled={isSaving || (isSignedIn && !isCandidate)} icon={isSaved ? BookmarkCheck : Bookmark} onClick={toggleSavedJob} variant="secondary">{isSaving ? 'Saving…' : isSaved ? 'Saved job' : 'Save job'}</Button>
          {isApplied && <Link className="text-link" to="/applications">View your applications <ArrowUpRight aria-hidden="true" size={14} /></Link>}
        </div>
      </Card>

      <Card className="job-match-card">
        <div className="job-match-card__heading"><span className="job-match-card__icon"><Sparkles aria-hidden="true" size={18} /></span><div><span className="eyebrow">GEMINI + PROFILE EMBEDDINGS</span><h2>AI match</h2></div></div>
        {!isSignedIn ? (
          <div className="job-match-card__empty"><p>Sign in as a candidate to compare this role with your profile and resume.</p><Button to="/login" size="small" variant="secondary">Sign in to view match</Button></div>
        ) : !isCandidate ? (
          <p className="job-match-card__empty">Personalized job matching is available to candidate accounts.</p>
        ) : isMatchLoading ? <Loading label="Comparing your profile with this role" /> : matchError ? (
          <div className="job-match-card__empty"><p className="workspace-message workspace-message--error" role="alert">{matchError}</p><Button onClick={loadMatch} size="small" variant="secondary">Retry match</Button></div>
        ) : match?.ready === false ? (
          <div className="job-match-card__empty"><p>{match.message}</p><Button icon={UserRound} to="/profile" size="small" variant="secondary">Build your profile</Button></div>
        ) : match?.matchDetails ? (
          <>
            <div className="job-match-card__score"><strong>{match.matchScore}<small>%</small></strong><span>{match.matchDetails.matchingMethod === 'gemini-embedding' ? 'Semantic match' : 'Skills-overlap estimate'}</span></div>
            <section className="job-match-card__section"><h3>Matching skills</h3>{match.matchDetails.matchingSkills.length ? <div className="job-card__skills">{match.matchDetails.matchingSkills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p>No listed skills matched yet.</p>}</section>
            <section className="job-match-card__section"><h3>Skills to develop</h3>{match.matchDetails.missingSkills.length ? <div className="job-card__skills job-card__skills--missing">{match.matchDetails.missingSkills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p>No missing listed skills identified.</p>}</section>
            <p className="job-match-card__explanation">{match.matchDetails.explanation}</p>
          </>
        ) : null}
      </Card>
    </div>
  )
}

const applicationStatuses = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected']

function ApplicationsPage({ role }) {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [busyId, setBusyId] = useState('')
  const [analyzingId, setAnalyzingId] = useState('')
  const [updatingStatusId, setUpdatingStatusId] = useState('')
  const [analysisErrors, setAnalysisErrors] = useState({})
  const [statusErrors, setStatusErrors] = useState({})
  const isCandidate = role === 'candidate'

  useEffect(() => {
    let active = true
    api.get('/applications', authConfig())
      .then(({ data }) => { if (active) setApplications(data.applications || []) })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) {
          localStorage.removeItem('hiresense_token')
          localStorage.removeItem('hiresense_user')
          navigate('/login', { replace: true, state: { from: '/applications' } })
          return
        }
        setError(requestError.response?.data?.message || 'Could not load your applications. Please try again.')
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [navigate, reloadKey])

  async function cancelApplication(application) {
    if (!window.confirm(`Cancel your application for ${application.job?.title || 'this opportunity'}?`)) return
    setBusyId(application._id)
    setError('')
    try {
      await api.delete(`/applications/${application._id}`, authConfig())
      setApplications((current) => current.filter((item) => item._id !== application._id))
      window.dispatchEvent(new Event('hiresense:applications-changed'))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not cancel this application. Please try again.')
    } finally {
      setBusyId('')
    }
  }

  async function analyzeApplication(application) {
    setAnalyzingId(application._id)
    setAnalysisErrors((current) => ({ ...current, [application._id]: '' }))
    try {
      const { data } = await api.post(`/applications/${application._id}/analyze`, {}, authConfig())
      setApplications((current) => current.map((item) => (
        item._id === application._id ? { ...item, aiAnalysis: data.analysis } : item
      )))
    } catch (requestError) {
      setAnalysisErrors((current) => ({
        ...current,
        [application._id]: requestError.response?.data?.message || 'AI analysis is unavailable right now.'
      }))
    } finally {
      setAnalyzingId('')
    }
  }

  async function updateApplicationStatus(applicationId, status) {
    setUpdatingStatusId(applicationId)
    setStatusErrors((current) => ({ ...current, [applicationId]: '' }))
    try {
      const { data } = await api.patch(`/applications/${applicationId}/status`, { status }, authConfig())
      setApplications((current) => current.map((item) => (
        item._id === applicationId ? { ...item, status: data.application.status } : item
      )))
    } catch (requestError) {
      setStatusErrors((current) => ({
        ...current,
        [applicationId]: requestError.response?.data?.message || 'Could not update this application status.'
      }))
    } finally {
      setUpdatingStatusId('')
    }
  }

  return (
    <div className="application-list">
      {error && <div className="workspace-message workspace-message--error" role="alert">{error}<button onClick={() => { setError(''); setIsLoading(true); setReloadKey((value) => value + 1) }} type="button">Try again</button></div>}
      {isLoading ? <Card className="workspace-card-message"><Loading label="Loading your applications" /></Card> : error ? null : (
        applications.length ? applications.map((application) => {
          const job = application.job
          const company = job?.recruiter?.recruiterProfile?.company || job?.recruiter?.name || 'Hiring team'
          const analysis = application.aiAnalysis
          const score = analysis?.matchScore ?? application.matchScore
          return (
            <Card className="application-card" key={application._id}>
              <div className="application-card__main">
                <div className="application-card__icon"><BriefcaseBusiness aria-hidden="true" size={19} /></div>
                <div className="application-card__details">
                  <div className="application-card__heading">
                    <div><h2>{job?.title || 'Opportunity no longer available'}</h2><p><Building2 aria-hidden="true" size={14} />{company}</p></div>
                    <span className={`application-status application-status--${application.status?.toLowerCase()}`}>{application.status}</span>
                  </div>
                  <div className="application-card__meta">
                    <span><CalendarDays aria-hidden="true" size={14} />Applied {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'date unavailable'}</span>
                    {Number.isFinite(score) && <span><Target aria-hidden="true" size={14} />{score}% match</span>}
                    {!isCandidate && application.candidate?.name && <span>Applicant: {application.candidate.name}</span>}
                  </div>
                  {(analysis?.matchingMethod || application.matchDetails?.explanation) && <p className="application-card__match-method">{analysis?.matchingMethod === 'gemini-embedding' ? 'Gemini semantic match' : analysis?.matchingMethod === 'skill-overlap' ? 'Listed skill-overlap estimate' : application.matchDetails.explanation}</p>}
                  {!isCandidate && (
                    <label className="application-status-control">
                      <span>Update status</span>
                      <select disabled={updatingStatusId === application._id} onChange={(event) => updateApplicationStatus(application._id, event.target.value)} value={application.status}>
                        {applicationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                  )}
                  {statusErrors[application._id] && <p className="workspace-message workspace-message--error" role="alert">{statusErrors[application._id]}</p>}
                  {analysis && (
                    <section className="application-analysis" aria-label="AI job match analysis">
                      <div className="application-analysis__title"><Sparkles aria-hidden="true" size={15} /><strong>AI match analysis</strong><span>{analysis.matchScore}% match</span></div>
                      {analysis.strengths?.length > 0 && <div><h3>Strengths</h3><ul>{analysis.strengths.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div>}
                      {analysis.missingSkills?.length > 0 && <div><h3>Skills to build</h3><div className="job-card__skills">{analysis.missingSkills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>}
                      {analysis.generatedAt && <small>Updated {new Date(analysis.generatedAt).toLocaleDateString()}</small>}
                    </section>
                  )}
                  {isCandidate && analysisErrors[application._id] && <p className="workspace-message workspace-message--error" role="alert">{analysisErrors[application._id]}</p>}
                  {isCandidate && <div className="application-card__actions">
                    <Button disabled={analyzingId === application._id} icon={Sparkles} onClick={() => analyzeApplication(application)} size="small" variant="secondary">{analyzingId === application._id ? 'Analyzing…' : analysis ? 'Refresh AI analysis' : 'AI job match'}</Button>
                    {application.canCancel && <Button disabled={busyId === application._id} icon={Trash2} onClick={() => cancelApplication(application)} size="small" variant="secondary">{busyId === application._id ? 'Cancelling…' : 'Cancel application'}</Button>}
                  </div>}
                </div>
              </div>
            </Card>
          )
        }) : <Card className="workspace-card-message application-empty"><span className="empty-state__icon"><BriefcaseBusiness aria-hidden="true" size={22} /></span><h2>{isCandidate ? 'No applications yet' : 'No applications received yet'}</h2><p>{isCandidate ? 'When you apply to an opportunity, it will appear here with its current status and match details.' : 'Candidate applications for your published opportunities will appear here.'}</p>{isCandidate && <Button icon={ArrowRight} to="/jobs" size="small">Explore opportunities</Button>}</Card>
      )}
    </div>
  )
}

function ResumeAnalyzer() {
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    api.get('/profile', authConfig())
      .then(({ data }) => {
        if (!active) return
        const savedResume = data.profile?.candidateProfile?.resume
        setResume(savedResume || null)
        setAnalysis(savedResume?.analysis || null)
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) {
          localStorage.removeItem('hiresense_token')
          localStorage.removeItem('hiresense_user')
          navigate('/login', { replace: true, state: { from: '/resume' } })
          return
        }
        setError(requestError.response?.data?.message || 'Could not load your saved resume analysis.')
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [navigate, reloadKey])

  async function uploadResume(event) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    setError('')
    setUploadMessage('')
    if (!/\.pdf$/i.test(file.name) || (file.type && !['application/pdf', 'application/octet-stream'].includes(file.type))) {
      setError('Choose a valid PDF resume.')
      return
    }
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError(file.size === 0 ? 'The selected file is empty.' : 'PDF files must be 5 MB or smaller.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const { data } = await api.post('/profile/resume', formData, authConfig())
      setResume(data.resume)
      setAnalysis(data.analysis)
      setUploadMessage('Resume analyzed and saved to your profile.')
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        navigate('/login', { replace: true, state: { from: '/resume' } })
        return
      }
      setError(requestError.response?.data?.message || 'Resume analysis failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const items = (values) => (Array.isArray(values) ? values : [])

  if (isLoading) return <Card className="workspace-card-message"><Loading label="Loading your saved resume analysis" /></Card>
  if (error && !analysis) {
    return <Card className="workspace-card-message"><p className="workspace-message workspace-message--error" role="alert">{error}</p><Button onClick={() => { setError(''); setIsLoading(true); setReloadKey((value) => value + 1) }}>Try again</Button></Card>
  }

  return (
    <div className="resume-analyzer">
      <Card className="resume-upload-card">
        <div className="resume-upload-card__copy">
          <span className="resume-upload-card__icon"><FileText aria-hidden="true" size={21} /></span>
          <div><h2>{analysis ? 'Analyze an updated resume' : 'Start with your resume'}</h2><p>Upload a text-based PDF (up to 5 MB and 30 pages). Gemini analyzes the extracted text securely through the backend.</p></div>
        </div>
        <label className={`button button--primary button--small resume-upload-button${isUploading ? ' is-disabled' : ''}`}>
          <Upload aria-hidden="true" size={16} />{isUploading ? 'Analyzing resume…' : 'Upload PDF'}
          <input accept=".pdf,application/pdf" disabled={isUploading} onChange={uploadResume} type="file" />
        </label>
        {isUploading && <Loading label="Extracting text and analyzing with Gemini" />}
        {error && <p className="workspace-message workspace-message--error" role="alert">{error}</p>}
        {uploadMessage && <p className="workspace-message workspace-message--success" role="status">{uploadMessage}</p>}
      </Card>

      {!analysis ? (
        <Card className="workspace-card-message resume-empty">
          <span className="empty-state__icon"><Sparkles aria-hidden="true" size={22} /></span>
          <h2>No resume analysis yet</h2>
          <p>Upload a text-based PDF to get a score, extracted career history, ATS keyword ideas, and specific ways to improve. Scanned/image-only PDFs cannot be analyzed.</p>
        </Card>
      ) : (
        <>
          <Card className="resume-score-card">
            <div><span className="eyebrow">GEMINI RESUME SCORE</span><h2>{analysis.score}<small>/100</small></h2><p>Review the detailed signals below to understand this score and strengthen your resume.</p></div>
            <div className="dashboard-progress" aria-label={`Resume score ${analysis.score} out of 100`}><span style={{ width: `${analysis.score}%` }} /></div>
            <div className="resume-score-card__meta"><span>{resume?.uploadedAt ? `Analyzed ${new Date(resume.uploadedAt).toLocaleDateString()}` : 'Saved analysis'}</span>{resume?.url && <a href={`${API_BASE_URL.replace(/\/api\/?$/, '')}${resume.url}`} rel="noreferrer" target="_blank">View uploaded PDF <ArrowUpRight aria-hidden="true" size={14} /></a>}</div>
          </Card>

          <div className="resume-report-grid">
            <Card className="resume-report-card resume-report-card--wide">
              <div className="resume-report-card__heading"><h2>Skills</h2><span>{items(analysis.skills).length}</span></div>
              {items(analysis.skills).length ? <div className="job-card__skills">{items(analysis.skills).map((skill) => <span key={skill}>{skill}</span>)}</div> : <p className="resume-report-card__empty">No skills were clearly identified in this resume.</p>}
            </Card>
            <Card className="resume-report-card">
              <div className="resume-report-card__heading"><h2>Strengths</h2><Check aria-hidden="true" size={17} /></div>
              {items(analysis.strengths).length ? <ul>{items(analysis.strengths).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : <p className="resume-report-card__empty">No strengths were identified.</p>}
            </Card>
            <Card className="resume-report-card">
              <div className="resume-report-card__heading"><h2>Weaknesses</h2><Target aria-hidden="true" size={17} /></div>
              {items(analysis.weaknesses).length ? <ul>{items(analysis.weaknesses).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : <p className="resume-report-card__empty">No significant weaknesses were identified.</p>}
            </Card>
            <Card className="resume-report-card">
              <div className="resume-report-card__heading"><h2>Experience</h2><span>{items(analysis.experience).length}</span></div>
              {items(analysis.experience).length ? <div className="resume-report-timeline">{items(analysis.experience).map((item, index) => <article key={`${index}-${item.position || item.company}`}><strong>{item.position || 'Role not specified'}</strong><small>{[item.company, item.duration].filter(Boolean).join(' · ')}</small>{item.description && <p>{item.description}</p>}</article>)}</div> : <p className="resume-report-card__empty">No work experience was clearly identified.</p>}
            </Card>
            <Card className="resume-report-card">
              <div className="resume-report-card__heading"><h2>Projects</h2><span>{items(analysis.projects).length}</span></div>
              {items(analysis.projects).length ? <div className="resume-report-timeline">{items(analysis.projects).map((item, index) => <article key={`${index}-${item.title}`}><strong>{item.title || 'Project'}</strong>{item.description && <p>{item.description}</p>}{items(item.technologies).length > 0 && <div className="job-card__skills">{item.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>}</article>)}</div> : <p className="resume-report-card__empty">No projects were clearly identified.</p>}
            </Card>
            <Card className="resume-report-card">
              <div className="resume-report-card__heading"><h2>Education</h2><span>{items(analysis.education).length}</span></div>
              {items(analysis.education).length ? <div className="resume-report-timeline">{items(analysis.education).map((item, index) => <article key={`${index}-${item.institution}`}><strong>{item.degree || 'Education'}</strong><small>{[item.field, item.institution, item.year].filter(Boolean).join(' · ')}</small></article>)}</div> : <p className="resume-report-card__empty">No education details were clearly identified.</p>}
            </Card>
            <Card className="resume-report-card">
              <div className="resume-report-card__heading"><h2>Skills to consider</h2><Sparkles aria-hidden="true" size={17} /></div>
              {items(analysis.missingSkills).length ? <ul>{items(analysis.missingSkills).map((item, index) => <li key={`${index}-${item.skill}`}><strong>{item.skill}</strong>{item.reason && <p>{item.reason}</p>}</li>)}</ul> : <p className="resume-report-card__empty">No additional role-related skills were suggested.</p>}
            </Card>
            <Card className="resume-report-card">
              <div className="resume-report-card__heading"><h2>ATS keyword suggestions</h2><Search aria-hidden="true" size={17} /></div>
              {items(analysis.keywordSuggestions).length ? <ul>{items(analysis.keywordSuggestions).map((item, index) => <li key={`${index}-${item.keyword}`}><strong>{item.keyword}</strong>{item.reason && <p>{item.reason}</p>}</li>)}</ul> : <p className="resume-report-card__empty">No keyword suggestions yet.</p>}
              {items(analysis.keywordSuggestions).length > 0 && <small className="resume-report-card__note">Only include keywords that accurately describe your experience.</small>}
            </Card>
            <Card className="resume-report-card resume-report-card--wide">
              <div className="resume-report-card__heading"><h2>Improvement suggestions</h2><WandSparkles aria-hidden="true" size={17} /></div>
              {items(analysis.improvementSuggestions).length ? <div className="resume-report-timeline">{items(analysis.improvementSuggestions).map((item, index) => <article key={`${index}-${item.section}`}><strong>{item.section || 'Resume'}</strong><p>{item.suggestion}</p></article>)}</div> : items(analysis.improvements).length ? <ul>{items(analysis.improvements).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : <p className="resume-report-card__empty">No improvement suggestions are available.</p>}
            </Card>
          </div>
          <p className="resume-analyzer__disclaimer">AI suggestions are guidance, not verified facts. Review every extracted detail and only use suggestions that are accurate for you.</p>
        </>
      )}
    </div>
  )
}

function DashboardOverview() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [error, setError] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    api.get('/dashboard', authConfig())
      .then(({ data }) => {
        if (active) setDashboard(data.dashboard)
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) {
          localStorage.removeItem('hiresense_token')
          localStorage.removeItem('hiresense_user')
          navigate('/login', { replace: true, state: { from: '/dashboard' } })
          return
        }
        setError(requestError.response?.data?.message || 'Could not load your dashboard. Please try again.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [navigate, reloadKey])

  async function uploadResume(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!/\.pdf$/i.test(file.name)) {
      setResumeError('Choose a PDF resume.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('Resume files must be 5 MB or smaller.')
      return
    }

    setResumeError('')
    setIsUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      await api.post('/profile/resume', formData, authConfig())
      setIsLoading(true)
      setReloadKey((value) => value + 1)
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        localStorage.removeItem('hiresense_user')
        navigate('/login', { replace: true, state: { from: '/dashboard' } })
        return
      }
      setResumeError(requestError.response?.data?.message || 'Resume upload failed. Please try again.')
    } finally {
      setIsUploadingResume(false)
    }
  }

  function retryDashboard() {
    setDashboard(null)
    setError('')
    setIsLoading(true)
    setReloadKey((value) => value + 1)
  }

  if (isLoading) return <Card className="workspace-card-message"><Loading label="Loading your dashboard" /></Card>
  if (error) {
    return (
      <Card className="workspace-card-message">
        <p className="workspace-message workspace-message--error" role="alert">{error}</p>
        <Button onClick={retryDashboard}>Try again</Button>
      </Card>
    )
  }
  if (!dashboard) return null

  const completion = dashboard.profile?.completion || { percentage: 0, missingSections: [] }
  const statusCounts = dashboard.applications?.statusCounts || {}
  const suggestions = dashboard.insights?.careerSuggestions || []
  return (
    <div className="workspace-overview">
      <Card className="welcome-card">
        <div className="welcome-card__icon"><Sparkles size={21} /></div>
        <div>
          <span className="eyebrow">YOUR HIRING SEARCH</span>
          <h2>{completion.percentage === 100 ? `You're ready, ${dashboard.profile?.name || 'there'}.` : `Make this search yours, ${dashboard.profile?.name?.split(' ')[0] || 'there'}.`}</h2>
          <p>Your profile is {completion.percentage}% complete. Keep your career details current to get more relevant job matches.</p>
          <Button icon={ArrowRight} to="/profile" size="small">{completion.percentage === 100 ? 'Review your profile' : 'Set up your profile'}</Button>
        </div>
        <div className="welcome-card__art" aria-hidden="true"><span /><span /><span /></div>
      </Card>

      <div className="dashboard-stats">
        <Card className="dashboard-stat">
          <span className="eyebrow">PROFILE COMPLETION</span>
          <strong>{completion.percentage}%</strong>
          <div className="dashboard-progress" aria-label={`Profile ${completion.percentage}% complete`}><span style={{ width: `${completion.percentage}%` }} /></div>
          <small>{completion.missingSections?.length ? `Next: ${completion.missingSections[0]}` : 'All profile sections complete'}</small>
          <Link to="/profile">Edit profile <ArrowUpRight size={14} /></Link>
        </Card>
        <Card className="dashboard-stat">
          <span className="eyebrow">RESUME</span>
          <strong>{dashboard.resume?.status === 'uploaded' ? (dashboard.resume.score == null ? 'Uploaded' : `${dashboard.resume.score}/100`) : 'Not added'}</strong>
          <small>{dashboard.resume?.status === 'uploaded'
            ? `${dashboard.resume.analysisProvider === 'gemini' ? 'Gemini analysis' : dashboard.resume.analysisProvider === 'heuristic' ? 'Basic analysis' : 'Resume uploaded'} · ${dashboard.resume.uploadedAt ? new Date(dashboard.resume.uploadedAt).toLocaleDateString() : 'recently'}`
            : 'Upload a resume to strengthen your matches.'}</small>
          <label className="dashboard-resume__upload">
            {isUploadingResume ? 'Uploading resume…' : dashboard.resume?.status === 'uploaded' ? 'Replace resume' : 'Upload resume'}
            <input accept=".pdf,application/pdf" disabled={isUploadingResume} onChange={uploadResume} type="file" />
          </label>
          {resumeError && <span className="workspace-message workspace-message--error" role="alert">{resumeError}</span>}
        </Card>
        <Card className="dashboard-stat">
          <span className="eyebrow">APPLICATIONS</span>
          <strong>{dashboard.applications?.total || 0}</strong>
          <small>Applications submitted</small>
          <div className="dashboard-statuses">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status}><i className={`dashboard-status-dot dashboard-status-dot--${status.toLowerCase()}`} />{status} <b>{count}</b></span>
            ))}
          </div>
        </Card>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Recommended opportunities</h2></div><Link to="/jobs">Explore all jobs <ArrowUpRight size={14} /></Link></div>
        {dashboard.jobs?.matching?.message && <p className={`workspace-message ${dashboard.jobs.matching.status === 'degraded' ? 'workspace-message--error' : ''}`} role="status">{dashboard.jobs.matching.message}</p>}
        {dashboard.jobs?.recommended?.length ? (
          <div className="dashboard-job-list">
            {dashboard.jobs.recommended.map((recommendation) => (
              <Card className="dashboard-job" key={recommendation.job.id}>
                <div className="dashboard-job__copy">
                  <span className="eyebrow">{recommendation.job.company} · {recommendation.job.location}</span>
                  <h3><Link to={`/jobs/${recommendation.job.id}`}>{recommendation.job.title}</Link></h3>
                  <p>{recommendation.job.workType} · {recommendation.job.employmentType} · {recommendation.job.experience}</p>
                  {recommendation.matchingSkills?.length > 0 && <small>Skills match: {recommendation.matchingSkills.join(', ')}</small>}
                </div>
                <div className="dashboard-job__match"><strong>{recommendation.matchPercentage}%</strong><span>{recommendation.matchingMethod === 'gemini-embedding' ? 'AI match' : 'Skills match'}</span></div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="workspace-card-message">
            <h2>{dashboard.jobs?.matching?.status === 'needs_profile' ? 'Add profile details to see matches' : 'No recommended jobs yet'}</h2>
            <p>{dashboard.jobs?.matching?.status === 'needs_profile' ? 'Add your skills or upload a resume and we’ll match your experience to published roles.' : 'When employers publish opportunities, relevant matches will appear here.'}</p>
            <Button icon={dashboard.jobs?.matching?.status === 'needs_profile' ? UserRound : Search} size="small" to={dashboard.jobs?.matching?.status === 'needs_profile' ? '/profile' : '/jobs'}>{dashboard.jobs?.matching?.status === 'needs_profile' ? 'Complete your profile' : 'Browse opportunities'}</Button>
          </Card>
        )}
      </div>

      <div className="dashboard-insights-grid">
        <Card className="dashboard-insight">
          <div className="dashboard-section__heading"><div><span className="eyebrow">GROW YOUR FIT</span><h2>Top missing skills</h2></div><Target size={19} /></div>
          {dashboard.insights?.topMissingSkills?.length ? (
            <ul className="dashboard-skill-list">
              {dashboard.insights.topMissingSkills.map((item) => (
                <li key={item.skill}><span><strong>{item.skill}</strong>{item.reason && <small>{item.reason}</small>}</span>{item.jobCount != null && <small>In {item.jobCount} jobs</small>}</li>
              ))}
            </ul>
          ) : <p className="dashboard-empty-note">{dashboard.insights?.status === 'ready' ? 'Your current skills cover the analyzed job requirements.' : 'Skill gaps will appear when we can compare your profile to published roles.'}</p>}
        </Card>
        <Card className="dashboard-insight">
          <div className="dashboard-section__heading"><div><span className="eyebrow">GEMINI CAREER COACH</span><h2>Career suggestions</h2></div><Sparkles size={19} /></div>
          {dashboard.insights?.status !== 'ready' && <p className={dashboard.insights?.status === 'error' || dashboard.insights?.status === 'unavailable' ? 'workspace-message workspace-message--error' : 'dashboard-empty-note'} role={dashboard.insights?.status === 'error' ? 'alert' : 'status'}>{dashboard.insights?.message || 'Personalized suggestions will appear here.'}</p>}
          {dashboard.insights?.summary && <p className="dashboard-insight__summary">{dashboard.insights.summary}</p>}
          {suggestions.length > 0 ? (
            <ol className="dashboard-suggestions">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.title}-${index}`}><strong>{suggestion.title}</strong><p>{suggestion.reason}</p>{suggestion.nextStep && <small>Next step: {suggestion.nextStep}</small>}</li>
              ))}
            </ol>
          ) : dashboard.insights?.status === 'ready' ? <p className="dashboard-empty-note">Add more profile or resume details to get tailored suggestions.</p> : null}
        </Card>
      </div>

      <Card className="dashboard-applications">
        <div className="dashboard-section__heading"><div><span className="eyebrow">YOUR RECENT ACTIVITY</span><h2>Recent applications</h2></div><Link to="/applications">View all <ArrowUpRight size={14} /></Link></div>
        {dashboard.applications?.recent?.length ? (
          <ul className="dashboard-application-list">
            {dashboard.applications.recent.map((application) => (
              <li key={application.id}>
                <span><strong>{application.job?.title || 'Opportunity no longer available'}</strong><small>{application.job?.location || '—'} · {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : ''}</small></span>
                <span className={`application-status application-status--${application.status.toLowerCase()}`}>{application.status}</span>
              </li>
            ))}
          </ul>
        ) : <p className="dashboard-empty-note">You haven’t applied to any roles yet. Explore opportunities that fit your goals.</p>}
      </Card>
    </div>
  )
}

export function WorkspacePage({ section }) {
  const { id } = useParams()
  const outletContext = useOutletContext()
  const user = outletContext?.user
  const page = sections[section]
  const Icon = page.icon

  if (section === 'profile') {
    return (
      <div className="workspace-page">
        <div className="workspace-page__heading"><div><div className="eyebrow"><span className="eyebrow__line" /> {page.eyebrow}</div><h1>{page.title}</h1><p>{page.description}</p></div></div>
        <ProfileSetup />
      </div>
    )
  }

  if (section === 'jobs') {
    return (
      <div className="workspace-page">
        <div className="workspace-page__heading"><div><div className="eyebrow"><span className="eyebrow__line" /> {page.eyebrow}</div><h1>{page.title}</h1><p>{page.description}</p></div><Button icon={UserRound} to="/profile" size="small">Build your profile</Button></div>
        <JobListings />
      </div>
    )
  }

  if (section === 'job-detail') {
    return (
      <div className="workspace-page">
        <div className="workspace-page__heading"><div><div className="eyebrow"><span className="eyebrow__line" /> {page.eyebrow}</div><h1>{page.title}</h1><p>{page.description}</p></div></div>
        <JobDetail id={id} key={id} />
      </div>
    )
  }

  return (
    <div className="workspace-page">
      <div className="workspace-page__heading">
        <div><div className="eyebrow"><span className="eyebrow__line" /> {page.eyebrow}</div><h1>{page.title}</h1><p>{page.description}</p></div>
        {section === 'jobs' && <Button icon={ArrowUpRight} to="/register" size="small">Create your profile</Button>}
      </div>
      {section === 'dashboard' ? <DashboardOverview /> : section === 'applications' ? <ApplicationsPage role={user?.role} /> : section === 'resume' ? <ResumeAnalyzer /> : (
        <Card className="empty-state">
          <span className="empty-state__icon"><Icon aria-hidden="true" size={22} strokeWidth={1.7} /></span>
          <span className="eyebrow">{section === 'job-detail' && id ? `OPPORTUNITY ${id}` : 'YOUR SPACE, YOUR PACE'}</span>
          <h2>{section === 'jobs' ? 'The right opportunity starts with your priorities.' : 'A thoughtful next step starts here.'}</h2>
          <p>{section === 'jobs' ? 'Create your profile to shape a search around the kind of work and workplace you want.' : 'This part of your HireSense workspace is ready to take shape as you build your search.'}</p>
          <Button icon={section === 'jobs' ? ArrowRight : CircleHelp} to={section === 'jobs' ? '/register' : '/dashboard'} size="small">{section === 'jobs' ? 'Get started' : 'Back to overview'}</Button>
          {section === 'jobs' && <div className="empty-state__details"><span><Check size={14} /> Your priorities matter</span><span><Check size={14} /> Clear fit insights</span><span><Check size={14} /> A search that stays yours</span></div>}
        </Card>
      )}
      <div className="workspace-page__footnote"><MapPin size={14} /> Made for the next step, wherever it takes you.</div>
    </div>
  )
}