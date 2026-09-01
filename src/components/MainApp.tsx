import { useState } from 'react'
import { BarChart3, BookHeart, Home, LogOut, Menu, MessageCircleHeart, Settings, Sparkles, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import HomeView from './views/HomeView'
import SessionView from './views/SessionView'
import JournalView from './views/JournalView'
import ReportView from './views/ReportView'
import SettingsView from './views/SettingsView'

export type ViewName = 'home' | 'session' | 'journal' | 'report' | 'settings'

const nav = [
  { id: 'home' as const, label: 'Today', icon: Home },
  { id: 'session' as const, label: 'Talk now', icon: MessageCircleHeart },
  { id: 'journal' as const, label: 'My journey', icon: BookHeart },
  { id: 'report' as const, label: 'Weekly report', icon: BarChart3 },
]

export default function MainApp() {
  const { user, logout } = useAuth()
  const [view, setView] = useState<ViewName>('home')
  const [menuOpen, setMenuOpen] = useState(false)

  function navigate(next: ViewName) { setView(next); setMenuOpen(false) }
  const name = user?.displayName?.split(' ')[0] || 'friend'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="side-brand"><span className="brand-mark small">S</span><span>Sukoon</span><button className="close-menu" onClick={() => setMenuOpen(false)}><X /></button></div>
        <p className="side-label">Your space</p>
        <nav>{nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon size={19} /><span>{item.label}</span></button>)}</nav>
        <div className="side-bottom">
          <button className={view === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings size={19} /><span>Settings & privacy</span></button>
          <div className="profile-chip">
            {user?.photoURL ? <img src={user.photoURL} alt="" /> : <span>{name[0].toUpperCase()}</span>}
            <div><strong>{name}</strong><small>Private space</small></div>
            <button onClick={logout} title="Sign out"><LogOut size={17} /></button>
          </div>
          <p className="crisis-note">In immediate danger? Contact your local emergency service.</p>
        </div>
      </aside>
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <main className="main-content">
        <header className="mobile-header"><button onClick={() => setMenuOpen(true)}><Menu /></button><div><Sparkles size={17} /> Sukoon</div><span /></header>
        {view === 'home' && <HomeView name={name} navigate={navigate} />}
        {view === 'session' && <SessionView navigate={navigate} />}
        {view === 'journal' && <JournalView navigate={navigate} />}
        {view === 'report' && <ReportView navigate={navigate} />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
