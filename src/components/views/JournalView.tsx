import { ArrowRight, BookOpen, CalendarDays, Clock3, MessageCircleHeart } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useData } from '../../contexts/DataContext'
import type { ViewName } from '../MainApp'

export default function JournalView({ navigate }: { navigate: (view: ViewName) => void }) {
  const { sessions } = useData()
  return <div className="page">
    <header className="page-heading"><div><p className="eyebrow">Your private journey</p><h1>Moments you made space for.</h1><p>A gentle record of your sessions and reflections.</p></div></header>
    {sessions.length === 0 ? <div className="empty-state"><span><BookOpen /></span><h2>Your journey begins when you’re ready.</h2><p>Completed sessions will appear here with a private summary you can revisit anytime.</p><button className="primary-button compact" onClick={() => navigate('session')}>Start your first session <ArrowRight size={18} /></button></div> : <div className="session-list">{sessions.map((session) => <article key={session.id} className="session-record"><div className="record-date"><strong>{format(parseISO(session.startedAt), 'dd')}</strong><span>{format(parseISO(session.startedAt), 'MMM')}</span></div><div className="record-main"><p className="eyebrow">Private session</p><h3>{session.title}</h3><p>{session.summary}</p><div><span><Clock3 size={14} /> {session.durationMinutes || 1} min</span><span><MessageCircleHeart size={14} /> {session.messages.length} messages</span><span><CalendarDays size={14} /> {format(parseISO(session.startedAt), 'h:mm a')}</span></div></div><div className="mood-shift"><small>Mood shift</small><strong>{session.moodBefore} → {session.moodAfter || '—'}</strong></div></article>)}</div>}
  </div>
}
