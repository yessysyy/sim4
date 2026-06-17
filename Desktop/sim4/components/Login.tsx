
import React, { useState } from 'react';
import { Role, User, Group } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mapping akun berdasarkan username dan password spesifik
    const userMap: Record<string, { role: Role; group?: Group; pass: string }> = {
      'admin': { role: 'Admin', pass: 'dsnew26' },
      'ketua1': { role: 'Ketua MM Wonokusumo 1', group: 'Wonokusumo 1', pass: 'wk1' },
      'ketua2': { role: 'Ketua MM Wonokusumo 2', group: 'Wonokusumo 2', pass: 'wk2' },
      'ketua3': { role: 'Ketua MM Kedung Mangu', group: 'Kedung Mangu', pass: 'kemang' },
      'ketua4': { role: 'Ketua MM Kapas Jaya', group: 'Kapas Jaya', pass: 'kjj' },
    };

    const lowerUser = username.toLowerCase();
    const account = userMap[lowerUser];
    
    if (account && password === account.pass) {
      onLogin({
        id: Math.random().toString(36).substr(2, 9),
        username: username,
        role: account.role,
        group: account.group
      });
    } else {
      setError('Username tidak terdaftar atau password salah.');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-emerald-800 p-12 text-white text-center relative overflow-hidden border-b-8 border-yellow-400">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="text-sm font-black text-yellow-400 uppercase tracking-[0.4em] mb-2">Secure Access</div>
            <h2 className="text-4xl font-black tracking-tight">Akun <br />Pengurus</h2>
            <div className="h-1 w-12 bg-white/30 mx-auto rounded-full mt-4"></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-pulse">
              ⚠️ {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text"
              placeholder="Username akun (admin, ketua1, ketua2, ...)"
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-600 focus:bg-white outline-none transition-all font-bold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password"
              placeholder="••••••••"
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-600 focus:bg-white outline-none transition-all font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit"
              className="w-full bg-emerald-700 text-white p-5 rounded-2xl font-black text-lg hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20 active:scale-95"
            >
              Buka Dashboard
            </button>
            <button 
              type="button"
              onClick={onBack}
              className="w-full text-slate-400 p-2 rounded-xl font-bold hover:text-slate-600 transition-all text-xs uppercase tracking-widest"
            >
              ← Kembali ke Beranda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
