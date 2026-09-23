import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import {
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    login,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    isLoading,
    error,
    resetSent,
    clearError,
  } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      clearError();
      setLocalError(null);
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const handleClose = () => {
    clearError();
    setLocalError(null);
    onClose();
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot-password') => {
    clearError();
    setLocalError(null);
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (mode === 'forgot-password') {
      if (!email.trim()) {
        setLocalError('Please enter your email address');
        return;
      }
      await sendPasswordReset(email);
      return;
    }

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setLocalError('Please enter your email and password');
        return;
      }
      const ok = await login(email, password);
      if (ok) handleClose();
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setLocalError('Please fill in all required fields');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long');
        return;
      }
      const ok = await signUpWithEmail(name, email, password);
      if (ok) handleClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    const ok = await signInWithGoogle();
    if (ok) handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F0F1A] border border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            {mode === 'forgot-password' ? (
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
                title="Back to Sign In"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold">
                K
              </div>
            )}
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {mode === 'login'
                  ? 'Welcome Back'
                  : mode === 'register'
                  ? 'Join KingPlay'
                  : 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Sign in to access your playlists & library'
                  : mode === 'register'
                  ? 'Create an account to start streaming'
                  : 'Enter your email to receive recovery instructions'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Authentication Button (Only in login & register modes) */}
        {mode !== 'forgot-password' && (
          <>
            <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center my-3.5">
              <div className="flex-1 border-t border-white/[0.08]" />
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                or with email & password
              </span>
              <div className="flex-1 border-t border-white/[0.08]" />
            </div>
          </>
        )}

        {/* Success message for password reset */}
        {resetSent && mode === 'forgot-password' && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Password reset link sent!</p>
              <p className="text-slate-300 mt-0.5">
                Check your email inbox ({email}) for a link to reset your password.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {(error || localError) && (
          <div className="mt-4 flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sayan Mondal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot-password')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              {mode === 'register' && (
                <p className="text-[10px] text-slate-500 mt-1">Must be at least 6 characters</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Free Account'
                : 'Send Reset Link'}
            </span>
          </button>
        </form>

        {/* Toggle mode links */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] text-center">
          {mode === 'login' ? (
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => handleSwitchMode('register')}
                className="text-purple-400 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : mode === 'register' ? (
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => handleSwitchMode('login')}
                className="text-purple-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Remember your password?{' '}
              <button
                onClick={() => handleSwitchMode('login')}
                className="text-purple-400 font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
