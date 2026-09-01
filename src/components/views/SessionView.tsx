import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Clock3, Headphones, HeartHandshake, Keyboard, Mic, Phone, PhoneOff, Send, ShieldAlert, Square, Volume2 } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition'
import { useData } from '../../contexts/DataContext'
import { buildSessionSummary, createSupportResponse, moods, type ConversationLanguage } from '../../lib/wellbeing'
import type { ChatMessage, MoodKey, TherapySession } from '../../types'
import type { ViewName } from '../MainApp'

type Stage = 'welcome' | 'chat' | 'closing' | 'done'
type SessionMode = 'text' | 'voice'
type RecognitionResult = { 0: { transcript: string }; isFinal: boolean }
type RecognitionEvent = Event & { resultIndex: number; results: { length: number; [index: number]: RecognitionResult } }
type RecognitionErrorEvent = Event & { error: string }
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; onstart: (() => void) | null; onresult: ((event: RecognitionEvent) => void) | null; onerror: ((event: RecognitionErrorEvent) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void }
type RecognitionConstructor = new () => Recognition

declare global { interface Window { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor } }

const languages: { value: ConversationLanguage; label: string; speechCode: string }[] = [
  { value: 'en-US', label: 'English', speechCode: 'en-US' },
  { value: 'ur-PK', label: 'اردو', speechCode: 'ur-PK' },
  { value: 'ur-roman', label: 'Roman Urdu', speechCode: 'ur-PK' },
  { value: 'hi-IN', label: 'हिन्दी', speechCode: 'hi-IN' },
  { value: 'pa-IN', label: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
]

const greetings: Record<ConversationLanguage, string> = {
  'en-US': "I'm here, and this is your space. You can begin wherever feels easiest—what has been sitting with you today?",
  'ur-PK': 'میں سن رہا ہوں۔ جہاں سے دل چاہے شروع کریں… آج کون سی بات آپ کو اندر سے پریشان کر رہی ہے؟',
  'ur-roman': 'Main yahan tumhare saath hoon. Jahan se asaan lage baat shuru karo—aaj dil par kya baat hai?',
  'hi-IN': 'मैं यहाँ आपके साथ हूँ। जहाँ से आसान लगे बात शुरू कीजिए—आज मन में क्या चल रहा है?',
  'pa-IN': 'ਮੈਂ ਇੱਥੇ ਤੁਹਾਡੇ ਨਾਲ ਹਾਂ। ਜਿੱਥੋਂ ਸੌਖਾ ਲੱਗੇ ਗੱਲ ਸ਼ੁਰੂ ਕਰੋ—ਅੱਜ ਮਨ ਵਿੱਚ ਕੀ ਚੱਲ ਰਿਹਾ ਹੈ?',
}

export default function SessionView({ navigate }: { navigate: (view: ViewName) => void }) {
  const { addMood, saveSession } = useData()
  const [stage, setStage] = useState<Stage>('welcome')
  const [mode, setMode] = useState<SessionMode>('voice')
  const [language, setLanguage] = useState<ConversationLanguage>('ur-PK')
  const [moodBefore, setMoodBefore] = useState<MoodKey>('okay')
  const [moodAfter, setMoodAfter] = useState<MoodKey>('calm')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [startedAt, setStartedAt] = useState('')
  const [finished, setFinished] = useState<TherapySession | null>(null)
  const [callActive, setCallActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<Recognition | null>(null)
  const callActiveRef = useRef(false)
  const speakingRef = useRef(false)
  const processingRef = useRef(false)

  const isNative = Capacitor.isNativePlatform()
  const voiceSupported = isNative || Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const currentLanguage = languages.find((item) => item.value === language) ?? languages[0]

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])
  useEffect(() => () => {
    callActiveRef.current = false
    recognitionRef.current?.abort()
    if (Capacitor.isNativePlatform()) void NativeSpeechRecognition.stop().catch(() => undefined)
    window.speechSynthesis?.cancel()
  }, [])

  function begin() {
    const now = new Date().toISOString()
    setStartedAt(now); setStage('chat')
    setMessages([{ id: crypto.randomUUID(), role: 'assistant', text: greetings[language], createdAt: now }])
  }

  function safelyStartRecognition() {
    if (!callActiveRef.current || speakingRef.current || processingRef.current) return
    if (isNative) {
      void startNativeRecognition()
      return
    }
    try { recognitionRef.current?.start() } catch { /* already listening */ }
  }

  async function startNativeRecognition() {
    if (!callActiveRef.current || speakingRef.current || processingRef.current) return
    try {
      const result = await NativeSpeechRecognition.start({
        language: currentLanguage.speechCode,
        maxResults: 1,
        partialResults: false,
        popup: false,
      })
      const finalText = result.matches?.[0]?.trim()
      if (!callActiveRef.current) return
      if (finalText) {
        setLiveTranscript(finalText)
        await respondTo(finalText, true)
      } else {
        window.setTimeout(safelyStartRecognition, 250)
      }
    } catch {
      if (!callActiveRef.current) return
      callActiveRef.current = false
      setCallActive(false)
      setVoiceError('آواز پہچاننے میں مسئلہ آیا ہے۔ مائیک کی اجازت اور انٹرنیٹ چیک کرکے دوبارہ کال شروع کریں۔')
    }
  }

  function speak(text: string, restartListening = false, voiceRetry = 0) {
    if (!('speechSynthesis' in window)) return
    recognitionRef.current?.stop()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = currentLanguage.speechCode; utterance.rate = 0.94; utterance.pitch = 1
    const voices = window.speechSynthesis.getVoices()
    if (language === 'ur-PK' && voices.length === 0 && voiceRetry < 4) {
      window.setTimeout(() => speak(text, restartListening, voiceRetry + 1), 180)
      return
    }
    const languagePrefix = currentLanguage.speechCode.split('-')[0].toLowerCase()
    const matchingVoice = voices.find((voice) => voice.lang.toLowerCase() === currentLanguage.speechCode.toLowerCase())
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(`${languagePrefix}-`))
      ?? (language === 'ur-PK' ? voices.find((voice) => /urdu|asad|uzma/i.test(voice.name)) : undefined)
    if (language === 'ur-PK' && !matchingVoice) {
      setVoiceError('اس براؤزر میں قدرتی اردو آواز دستیاب نہیں۔ براہِ کرم Edge یا Chrome میں اردو آواز شامل کر کے دوبارہ کوشش کریں۔')
      if (restartListening) window.setTimeout(safelyStartRecognition, 250)
      return
    }
    if (matchingVoice) utterance.voice = matchingVoice
    utterance.onstart = () => { speakingRef.current = true; setIsSpeaking(true) }
    utterance.onend = () => { speakingRef.current = false; setIsSpeaking(false); if (restartListening) window.setTimeout(safelyStartRecognition, 250) }
    utterance.onerror = () => { speakingRef.current = false; setIsSpeaking(false); if (restartListening) window.setTimeout(safelyStartRecognition, 250) }
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance)
  }

  async function respondTo(text: string, speakBack: boolean) {
    if (!text.trim() || processingRef.current) return
    processingRef.current = true
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: text.trim(), createdAt: new Date().toISOString() }
    setMessages((current) => [...current, userMessage]); setInput(''); setLiveTranscript(''); setThinking(true)
    const support = createSupportResponse(text, language)
    await new Promise((resolve) => window.setTimeout(resolve, 450))
    const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', text: support.text, createdAt: new Date().toISOString() }
    setMessages((current) => [...current, assistantMessage]); setThinking(false); processingRef.current = false
    if (speakBack) speak(support.text, callActiveRef.current)
  }

  async function send(event: FormEvent) {
    event.preventDefault()
    const text = input.trim(); if (!text || thinking) return
    await respondTo(text, mode === 'voice')
  }

  function buildRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null
    const recognition = new SpeechRecognition()
    // One utterance at a time is considerably more stable across Chromium-based browsers.
    // The onend handler reconnects quietly while the call remains active.
    recognition.continuous = false; recognition.interimResults = true; recognition.lang = currentLanguage.speechCode
    recognition.onstart = () => setVoiceError('')
    recognition.onresult = (event) => {
      let interim = ''; let finalText = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const phrase = event.results[index][0].transcript
        if (event.results[index].isFinal) finalText += phrase; else interim += phrase
      }
      setLiveTranscript(interim || finalText)
      if (finalText.trim()) { recognition.stop(); void respondTo(finalText, true) }
    }
    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError('مائیک کی اجازت بند ہے۔ براؤزر میں مائیک کی اجازت دے کر دوبارہ کال شروع کریں۔')
      } else if (event.error === 'audio-capture') {
        setVoiceError('مائیک دستیاب نہیں ہے۔ مائیک کا رابطہ اور براؤزر کی اجازت چیک کریں۔')
      } else if (event.error === 'network') {
        setVoiceError('آواز پہچاننے والی سروس سے رابطہ نہیں ہو سکا۔ Chrome یا Edge میں دوبارہ کوشش کریں۔')
      } else if (event.error === 'language-not-supported') {
        setVoiceError('اس براؤزر میں منتخب اردو زبان کی آواز پہچاننے کی سہولت موجود نہیں ہے۔')
      } else {
        setVoiceError('آواز پہچاننے میں مسئلہ آیا ہے۔ دوبارہ کال شروع کریں یا تحریری پیغام بھیجیں۔')
      }
      // A hard recognition error should not create an endless error/reconnect loop.
      callActiveRef.current = false
      setCallActive(false)
    }
    recognition.onend = () => {
      const shouldReconnect = callActiveRef.current && !speakingRef.current && !processingRef.current
      if (shouldReconnect) window.setTimeout(safelyStartRecognition, 300)
    }
    return recognition
  }

  async function startVoiceCall() {
    if (!voiceSupported) { setVoiceError('Live voice is not supported in this browser. Chrome or Edge works best; typing is still available.'); return }
    if (isNative) {
      const availability = await NativeSpeechRecognition.available()
      if (!availability.available) {
        setVoiceError('اس فون میں آواز پہچاننے کی سہولت دستیاب نہیں ہے۔')
        return
      }
      const permission = await NativeSpeechRecognition.requestPermissions()
      if (permission.speechRecognition !== 'granted') {
        setVoiceError('مائیک کی اجازت کے بغیر لائیو گفتگو شروع نہیں ہو سکتی۔')
        return
      }
    }
    window.speechSynthesis?.cancel(); recognitionRef.current?.abort(); recognitionRef.current = buildRecognition()
    callActiveRef.current = true; setCallActive(true); setVoiceError(''); safelyStartRecognition()
  }

  function endVoiceCall() {
    callActiveRef.current = false; speakingRef.current = false; setCallActive(false); setIsSpeaking(false); setLiveTranscript('')
    recognitionRef.current?.abort(); window.speechSynthesis?.cancel()
    if (isNative) void NativeSpeechRecognition.stop().catch(() => undefined)
  }

  function changeMode(nextMode: SessionMode) { if (nextMode === 'text') endVoiceCall(); setMode(nextMode) }
  function changeLanguage(nextLanguage: ConversationLanguage) { endVoiceCall(); setLanguage(nextLanguage) }

  async function completeSession() {
    endVoiceCall()
    const endedAt = new Date().toISOString()
    const session: TherapySession = { id: crypto.randomUUID(), title: 'A moment to feel heard', status: 'completed', moodBefore, moodAfter, messages, summary: buildSessionSummary(messages), startedAt, endedAt, durationMinutes: Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000)) }
    await Promise.all([saveSession(session), addMood(moodAfter, 3, 'After a Sukoon session')])
    setFinished(session); setStage('done')
  }

  if (stage === 'welcome') return (
    <div className="page session-intro">
      <button className="back-link" onClick={() => navigate('home')}><ArrowLeft size={17} /> Back to today</button>
      <div className="session-intro-card">
        <span className="session-heart"><HeartHandshake /></span><p className="eyebrow">A safe place to begin</p><h1>Talk or type.<br />I’m listening.</h1>
        <p>Choose a live voice conversation or write naturally. Your session stays in your private Sukoon account.</p>
        <div className="session-mode-picker" role="group" aria-label="Choose conversation mode">
          <button className={mode === 'voice' ? 'selected' : ''} onClick={() => setMode('voice')}><Phone /><span><b>Live voice</b><small>Talk and hear replies</small></span></button>
          <button className={mode === 'text' ? 'selected' : ''} onClick={() => setMode('text')}><Keyboard /><span><b>Type a message</b><small>Private text chat</small></span></button>
        </div>
        <label className="language-picker"><span>Conversation language</span><select value={language} onChange={(event) => setLanguage(event.target.value as ConversationLanguage)}>{languages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <div className="before-mood"><span>Before we begin, how do you feel?</span><div>{moods.map((mood) => <button key={mood.key} className={moodBefore === mood.key ? 'selected' : ''} onClick={() => setMoodBefore(mood.key)}><b>{mood.face}</b><small>{mood.label}</small></button>)}</div></div>
        <button className="primary-button" onClick={begin}>Begin my session {mode === 'voice' ? <Phone size={18} /> : <HeartHandshake size={18} />}</button>
        <small className="session-disclaimer"><ShieldAlert size={14} /> Not emergency care. If you are in immediate danger, contact local emergency services.</small>
      </div>
    </div>
  )

  if (stage === 'closing') return <div className="page session-intro"><div className="session-intro-card closing-card"><span className="session-heart"><Check /></span><p className="eyebrow">Before you leave</p><h1>How do you feel now?</h1><p>It is completely okay if the feeling has not changed. This helps you notice patterns gently over time.</p><div className="before-mood"><div>{moods.map((mood) => <button key={mood.key} className={moodAfter === mood.key ? 'selected' : ''} onClick={() => setMoodAfter(mood.key)}><b>{mood.face}</b><small>{mood.label}</small></button>)}</div></div><button className="primary-button" onClick={completeSession}>Complete & save session <Check size={18} /></button><button className="text-button" onClick={() => setStage('chat')}>Keep talking</button></div></div>
  if (stage === 'done' && finished) return <div className="page session-intro"><div className="session-intro-card closing-card"><span className="session-heart"><Check /></span><p className="eyebrow">Session complete</p><h1>You made space for yourself.</h1><p className="summary-box">{finished.summary}</p><div className="complete-stats"><span><Clock3 /> {finished.durationMinutes} min</span><span><HeartHandshake /> Mood: {finished.moodBefore} → {finished.moodAfter}</span></div><button className="primary-button" onClick={() => navigate('home')}>Return to today</button><button className="text-button" onClick={() => navigate('journal')}>View my journey</button></div></div>

  const callStatus = thinking ? 'جواب سوچ رہا ہوں…' : isSpeaking ? 'آپ سے بات کر رہا ہوں…' : callActive ? 'سن رہا ہوں…' : 'کال رکی ہوئی ہے'

  return (
    <div className="chat-page">
      <header className="chat-header"><div><button onClick={() => navigate('home')}><ArrowLeft /></button><span className="listener-avatar">S</span><div><strong>Your listening space</strong><small><span /> Here with you</small></div></div><div><span className="session-timer"><Clock3 size={15} /> Session in progress</span><button className="end-button" onClick={() => { endVoiceCall(); setStage('closing') }}><Square size={14} /> End session</button></div></header>
      <div className="conversation-toolbar"><div className="mode-tabs"><button className={mode === 'voice' ? 'active' : ''} onClick={() => changeMode('voice')}><Phone size={15} /> Live voice</button><button className={mode === 'text' ? 'active' : ''} onClick={() => changeMode('text')}><Keyboard size={15} /> Type</button></div><select aria-label="Conversation language" value={language} onChange={(event) => changeLanguage(event.target.value as ConversationLanguage)}>{languages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
      {mode === 'voice' && <section className="voice-call-panel" aria-live="polite"><div className={`voice-orb ${callActive ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}><span><Headphones /></span><i /><i /><i /></div><strong>{callStatus}</strong><p>{liveTranscript || (callActive ? `Speak naturally in ${currentLanguage.label}. I’ll reply in the same language.` : 'Start the call whenever you feel ready.')}</p>{voiceError && <small className="voice-error">{voiceError}</small>}<button className={callActive ? 'hangup-button' : 'call-button'} onClick={() => { if (callActive) endVoiceCall(); else void startVoiceCall() }}>{callActive ? <><PhoneOff /> Pause call</> : <><Phone /> Start live call</>}</button></section>}
      <div className="chat-body"><div className="conversation-date">Today · Private session</div>{messages.map((message) => <div key={message.id} className={`message-row ${message.role}`}><div className="message-avatar">{message.role === 'assistant' ? 'S' : 'You'}</div><div><div className="message-bubble">{message.text}</div>{message.role === 'assistant' && <button className="listen-button" onClick={() => speak(message.text)}><Volume2 size={14} /> Listen</button>}</div></div>)}{thinking && <div className="message-row assistant"><div className="message-avatar">S</div><div className="message-bubble typing"><i /><i /><i /></div></div>}<div ref={endRef} /></div>
      <form className="chat-composer" onSubmit={send}><div>{mode === 'voice' ? <button type="button" title="Start or pause voice call" className={callActive ? 'mic-live' : ''} onClick={() => { if (callActive) endVoiceCall(); else void startVoiceCall() }}><Mic /></button> : <span className="composer-icon"><Keyboard /></span>}<textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder={mode === 'voice' ? 'You can also type while in voice mode…' : 'Say what’s on your mind…'} rows={1} /><button className="send-button" disabled={!input.trim() || thinking}><Send /></button></div><small>{mode === 'voice' ? 'Voice and typed messages are both kept in this private session.' : 'Take your time. There is no perfect way to say it.'}</small></form>
    </div>
  )
}
