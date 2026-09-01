import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Clock3, Feather, ShieldCheck, Sparkles } from 'lucide-react'
import { format, isToday, parseISO } from 'date-fns'
import { useData } from '../../contexts/DataContext'
import { moods } from '../../lib/wellbeing'
import type { MoodKey } from '../../types'
import type { ViewName } from '../MainApp'

export default function HomeView({ name, navigate }: { name: string; navigate: (view: ViewName) => void }) {
  const { moods: entries, sessions, addMood } = useData()
  const [renderedAt] = useState(() => Date.now())
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null)
  const [saving, setSaving] = useState(false)
  const todayMood = entries.find((item) => isToday(parseISO(item.createdAt)))
  const recentSession = sessions.find((item) => item.status === 'completed')
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const streak = useMemo(() => new Set(entries.map((entry) => entry.createdAt.slice(0, 10))).size, [entries])

  async function checkIn() {
    if (!selectedMood) return
    setSaving(true)
    await addMood(selectedMood)
    setSaving(false)
  }

  return (
    <div className="page home-page">
      <header className="page-heading">
        <div><p className="eyebrow">{format(new Date(), 'EEEE, MMMM d')}</p><h1>{greeting}, {name}.</h1><p>How is your inner weather today?</p></div>
        <div className="privacy-badge"><ShieldCheck size={17} /> Your space is private</div>
      </header>

      <section className="hero-checkin">
        <div className="hero-copy">
          <span className="hero-icon"><Feather /></span>
          <p className="eyebrow light">A gentle check-in</p>
          <h2>{todayMood ? 'You showed up for yourself today.' : 'Pause. Breathe. Notice.'}</h2>
          <p>{todayMood ? `You felt ${todayMood.mood}. You can always check in again as the day changes.` : 'There is no right answer. Choose the feeling that comes closest right now.'}</p>
        </div>
        <div className="mood-picker">
          {moods.map((mood) => (
            <button key={mood.key} className={selectedMood === mood.key || (!selectedMood && todayMood?.mood === mood.key) ? 'selected' : ''} onClick={() => setSelectedMood(mood.key)}>
              <span style={{ '--mood-color': mood.color } as React.CSSProperties}>{mood.face}</span><small>{mood.label}</small>
            </button>
          ))}
        </div>
        {!todayMood || selectedMood ? <button className="soft-button" onClick={checkIn} disabled={!selectedMood || saving}>{saving ? 'Saving…' : 'Save my check-in'} <ArrowRight size={17} /></button> : null}
      </section>

      <div className="dashboard-grid">
        <section className="start-session-card">
          <div><span className="tiny-icon"><Sparkles size={18} /></span><p className="eyebrow">Your listening space</p><h2>What’s been on your mind?</h2><p>Talk freely in English, Urdu, or Roman Urdu. Take all the time you need.</p></div>
          <button className="primary-button compact" onClick={() => navigate('session')}>Start a session <ArrowRight size={18} /></button>
          <div className="session-meta"><span><Clock3 size={15} /> No time limit</span><span><ShieldCheck size={15} /> Saved privately</span></div>
        </section>

        <section className="week-card">
          <div className="section-title"><div><p className="eyebrow">This week</p><h3>Your gentle progress</h3></div><button onClick={() => navigate('report')}>See report <ArrowRight size={15} /></button></div>
          <div className="mini-stats"><div><strong>{entries.filter((e) => renderedAt - parseISO(e.createdAt).getTime() < 604800000).length}</strong><span>check-ins</span></div><div><strong>{sessions.filter((s) => renderedAt - parseISO(s.startedAt).getTime() < 604800000).length}</strong><span>sessions</span></div><div><strong>{streak}</strong><span>days present</span></div></div>
          <p className="reflection"><Feather size={16} /> “Small moments of awareness become meaningful change.”</p>
        </section>
      </div>

      {recentSession && <section className="recent-card"><div className="recent-date"><CalendarDays size={18} /><span>{format(parseISO(recentSession.startedAt), 'MMM d')}</span></div><div><p className="eyebrow">Continue reflecting</p><h3>{recentSession.title}</h3><p>{recentSession.summary}</p></div><button onClick={() => navigate('journal')}><ArrowRight /></button></section>}
    </div>
  )
}
