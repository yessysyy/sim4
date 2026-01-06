
import React, { useState } from 'react';
import { AppState, User, Role, Group } from './types';
import { storageService } from './services/storage';
import { Icons } from './constants';

// --- Sub-components ---
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DatabaseManager from './components/DatabaseManager';
import AttendanceForm from './components/AttendanceForm';
import RecapView from './components/RecapView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentView: 'home',
  });

  const handleLogin = (user: User) => {
    setState({ ...state, currentUser: user, currentView: 'dashboard' });
  };

  const handleLogout = () => {
    setState({ ...state, currentUser: null, currentView: 'home' });
  };

  const navigateTo = (view: AppState['currentView']) => {
    setState({ ...state, currentView: view });
  };

  const renderContent = () => {
    switch (state.currentView) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'login':
        return <Login onLogin={handleLogin} onBack={() => navigateTo('home')} />;
      case 'dashboard':
        return state.currentUser ? (
          <Dashboard 
            user={state.currentUser} 
            onNavigate={navigateTo} 
            onLogout={handleLogout} 
          />
        ) : <Home onNavigate={navigateTo} />;
      case 'database':
        return state.currentUser ? (
          <DatabaseManager 
            user={state.currentUser} 
            onBack={() => navigateTo('dashboard')} 
          />
        ) : null;
      case 'attendance':
        return (
          <AttendanceForm 
            onBack={() => navigateTo(state.currentUser ? 'dashboard' : 'home')} 
          />
        );
      case 'recap':
        return state.currentUser ? (
          <RecapView 
            user={state.currentUser} 
            onBack={() => navigateTo('dashboard')} 
          />
        ) : null;
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Dynamic Header */}
      {state.currentView !== 'home' && state.currentView !== 'login' && (
        <header className="bg-emerald-800 text-white shadow-lg sticky top-0 z-40 no-print border-b-4 border-yellow-400">
          <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center shadow-inner">
                <span className="text-xl font-black">MM</span>
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-lg leading-none tracking-tight">SIMM Remaja LDII PC Semampir</h1>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{state.currentUser?.group || '2026'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs opacity-70 font-bold uppercase">{state.currentUser?.role}</div>
                <div className="text-sm font-bold">{state.currentUser?.username}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 p-2 rounded-xl transition-all shadow-md active:scale-95"
                title="Keluar"
              >
                <Icons.Logout />
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        {renderContent()}
      </main>

      <footer className="p-8 text-center bg-white border-t border-slate-100 no-print">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-12 bg-slate-200"></div>
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.3em]">SIMM Dashboard</span>
            <div className="h-px w-12 bg-slate-200"></div>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} Sistem Informasi. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-slate-300 text-[10px] font-bold tracking-widest uppercase italic">Alhamdulillah Jaza Kummullahu Khoiro</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
