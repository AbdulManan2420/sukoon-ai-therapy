import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Heart, LockKeyhole, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  if (message.includes('invalid-credential')) return 'Email or password is incorrect.'
  if (message.includes('email-already-in-use')) return 'An account with this email already exists.'
  if (message.includes('weak-password')) return 'Use at least 6 characters for your password.'
  if (message.includes('popup-closed')) return 'Google sign-in was closed before completion.'
  return 'We could not complete that. Please try again.'
}

export default function AuthScreen() {
  const { login, signup, loginWithGoogle, resetPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true)
    try {
      if (mode === 'signup') await signup(name.trim(), email.trim(), password)
      else await login(email.trim(), password)
    } catch (nextError) { setError(friendlyError(nextError)) } finally { setBusy(false) }
  }

  async function google() {
    setError(''); setBusy(true)
    try { await loginWithGoogle() } catch (nextError) { setError(friendlyError(nextError)) } finally { setBusy(false) }
  }

  async function forgot() {
    if (!email) { setError('Enter your email first, then choose “Forgot password?”.'); return }
    setError('')
    try { await resetPassword(email); setNotice('Password reset email sent. Check your inbox.') }
    catch (nextError) { setError(friendlyError(nextError)) }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-brand"><span className="brand-mark">S</span><span>Sukoon</span></div>
        <div className="story-copy">
          <p className="eyebrow light">A softer place to land</p>
          <h1>You don’t have to carry it all alone.</h1>
          <p>Speak freely, reflect gently, and understand your emotional patterns—at your pace, in your language.</p>
        </div>
        <div className="privacy-promise"><LockKeyhole size={18} /><span><strong>Your space stays yours.</strong> Private by design and always in your control.</span></div>
        <div className="orb orb-one" /><div className="orb orb-two" />
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand"><span className="brand-mark">S</span><span>Sukoon</span></div>
          <p className="eyebrow">Welcome to your space</p>
          <h2>{mode === 'login' ? 'Good to have you back.' : 'Begin with one small step.'}</h2>
          <p className="auth-subtitle">{mode === 'login' ? 'Take a breath. We can continue where you left off.' : 'Create a private space for your thoughts and wellbeing.'}</p>

          <button className="google-button" type="button" onClick={google} disabled={busy}>
            <span className="google-g">G</span> Continue with Google
          </button>
          <div className="divider"><span>or continue with email</span></div>

          <form onSubmit={submit}>
            {mode === 'signup' && <label>What should we call you?<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoComplete="name" /></label>}
            <label>Email address<div className="input-with-icon"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></div></label>
            <label>Password<div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button className="peek" type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Show password">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {mode === 'login' && <button className="forgot" type="button" onClick={forgot}>Forgot password?</button>}
            {error && <p className="form-message error">{error}</p>}
            {notice && <p className="form-message success">{notice}</p>}
            <button className="primary-button" disabled={busy}>{busy ? 'Just a moment…' : mode === 'login' ? 'Sign in to Sukoon' : 'Create my private space'}</button>
          </form>

          <p className="switch-mode">{mode === 'login' ? 'New to Sukoon?' : 'Already have a space?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setNotice('') }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          <p className="terms"><Heart size={12} /> Sukoon supports wellbeing, but does not replace professional medical care.</p>
        </div>
      </section>
    </main>
  )
}
