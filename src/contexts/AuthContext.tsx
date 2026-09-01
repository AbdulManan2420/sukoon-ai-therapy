/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { Capacitor } from '@capacitor/core'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

interface AuthValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

async function ensureProfile(user: User, name?: string) {
  if (!db) throw new Error('Firebase is not configured.')
  await setDoc(doc(db, 'users', user.uid), {
    name: name || user.displayName || 'Sukoon member',
    email: user.email,
    photoURL: user.photoURL || null,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))

  useEffect(() => {
    if (!auth) return
    const firebaseAuth = auth
    let active = true
    let redirectChecked = false

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      if (!active) return
      setUser(nextUser)
      // A signed-in user can enter immediately. For an initial null user, wait
      // until Firebase has finished resolving a possible Google redirect.
      if (nextUser || redirectChecked) setLoading(false)
      if (nextUser) void ensureProfile(nextUser).catch(() => undefined)
    })

    void getRedirectResult(firebaseAuth)
      .then(async (credential) => {
        await firebaseAuth.authStateReady()
        if (!active) return
        const resolvedUser = credential?.user ?? firebaseAuth.currentUser
        redirectChecked = true
        setUser(resolvedUser)
        setLoading(false)
        if (resolvedUser) await ensureProfile(resolvedUser)
      })
      .catch(() => {
        if (!active) return
        redirectChecked = true
        setUser(firebaseAuth.currentUser)
        setLoading(false)
      })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value: AuthValue = {
    user,
    loading,
    login: async (email, password) => {
      if (!auth) throw new Error('Firebase is not configured.')
      await signInWithEmailAndPassword(auth, email, password)
    },
    signup: async (name, email, password) => {
      if (!auth) throw new Error('Firebase is not configured.')
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName: name })
      await ensureProfile(credential.user, name)
    },
    loginWithGoogle: async () => {
      if (!auth) throw new Error('Firebase is not configured.')
      if (Capacitor.isNativePlatform()) {
        const nativeResult = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true })
        const idToken = nativeResult.credential?.idToken
        const accessToken = nativeResult.credential?.accessToken
        if (!idToken) throw new Error('Google did not return a valid identity token.')
        const credential = GoogleAuthProvider.credential(idToken, accessToken)
        const userCredential = await signInWithCredential(auth, credential)
        await ensureProfile(userCredential.user)
        return
      }
      await signInWithRedirect(auth, googleProvider)
    },
    resetPassword: async (email) => {
      if (!auth) throw new Error('Firebase is not configured.')
      await sendPasswordResetEmail(auth, email)
    },
    logout: async () => {
      if (!auth) return
      await signOut(auth)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
