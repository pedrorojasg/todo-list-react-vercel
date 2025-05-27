import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Modes: 'signIn', 'signUp', 'forgotPassword', 'resettingPassword' (after email sent)
  const [authMode, setAuthMode] = useState('signIn'); 
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let response;
      if (authMode === 'signUp') {
        response = await supabase.auth.signUp({ email, password });
        if (response.error) throw response.error;
        if (response.data.user && response.data.user.identities && response.data.user.identities.length === 0) {
          setMessage('Signup successful! Please check your email to confirm your account.');
        } else if (response.data.session) {
            setMessage('Signup successful! You are now logged in.');
        } else {
             setMessage('Signup successful! Please check your email for a confirmation link.');
        }
      } else if (authMode === 'signIn') {
        response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) throw response.error;
        setMessage('Signed in successfully!');
        // Session handled by onAuthStateChange in App.jsx
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setMessage(`Error: ${error.error_description || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessage('Password reset email sent! Check your inbox.');
      setAuthMode('resettingPassword'); // Change mode to indicate email is sent
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setMessage(`Error: ${error.error_description || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  let formContent;
  if (authMode === 'forgotPassword') {
    formContent = (
      <form onSubmit={handlePasswordResetRequest}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
            Email for Password Reset
          </label>
          <input
            id="email"
            className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:border-indigo-500"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setAuthMode('signIn'); setMessage(''); }}
            className="inline-block align-baseline font-bold text-sm text-indigo-400 hover:text-indigo-300"
          >
            Back to Sign In
          </a>
        </div>
      </form>
    );
  } else if (authMode === 'resettingPassword') {
    formContent = <p className='text-center text-gray-300'>{message || "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder)."}</p>;
  } else { // signIn or signUp
    formContent = (
      <form onSubmit={handleAuth}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
            Email
          </label>
          <input
            id="email"
            className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:border-indigo-500"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
            Password
          </label>
          <input
            id="password"
            className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:border-indigo-500"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password (min 6 characters)"
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Processing...' : (authMode === 'signUp' ? 'Sign Up' : 'Sign In')}
          </button>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setAuthMode(authMode === 'signUp' ? 'signIn' : 'signUp');
              setMessage('');
            }}
            className="inline-block align-baseline font-bold text-sm text-indigo-400 hover:text-indigo-300"
          >
            {authMode === 'signUp' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </a>
        </div>
        {authMode === 'signIn' && (
          <div className="text-center mt-4">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setAuthMode('forgotPassword'); setMessage(''); }}
              className="inline-block align-baseline font-bold text-sm text-indigo-400 hover:text-indigo-300"
            >
              Forgot Password?
            </a>
          </div>
        )}
      </form>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
        {authMode === 'signUp' ? 'Create Account' :
         authMode === 'signIn' ? 'Sign In' :
         authMode === 'forgotPassword' ? 'Reset Password' :
         'Password Reset Email Sent'}
      </h1>
      {message && authMode !== 'resettingPassword' && (
         <p className={`mb-4 text-center p-2 rounded ${message.startsWith('Error') ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>{message}</p>
      )}
      {formContent}
    </div>
  );
} 