import { ArrowRight, BarChart3, Feather, MessageCircleHeart, TrendingUp } from 'lucide-react'
import { eachDayOfInterval, format, isSameDay, parseISO, startOfWeek, subDays } from 'date-fns'
import { useData } from '../../contexts/DataContext'
import { moodScore } from '../../lib/wellbeing'
import type { ViewName } from '../MainApp'

export default function ReportView({ navigate }: { navigate: (view: ViewName) => void }) {
  const { moods, sessions } = useData()
  const now = new Date(); const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const recentMoods = moods.filter((entry) => parseISO(entry.createdAt) >= weekStart)
  const recentSessions = sessions.filter((entry) => parseISO(entry.startedAt) >= weekStart)
  const days = eachDayOfInterval({ start: subDays(now, 6), end: now })
  const scores = days.map((day) => {
    const entry = moods.find((item) => isSameDay(parseISO(item.createdAt), day))
    return { day: format(day, 'EEE'), score: entry ? moodScore[entry.mood] : 0, mood: entry?.mood }
  })
  const checkedScores = scores.filter((item) => item.score > 0)
  const average = checkedScores.length ? checkedScores.reduce((sum, item) => sum + item.score, 0) / checkedScores.length : 0
  const maxMood = recentMoods.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.mood]: (acc[item.mood] || 0) + 1 }), {})
  const commonMood = Object.entries(maxMood).sort((a, b) => b[1] - a[1])[0]?.[0]

  return <div className="page report-page">
    <header className="page-heading"><div><p className="eyebrow">{format(weekStart, 'MMM d')} — {format(now, 'MMM d, yyyy')}</p><h1>Your week, held gently.</h1><p>Patterns are clues, not labels. Here is what your check-ins have been showing.</p></div><div className="privacy-badge"><BarChart3 size={17} /> Weekly wellbeing report</div></header>
    <div className="report-top">
      <section className="report-chart-card"><div className="section-title"><div><p className="eyebrow">Emotional rhythm</p><h3>Your last seven days</h3></div><span className="trend-pill"><TrendingUp size={14} /> {average >= 3 ? 'Steady' : checkedScores.length ? 'Tender week' : 'Awaiting check-ins'}</span></div><div className="mood-chart">{scores.map((item) => <div className="chart-column" key={item.day}><div className="bar-track"><div className={item.score ? 'bar filled' : 'bar'} style={{ height: `${item.score ? item.score * 18 : 8}%` }}><span>{item.mood?.slice(0, 1).toUpperCase()}</span></div></div><small>{item.day}</small></div>)}</div><p className="chart-caption">Your entries stay private and are used only to create your personal reflections.</p></section>
      <section className="week-summary"><p className="eyebrow light">A note for you</p><Feather /><h2>{recentMoods.length ? `You most often felt ${commonMood}.` : 'Showing up starts small.'}</h2><p>{recentMoods.length ? 'You kept noticing what was happening inside, even when it was not easy. That awareness is a quiet form of strength.' : 'Try one honest mood check-in today. A few seconds is enough to begin seeing your rhythm.'}</p></section>
    </div>
    <div className="report-stats"><article><span><BarChart3 /></span><div><strong>{recentMoods.length}</strong><small>mood check-ins</small></div></article><article><span><MessageCircleHeart /></span><div><strong>{recentSessions.length}</strong><small>support sessions</small></div></article><article><span><TrendingUp /></span><div><strong>{checkedScores.length}/7</strong><small>days noticed</small></div></article></div>
    <section className="insight-card"><div><p className="eyebrow">A gentle next step</p><h3>{recentSessions.length ? 'Carry one insight into the new week.' : 'Give your thoughts somewhere to land.'}</h3><p>{recentSessions.length ? 'Revisit your session summaries and choose one small supportive action that feels realistic—not perfect.' : 'A short conversation can help untangle what has been circling in your mind.'}</p></div><button className="primary-button compact" onClick={() => navigate(recentSessions.length ? 'journal' : 'session')}>{recentSessions.length ? 'View my journey' : 'Start a session'} <ArrowRight size={18} /></button></section>
  </div>
}
