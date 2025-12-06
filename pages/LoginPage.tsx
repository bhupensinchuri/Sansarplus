import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import { Lock, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500">Access dashboard to manage content</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
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
        </form>
      </div>
    </div>
  );
};

export default LoginPage;