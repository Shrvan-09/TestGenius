import React, { useState, useEffect } from 'react';
import { Bot as TestBot } from 'lucide-react';
import TestGenerator from './components/TestGenerator';
import VisualTesting from './components/VisualTesting';
import Hero from './components/Hero';
import Features from './components/Features';
import UserProfile from './components/UserProfile';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, updateProfile, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState(''); // <-- Username state
  const [section, setSection] = useState<'home' | 'dashboard' | 'generator' | 'visual' | 'code' | 'results'>('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setShowAuth(false);
        setSection('dashboard');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        setShowAuth(false);
        setSection('dashboard');
        setTimeout(() => alert(`Login successful! Welcome, ${auth.currentUser?.displayName || auth.currentUser?.email}`), 100);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save username as displayName
        if (username) {
          await updateProfile(userCredential.user, { displayName: username });
        }
        // Send verification email
        await sendEmailVerification(userCredential.user);
        setShowAuth(false);
        setSection('dashboard');
        setTimeout(() => alert(`Welcome, ${username || email}! Please verify your email before logging in.`), 100);
        // Optionally, sign out user until they verify email
        await signOut(auth);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during authentication';
      setAuthError(errorMessage);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSection('home');
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuth(false);
      setSection('dashboard');
      setTimeout(() => alert(`Login successful! Welcome, ${auth.currentUser?.displayName || auth.currentUser?.email}`), 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during Google sign-in';
      setAuthError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setSection('home')}
        >
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <TestBot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">TestGenius</h1>
            <p className="text-purple-300 text-sm">AI-Powered Testing Platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                {user.displayName || user.email}
              </span>
              <button
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              onClick={() => setShowAuth(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        {user ? (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-4 mt-8 mb-8 justify-center">
              <button
                className={`px-6 py-2 rounded-lg font-semibold ${section === 'dashboard' ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200'}`}
                onClick={() => setSection('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-semibold ${section === 'generator' ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200'}`}
                onClick={() => setSection('generator')}
              >
                Generator
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-semibold ${section === 'visual' ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200'}`}
                onClick={() => setSection('visual')}
              >
                Visual Testing
              </button>
            </div>
            {/* Section Content */}
            {section === 'dashboard' && <UserProfile user={user} />}
            {section === 'generator' && <TestGenerator onBack={() => setSection('dashboard')} user={user} />}
            {section === 'visual' && <VisualTesting />}
          </>
        ) : (
          section === 'home' && (
            <>
              <Hero onGetStarted={() => setShowAuth(true)} />
              <Features onStartNow={() => setShowAuth(true)} />
            </>
          )
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-gray-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                  <TestBot className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">TestGenius</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transform your testing workflow with AI-powered test generation. 
                Create comprehensive Playwright test suites in seconds.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TestGenius. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowAuth(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-2 border rounded"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold"
              >
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 mb-4 bg-white text-gray-800 rounded-lg font-semibold flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-all"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.5-4z"/>
                    <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 5.1 29.4 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"/>
                    <path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.8 36 24 36 24 36c-5.8 0-10.7-1.9-14.3-5.2l6.6-5.4C18.2 33.9 21.9 36 24 36z"/>
                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 5.1 29.4 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"/>
                  </g>
                </svg>
                Sign in with Google
              </button>
              {authError && <div className="text-red-500 text-sm">{authError}</div>}
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              {authMode === 'signin' ? (
                <>Don't have an account? <button type="button" className="text-blue-600 underline" onClick={() => setAuthMode('signup')}>Sign up</button></>
              ) : (
                <>Already have an account? <button type="button" className="text-blue-600 underline" onClick={() => setAuthMode('signin')}>Sign in</button></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;