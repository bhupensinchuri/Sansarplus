import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../utils/auth';
import { UserPlus, AlertCircle, Mail, Lock, User } from 'lucide-react';

const UserSignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerUser(name, email, password)) {
      navigate('/favorites'); // Redirect to favorites/playlist after signup
    } else {
      setError('User with this email already exists');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500">Sign up to save your playlist</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="John Doe"
                required
              />
              <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="you@gmail.com"
                required
              />
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="Create password"
                required
              />
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="Confirm password"
                required
              />
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/user-login" className="text-secondary font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default UserSignupPage;