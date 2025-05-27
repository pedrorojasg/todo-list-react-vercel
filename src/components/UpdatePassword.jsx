import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// This component is intended to be displayed when the user is in a password recovery flow.
// App.jsx should detect the PASSWORD_RECOVERY auth event and render this.

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    // Check if the user is in a password recovery state
    // This relies on onAuthStateChange in App.jsx having set the session
    // correctly when a PASSWORD_RECOVERY event occurs.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        // A more robust check could involve inspecting session.user.recovery for specific tokens if needed,
        // but typically the presence of a session during this phase indicates recovery flow.
        setSessionUser(session.user);
        console.log('UpdatePassword: User found in session for password recovery:', session.user.email);
      } else {
        setError('Invalid session or not in password recovery mode. Please request a new password reset link if needed.');
        console.warn('UpdatePassword: No active session or user for password recovery.');
      }
    });
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage('Password updated successfully! You can now sign in with your new password.');
      // Optionally, sign the user out or redirect them after successful password update.
      // supabase.auth.signOut(); // To force a new login.
    } catch (err) {
      console.error('Error updating password:', err);
      setError(`Error: ${err.error_description || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionUser && !error) {
    return <div className="text-center text-white mt-10">Verifying session...</div>;
  }
  
  if (error && !message) { // Show only critical errors if no success message is present
    return (
        <div className="w-full max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-xl text-center">
             <p className="mb-4 text-red-500 p-2 rounded bg-red-900">{error}</p>
             <a href="/" className="text-indigo-400 hover:text-indigo-300">Go to Sign In</a>
        </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">Set New Password</h1>
      {message && <p className={`mb-4 text-center p-2 rounded ${error ? 'bg-red-700' : 'bg-green-700'} text-white`}>{message}</p>}
      {error && !message && <p className="mb-4 text-center p-2 rounded bg-red-700 text-white">{error}</p>} 
      
      {sessionUser && !message && ( // Only show form if user session is valid and no success message yet
        <form onSubmit={handlePasswordUpdate}>
          <p className="text-sm text-gray-400 mb-4 text-center">Updating password for: {sessionUser.email}</p>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
              New Password
            </label>
            <input
              id="password"
              className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:border-indigo-500"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-bold mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:border-indigo-500"
              type="password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex items-center justify-center mb-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
       {(message || error) && (
            <div className="text-center mt-4">
                <a href="/" className="text-indigo-400 hover:text-indigo-300">Go to Sign In</a>
            </div>
        )}
    </div>
  );
} 