import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/auth';
import { User, AlertCircle, Mail, Lock } from 'lucide-react';

const UserLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500">Login to access your playlist</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Gmail)</label>
            <div className="relative">
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
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
                  className="w-full border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter password"
                  required
                />
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
             </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
          <br />
          <div className="mt-4 pt-4 border-t border-slate-100">
              <Link to="/login" className="text-slate-400 hover:text-slate-600 text-xs">Admin Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;