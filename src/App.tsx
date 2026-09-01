import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import AuthScreen from './components/AuthScreen'
import MainApp from './components/MainApp'
import { isFirebaseConfigured } from './lib/firebase'

function AppContent() {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loader"><span className="brand-mark">S</span><p>Making space for you…</p></div>
  if (!isFirebaseConfigured) return <SetupScreen />
  return user ? <DataProvider><MainApp /></DataProvider> : <AuthScreen />
}

function SetupScreen() {
  return (
    <main className="setup-screen">
      <div className="setup-card">
        <span className="brand-mark">S</span>
        <p className="eyebrow">One small setup step</p>
        <h1>Connect your Firebase project</h1>
        <p>Copy <code>.env.example</code> to <code>.env</code>, add your Firebase web app credentials, then restart the development server.</p>
        <div className="setup-note">Enable Email/Password and Google providers in Firebase Authentication, then create a Firestore database.</div>
      </div>
    </main>
  )
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
