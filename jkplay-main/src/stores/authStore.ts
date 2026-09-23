import { create } from 'zustand';
import { User } from '../types/index.js';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateFirebaseProfile,
} from '../lib/firebase.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  resetSent: boolean;
  clearError: () => void;
  login: (login: string, pass: string) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

function formatAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return (
        err?.message?.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[a-z0-9-]+\)\.?/i, '').trim() ||
        'Authentication failed. Please try again.'
      );
  }
}

let isAuthListenerInitialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('kingplay_token'),
  isLoading: true,
  error: null,
  resetSent: false,

  clearError: () => set({ error: null, resetSent: false }),

  // 1. Google Sign-In
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: result.user.displayName || '',
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.user) {
        localStorage.setItem('kingplay_token', data.data.token);
        set({ user: data.data.user, token: data.data.token, isLoading: false, error: null });
        return true;
      } else {
        set({ error: data.error?.message || 'Authentication sync failed', isLoading: false });
        return false;
      }
    } catch (err: any) {
      const msg = formatAuthError(err);
      set({ error: msg || null, isLoading: false });
      return false;
    }
  },

  // 2. Email/Password Sign-In (Firebase Native with seamless fallback)
  signInWithEmail: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: userCredential.user.displayName || email.split('@')[0],
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.user) {
        localStorage.setItem('kingplay_token', data.data.token);
        set({ user: data.data.user, token: data.data.token, isLoading: false, error: null });
        return true;
      } else {
        set({ error: data.error?.message || 'Sign in sync failed', isLoading: false });
        return false;
      }
    } catch (err: any) {
      // If Firebase email provider is not enabled or user was registered in database
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/invalid-credential'
      ) {
        try {
          const fallbackRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: email.trim(), password: pass }),
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success && fallbackData.data?.user) {
            localStorage.setItem('kingplay_token', fallbackData.data.token);
            set({ user: fallbackData.data.user, token: fallbackData.data.token, isLoading: false, error: null });
            return true;
          }
        } catch (e) {
          // ignore fallback network error
        }
      }

      const msg = formatAuthError(err);
      set({ error: msg || 'Failed to sign in', isLoading: false });
      return false;
    }
  },

  // 3. Email/Password Sign-Up (Firebase Native with seamless fallback)
  signUpWithEmail: async (name: string, email: string, pass: string) => {
    set({ isLoading: true, error: null });
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);

      // Update profile with display name in Firebase
      if (trimmedName) {
        try {
          await updateFirebaseProfile(userCredential.user, { displayName: trimmedName });
        } catch (e) {
          // ignore profile update error if user was created
        }
      }

      const idToken = await userCredential.user.getIdToken();

      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: trimmedName || trimmedEmail.split('@')[0],
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.user) {
        localStorage.setItem('kingplay_token', data.data.token);
        set({ user: data.data.user, token: data.data.token, isLoading: false, error: null });
        return true;
      } else {
        set({ error: data.error?.message || 'Account created but sync failed', isLoading: false });
        return false;
      }
    } catch (err: any) {
      // If Firebase provider is not enabled in console, gracefully register user in database
      if (err?.code === 'auth/operation-not-allowed') {
        try {
          const fallbackRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: trimmedName,
              username: trimmedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
              email: trimmedEmail,
              password: pass,
            }),
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success && fallbackData.data?.user) {
            localStorage.setItem('kingplay_token', fallbackData.data.token);
            set({ user: fallbackData.data.user, token: fallbackData.data.token, isLoading: false, error: null });
            return true;
          } else if (fallbackData.error) {
            set({ error: fallbackData.error.message, isLoading: false });
            return false;
          }
        } catch (e) {
          // ignore fallback error
        }
      }

      const msg = formatAuthError(err);
      set({ error: msg || 'Failed to create account', isLoading: false });
      return false;
    }
  },

  // 4. Password Reset Email (Firebase Native)
  sendPasswordReset: async (email: string) => {
    set({ isLoading: true, error: null, resetSent: false });
    try {
      await sendPasswordResetEmail(auth, email.trim());
      set({ isLoading: false, error: null, resetSent: true });
      return true;
    } catch (err: any) {
      const msg = formatAuthError(err);
      set({ error: msg || 'Could not send reset email', isLoading: false, resetSent: false });
      return false;
    }
  },

  // Unified login handler (supports email, username, and demo accounts)
  login: async (loginValue: string, password: string) => {
    const isEmail = loginValue.includes('@');
    if (isEmail) {
      return get().signInWithEmail(loginValue, password);
    }

    // If username provided, try demo/local account
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginValue, password }),
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        localStorage.setItem('kingplay_token', data.data.token);
        set({ user: data.data.user, token: data.data.token, isLoading: false, error: null });
        return true;
      } else {
        set({ error: data.error?.message || 'Login failed', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Network error', isLoading: false });
      return false;
    }
  },

  // 5. Persistent Session Initializer & Auth Checker
  checkAuth: async () => {
    if (!isAuthListenerInitialized) {
      isAuthListenerInitialized = true;

      // Listen to Firebase Auth state for persistent user sessions across reloads
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const res = await fetch('/api/auth/firebase-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idToken,
                name: firebaseUser.displayName || '',
              }),
            });
            const data = await res.json();
            if (data.success && data.data?.user) {
              localStorage.setItem('kingplay_token', data.data.token);
              set({ user: data.data.user, token: data.data.token, isLoading: false, error: null });
              return;
            }
          } catch (e) {
            console.warn('Failed to restore Firebase session:', e);
          }
        }

        // Fallback: check stored local JWT token (e.g. demo users)
        const storedToken = localStorage.getItem('kingplay_token');
        if (storedToken) {
          try {
            const res = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            const data = await res.json();
            if (data.success && data.data?.user) {
              set({ user: data.data.user, token: storedToken, isLoading: false, error: null });
              return;
            }
          } catch (e) {
            // ignore
          }
        }

        set({ user: null, token: null, isLoading: false });
      });
    }
  },

  // 6. Logout
  logout: async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('kingplay_token');
    set({ user: null, token: null, error: null, resetSent: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const token = get().token;
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.data?.user) {
        set({ user: resData.data.user });
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },
}));
