/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import type { MoodEntry, MoodKey, TherapySession } from '../types'

interface DataValue {
  moods: MoodEntry[]
  sessions: TherapySession[]
  loading: boolean
  addMood: (mood: MoodKey, intensity?: number, note?: string) => Promise<void>
  saveSession: (session: TherapySession) => Promise<void>
}

const DataContext = createContext<DataValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !db) return
    const moodQuery = query(collection(db, 'users', user.uid, 'moods'), orderBy('createdAt', 'desc'))
    const sessionQuery = query(collection(db, 'users', user.uid, 'sessions'), orderBy('startedAt', 'desc'))
    const stopMoods = onSnapshot(moodQuery, (snapshot) => {
      setMoods(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as MoodEntry)))
      setLoading(false)
    })
    const stopSessions = onSnapshot(sessionQuery, (snapshot) => {
      setSessions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as TherapySession)))
    })
    return () => { stopMoods(); stopSessions() }
  }, [user])

  const value: DataValue = {
    moods,
    sessions,
    loading,
    addMood: async (mood, intensity = 3, note = '') => {
      if (!user || !db) return
      await addDoc(collection(db, 'users', user.uid, 'moods'), {
        mood, intensity, note, createdAt: new Date().toISOString(),
      })
    },
    saveSession: async (session) => {
      if (!user || !db) return
      await setDoc(doc(db, 'users', user.uid, 'sessions', session.id), session)
    },
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside DataProvider')
  return context
}
