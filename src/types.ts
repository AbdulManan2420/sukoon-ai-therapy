export type MoodKey = 'calm' | 'okay' | 'low' | 'anxious' | 'heavy'

export interface MoodEntry {
  id: string
  mood: MoodKey
  intensity: number
  note?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
}

export interface TherapySession {
  id: string
  title: string
  status: 'active' | 'completed'
  moodBefore: MoodKey
  moodAfter?: MoodKey
  messages: ChatMessage[]
  summary?: string
  startedAt: string
  endedAt?: string
  durationMinutes?: number
}
