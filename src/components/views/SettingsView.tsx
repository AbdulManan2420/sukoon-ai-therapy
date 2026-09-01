import { Bell, Database, Languages, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function SettingsView() {
  const { user, logout } = useAuth()
  return <div className="page settings-page"><header className="page-heading"><div><p className="eyebrow">Your preferences</p><h1>Settings & privacy.</h1><p>Your wellbeing space should always feel like yours.</p></div></header>
    <section className="settings-card"><div className="settings-profile">{user?.photoURL ? <img src={user.photoURL} alt="" /> : <span>{(user?.displayName || 'S')[0]}</span>}<div><h3>{user?.displayName || 'Sukoon member'}</h3><p>{user?.email}</p></div></div></section>
    <section className="settings-card"><h3>Experience</h3><div className="setting-row"><span><Languages /></span><div><strong>Conversation language</strong><small>English, Urdu & Roman Urdu supported</small></div><select defaultValue="auto"><option value="auto">Auto-detect</option><option>English</option><option>Urdu</option></select></div><div className="setting-row"><span><Bell /></span><div><strong>Weekly reflection</strong><small>A gentle reminder every Sunday</small></div><label className="toggle"><input type="checkbox" defaultChecked /><i /></label></div></section>
    <section className="settings-card"><h3>Privacy & data</h3><div className="setting-row"><span><LockKeyhole /></span><div><strong>Private account</strong><small>Your records are protected by Firebase account access</small></div><ShieldCheck className="green" /></div><div className="setting-row"><span><Database /></span><div><strong>Your stored data</strong><small>Sessions and moods are stored only under your user ID</small></div></div></section>
    <button className="logout-button" onClick={logout}><LogOut size={18} /> Sign out of Sukoon</button><p className="settings-disclaimer">Sukoon is a wellbeing companion and not a medical service. It cannot diagnose conditions or replace a qualified mental health professional.</p>
  </div>
}
