
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, resetPasswordWithRecovery } from '../utils/auth';
import { Lock, AlertCircle, KeyRound, ArrowLeft, CheckCircle, UserPlus } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset State
  const [isResetting, setIsResetting] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');

    if (!username) {
        setError('Email is required.');
        return;
    }

    const result = resetPasswordWithRecovery(username, recoveryCode, newPassword);
    if (result.success) {
        setResetSuccess(result.message);
        // Clear form after delay
        setTimeout(() => {
            setIsResetting(false);
            setResetSuccess('');
            setPassword('');
            setRecoveryCode('');
            setNewPassword('');
        }, 3000);
    } else {
        setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            {isResetting ? <KeyRound className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
              {isResetting ? 'Reset Password' : 'Admin Login'}
          </h1>
          <p className="text-slate-500">
              {isResetting ? 'Send a reset link to your email' : 'Access dashboard to manage content'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {resetSuccess && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl flex items-center text-sm border border-green-100">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {resetSuccess}
          </div>
        )}

        {isResetting ? (
            // --- RESET FORM ---
            <form onSubmit={handleReset} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                    <input 
                    type="email" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g. admin@sansarplus.com"
                    />
                </div>
                
                <button 
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2"
                >
                    Send Reset Link
                </button>
                <button 
                    type="button"
                    onClick={() => { setIsResetting(false); setError(''); }}
                    className="w-full py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors flex items-center justify-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </button>
            </form>
        ) : (
            // --- LOGIN FORM ---
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                type="email" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="admin@example.com"
                />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <button 
                        type="button" 
                        onClick={() => { setIsResetting(true); setError(''); }}
                        className="text-xs text-primary font-bold hover:underline"
                    >
                        Forgot Password?
                    </button>
                </div>
                <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Enter password"
                />
            </div>
            <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
                Login
            </button>
            
            <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500 mb-3">Don't have an admin account?</p>
                <Link 
                    to="/signup" 
                    className="flex items-center justify-center w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Create Account
                </Link>
                <p className="text-xs text-slate-400 mt-2">
                    Note: After signing up, you must promote your account to 'SUPER_ADMIN' in your database.
                </p>
            </div>

            </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
