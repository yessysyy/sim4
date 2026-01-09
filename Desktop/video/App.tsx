
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  FileCheck, 
  Trophy, 
  Play, 
  Download, 
  RefreshCw,
  Zap,
  Lock,
  LogOut,
  UserCheck,
  Medal,
  Filter,
  Settings,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { 
  VideoEntry, 
  Judge, 
  Assessment, 
  JudgingCriteria, 
  ScoreSet,
  AuthUser,
  UserRole
} from './types';
import { 
  JUDGING_CRITERIA_LIST, 
  INITIAL_JUDGES, 
  INITIAL_ENTRIES,
  INITIAL_CATEGORIES
} from './constants';
import { getAIInsights } from './services/geminiService';

// --- Components ---

const Header = ({ user, onLogout }: { user: AuthUser; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
    <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <Play className="h-6 w-6 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">CINEMATIX</h1>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">
            {user.role === 'admin' ? 'Administrator' : 'Judge Panel'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm font-bold text-zinc-900">{user.name}</p>
          <p className="text-[10px] text-zinc-500">{user.role.toUpperCase()}</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all border border-zinc-100"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
);

const SectionTitle = ({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: any }) => (
  <div className="mb-8 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="rounded-2xl bg-white p-3 shadow-sm border border-zinc-100">
        <Icon className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// --- Login Screen ---

const LoginScreen = ({ onLogin, judges }: { onLogin: (user: AuthUser) => void; judges: Judge[] }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('judge');
  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (selectedRole === 'admin') {
      if (pin === '1234') {
        onLogin({ id: 'admin-1', name: 'Super Admin', role: 'admin' });
      } else {
        setError('PIN Admin salah (1234)');
      }
    } else {
      const judge = judges.find(j => j.id === selectedJudgeId);
      if (judge && pin === '0000') {
        onLogin({ id: judge.id, name: judge.name, role: 'judge' });
      } else if (!judge) {
        setError('Silakan pilih profil juri');
      } else {
        setError('PIN Juri salah (0000)');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">CINEMATIX</h1>
          <p className="text-zinc-500 mt-2">Sistem Penilaian Lomba Video Digital</p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
              <button 
                onClick={() => setSelectedRole('judge')}
                className={`py-2 text-sm font-bold rounded-lg transition-all ${selectedRole === 'judge' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Panel Juri
              </button>
              <button 
                onClick={() => setSelectedRole('admin')}
                className={`py-2 text-sm font-bold rounded-lg transition-all ${selectedRole === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
              >
                Admin
              </button>
            </div>

            {selectedRole === 'judge' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pilih Profil Juri</label>
                <select 
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                >
                  <option value="">-- Pilih Nama --</option>
                  {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Masukkan PIN</label>
              <input 
                type="password" maxLength={4} placeholder="****"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-2xl font-mono tracking-[1rem] focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                value={pin} onChange={(e) => setPin(e.target.value)}
              />
            </div>

            {error && <p className="text-center text-xs font-bold text-red-500">{error}</p>}

            <button 
              onClick={handleLogin}
              className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Masuk Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assess' | 'submissions' | 'management'>('assess');
  const [entries, setEntries] = useState<VideoEntry[]>(INITIAL_ENTRIES);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  
  // Dynamic State for Judges and Categories
  const [judges, setJudges] = useState<Judge[]>(INITIAL_JUDGES);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

  // States for forms
  const [newTeam, setNewTeam] = useState('');
  const [newCategory, setNewCategory] = useState(INITIAL_CATEGORIES[0]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [currentScores, setCurrentScores] = useState<ScoreSet>(() => {
    const init: ScoreSet = {};
    JUDGING_CRITERIA_LIST.forEach(c => init[c.id] = 5);
    return init;
  });
  const [comment, setComment] = useState('');
  const [aiReport, setAiReport] = useState<{ [entryId: string]: string }>({});
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Management State
  const [editingJudgeId, setEditingJudgeId] = useState<string | null>(null);
  const [tempJudgeName, setTempJudgeName] = useState('');
  const [newJudgeName, setNewJudgeName] = useState('');

  const [editingCategoryIdx, setEditingCategoryIdx] = useState<number | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') setActiveTab('dashboard');
    else if (user?.role === 'judge') setActiveTab('assess');
  }, [user]);

  // Logic to calculate rankings
  const rankedEntries = useMemo(() => {
    const data = entries.map(entry => {
      const entryAssessments = assessments.filter(a => a.entryId === entry.id);
      const avg = entryAssessments.length > 0 
        ? entryAssessments.reduce((sum, a) => sum + ((Object.values(a.scores) as number[]).reduce((s, v) => s + v, 0) / Object.values(a.scores).length), 0) / entryAssessments.length
        : 0;
      return { ...entry, avg, totalJudges: entryAssessments.length };
    });

    const filtered = categoryFilter === 'Semua Kategori' 
      ? data 
      : data.filter(d => d.category === categoryFilter);

    return filtered.sort((a, b) => b.avg - a.avg);
  }, [entries, assessments, categoryFilter]);

  if (!user) return <LoginScreen onLogin={setUser} judges={judges} />;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const submitEntry = () => {
    if (!newTeam || !videoFile) return alert('Data tidak lengkap!');
    const newEntry: VideoEntry = {
      id: `e${Date.now()}`,
      teamName: newTeam,
      videoUrl: '', 
      videoBlobUrl: URL.createObjectURL(videoFile),
      category: newCategory,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setEntries(prev => [...prev, newEntry]);
    setNewTeam('');
    setVideoFile(null);
    alert('Video berhasil diupload!');
  };

  const submitAssessment = () => {
    if (!selectedEntryId) return alert('Pilih Video!');
    const newAssessment: Assessment = {
      id: `a${Date.now()}`,
      entryId: selectedEntryId,
      judgeName: user.name,
      scores: { ...currentScores },
      comment,
      timestamp: new Date().toLocaleString()
    };
    setAssessments(prev => [...prev, newAssessment]);
    setComment('');
    alert('Penilaian berhasil disimpan!');
  };

  const exportToSpreadsheet = () => {
    let csv = "Rank,Tim,Kategori,Skor,Juri\n";
    rankedEntries.forEach((e, idx) => {
      csv += `${idx + 1},"${e.teamName}","${e.category}",${e.avg.toFixed(2)},${e.totalJudges}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pemenang_lomba.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAIInsight = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    const relevantAssessments = assessments.filter(a => a.entryId === entryId);
    
    if (!entry || relevantAssessments.length === 0) return;

    setIsGeneratingAi(true);
    try {
      const insight = await getAIInsights(entry, relevantAssessments);
      setAiReport(prev => ({ ...prev, [entryId]: insight }));
    } catch (error) {
      console.error("AI Insight Error:", error);
      alert("Gagal mendapatkan analisis AI");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // --- Management Handlers ---

  const addJudge = () => {
    if (!newJudgeName) return;
    setJudges(prev => [...prev, { id: `j${Date.now()}`, name: newJudgeName }]);
    setNewJudgeName('');
  };

  const deleteJudge = (id: string) => {
    if (confirm('Hapus juri ini?')) {
      setJudges(prev => prev.filter(j => j.id !== id));
    }
  };

  const startEditJudge = (judge: Judge) => {
    setEditingJudgeId(judge.id);
    setTempJudgeName(judge.name);
  };

  const saveEditJudge = () => {
    setJudges(prev => prev.map(j => j.id === editingJudgeId ? { ...j, name: tempJudgeName } : j));
    setEditingJudgeId(null);
  };

  const addCategory = () => {
    if (!newCategoryName) return;
    setCategories(prev => [...prev, newCategoryName]);
    setNewCategoryName('');
  };

  const deleteCategory = (name: string) => {
    if (confirm('Hapus kategori ini?')) {
      setCategories(prev => prev.filter(c => c !== name));
    }
  };

  const startEditCategory = (idx: number, name: string) => {
    setEditingCategoryIdx(idx);
    setTempCategoryName(name);
  };

  const saveEditCategory = () => {
    if (editingCategoryIdx !== null) {
      setCategories(prev => prev.map((c, i) => i === editingCategoryIdx ? tempCategoryName : c));
      setEditingCategoryIdx(null);
    }
  };

  // --- Renderers ---

  const renderDashboard = () => {
    const top3 = rankedEntries.slice(0, 3);
    const filterOptions = ['Semua Kategori', ...categories];

    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        {/* Category Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0">
            <Filter className="h-5 w-5 text-zinc-400 shrink-0" />
            <span className="text-sm font-bold text-zinc-700 shrink-0">Filter Pemenang:</span>
            <div className="flex gap-2">
              {filterOptions.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={exportToSpreadsheet}
            className="flex items-center gap-2 text-xs font-bold text-green-600 hover:bg-green-50 px-4 py-2 rounded-xl transition-all border border-green-100"
          >
            <Download className="h-4 w-4" />
            Download Hasil
          </button>
        </div>

        {/* Podium Juara */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Pemenang 2 */}
          <div className="order-2 md:order-1 h-full">
            {top3[1] && (
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform"><Medal className="h-20 w-20 text-slate-400" /></div>
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
                  <Medal className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Juara 2</p>
                <h3 className="text-lg font-bold text-zinc-900 leading-tight mb-2">{top3[1].teamName}</h3>
                <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">{top3[1].avg.toFixed(2)} pts</div>
              </div>
            )}
          </div>
          {/* Pemenang 1 */}
          <div className="order-1 md:order-2">
            {top3[0] && (
              <div className="bg-indigo-600 rounded-3xl p-8 shadow-2xl shadow-indigo-200 flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-4">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="h-24 w-24 text-white" /></div>
                <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                  <Trophy className="h-10 w-10 text-amber-300 fill-amber-300" />
                </div>
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Juara Utama</p>
                <h3 className="text-2xl font-black text-white leading-tight mb-3">{top3[0].teamName}</h3>
                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black text-white">{top3[0].avg.toFixed(2)} pts</div>
              </div>
            )}
          </div>
          {/* Pemenang 3 */}
          <div className="order-3 h-full">
            {top3[2] && (
              <div className="bg-white border-2 border-orange-50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform"><Medal className="h-20 w-20 text-orange-400" /></div>
                <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
                  <Medal className="h-8 w-8 text-orange-400" />
                </div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Juara 3</p>
                <h3 className="text-lg font-bold text-zinc-900 leading-tight mb-2">{top3[2].teamName}</h3>
                <div className="bg-orange-100 px-3 py-1 rounded-full text-xs font-bold text-orange-600">{top3[2].avg.toFixed(2)} pts</div>
              </div>
            )}
          </div>
        </div>

        {/* Klasemen Lengkap */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50/50 border-b border-zinc-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400">Rank</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400">Nama Tim</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400">Kategori</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-zinc-400">Skor Akhir</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-zinc-400">Status Penilaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {rankedEntries.map((e, idx) => (
                <tr key={e.id} className="group hover:bg-zinc-50/80 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-100 text-slate-500' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-400'}`}>
                        {idx + 1}
                      </span>
                      {idx < 3 && <Medal className={`h-4 w-4 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-orange-500'}`} />}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">{e.teamName}</td>
                  <td className="px-8 py-5"><span className="text-xs bg-zinc-100 px-2 py-1 rounded-md font-medium text-zinc-600">{e.category}</span></td>
                  <td className="px-8 py-5"><span className="text-lg font-black text-indigo-600 tracking-tight">{e.avg.toFixed(2)}</span></td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${e.totalJudges >= judges.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {e.totalJudges} / {judges.length} Juri Menilai
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAssessmentForm = () => {
    const currentEntry = entries.find(e => e.id === selectedEntryId);
    const entryAssessments = assessments.filter(a => a.entryId === selectedEntryId);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
        <div className="lg:col-span-7 space-y-6">
          <SectionTitle title="Video & Preview" subtitle="Tonton dan evaluasi karya tim" icon={Play} />
          
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-black shadow-2xl aspect-video relative">
            {currentEntry ? (
              <video 
                key={currentEntry.id}
                src={currentEntry.videoBlobUrl || currentEntry.videoUrl} 
                controls className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
                <Play className="h-12 w-12 opacity-20" />
                <p className="text-sm font-medium">Pilih video untuk memulai penilaian</p>
              </div>
            )}
          </div>

          {currentEntry && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{currentEntry.teamName}</h3>
                  <p className="text-sm text-zinc-500 font-medium">Kategori: {currentEntry.category}</p>
                </div>
                {user.role === 'admin' && (
                  <button 
                    disabled={entryAssessments.length === 0 || isGeneratingAi}
                    onClick={() => generateAIInsight(currentEntry.id)}
                    className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 transition-all"
                  >
                    {isGeneratingAi ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                    AI Summary
                  </button>
                )}
              </div>

              {aiReport[currentEntry.id] && (
                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5 text-sm text-indigo-900 leading-relaxed italic mb-8">
                  {aiReport[currentEntry.id]}
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Feedback Juri Lain</h4>
                {entryAssessments.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">Belum ada feedback.</p>
                ) : (
                  <div className="space-y-3">
                    {entryAssessments.map(a => (
                      <div key={a.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-bold text-zinc-900">{a.judgeName}</p>
                          <span className="text-xs font-black text-indigo-600">Avg: {(Object.values(a.scores) as number[]).reduce((s,v)=>s+v,0)/Object.values(a.scores).length}</span>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">"{a.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pilih Karya Video</label>
                <select 
                  value={selectedEntryId}
                  onChange={(e) => setSelectedEntryId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                >
                  <option value="">-- Pilih Tim Video --</option>
                  {entries.map(e => <option key={e.id} value={e.id}>{e.teamName} ({e.category})</option>)}
                </select>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Parameter Penilaian</h4>
                {JUDGING_CRITERIA_LIST.map(crit => (
                  <div key={crit.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-zinc-800">{crit.id}</span>
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 h-8 w-8 flex items-center justify-center rounded-lg">{currentScores[crit.id]}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1"
                      value={currentScores[crit.id]}
                      onChange={(e) => setCurrentScores(prev => ({ ...prev, [crit.id]: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Komentar Final</label>
                <textarea 
                  rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Kesan pesan tentang video ini..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-indigo-600 transition-all"
                />
              </div>

              <button 
                onClick={submitAssessment}
                className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Kirim Penilaian Final
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubmissionForm = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <SectionTitle title="Registrasi Peserta" subtitle="Hanya admin yang dapat mendaftarkan peserta" icon={Plus} />
      <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm space-y-8">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-bold text-zinc-700">Nama Tim</label>
            <input 
              type="text" value={newTeam} onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Contoh: Tim Creative"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-indigo-600"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-bold text-zinc-700">Kategori</label>
            <select 
              value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-bold text-zinc-700">Video</label>
            <div className="relative rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-10 text-center hover:border-indigo-300 transition-all">
              <input type="file" accept="video/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-3 text-zinc-400">
                <Play className="h-10 w-10" />
                <p className="font-bold">{videoFile ? videoFile.name : 'Klik untuk upload video'}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={submitEntry}
            className="w-full rounded-2xl bg-zinc-900 py-4 font-bold text-white hover:bg-zinc-800 shadow-xl transition-all"
          >
            Daftarkan Peserta
          </button>
        </div>
      </div>
    </div>
  );

  const renderManagement = () => (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <SectionTitle title="Manajemen Lomba" subtitle="Kelola daftar juri dan kategori kompetisi" icon={Settings} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Judge Management */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Daftar Juri
            </h3>
            
            <div className="space-y-3 mb-6">
              {judges.map(judge => (
                <div key={judge.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl group border border-zinc-100">
                  {editingJudgeId === judge.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input 
                        type="text" value={tempJudgeName} onChange={(e) => setTempJudgeName(e.target.value)}
                        className="flex-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <button onClick={saveEditJudge} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingJudgeId(null)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-zinc-700">{judge.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditJudge(judge)} className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => deleteJudge(judge.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text" placeholder="Nama juri baru..." value={newJudgeName} onChange={(e) => setNewJudgeName(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-all"
              />
              <button 
                onClick={addJudge}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Management */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              Kategori Video
            </h3>
            
            <div className="space-y-3 mb-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl group border border-zinc-100">
                  {editingCategoryIdx === idx ? (
                    <div className="flex items-center gap-2 w-full">
                      <input 
                        type="text" value={tempCategoryName} onChange={(e) => setTempCategoryName(e.target.value)}
                        className="flex-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <button onClick={saveEditCategory} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingCategoryIdx(null)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-zinc-700">{cat}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditCategory(idx, cat)} className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => deleteCategory(cat)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text" placeholder="Nama kategori baru..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-all"
              />
              <button 
                onClick={addCategory}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-sm text-amber-800 leading-relaxed italic">
        <strong>Penting:</strong> Perubahan pada nama juri atau kategori akan berdampak pada menu drop-down di seluruh aplikasi. Pastikan semua tim sudah terdaftar dengan kategori yang benar.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={user} onLogout={() => setUser(null)} />
      
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-center">
          <div className="flex flex-wrap justify-center gap-1 rounded-2xl bg-zinc-200/50 p-1.5 backdrop-blur-sm shadow-inner">
            {user.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard Pemenang</span>
                <span className="md:hidden">Hasil</span>
              </button>
            )}
            
            <button 
              onClick={() => setActiveTab('assess')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all ${activeTab === 'assess' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <FileCheck className="h-4 w-4" />
              Penilaian
            </button>
            
            {user.role === 'admin' && (
              <>
                <button 
                  onClick={() => setActiveTab('submissions')}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all ${activeTab === 'submissions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Input Data</span>
                  <span className="md:hidden">Data</span>
                </button>
                <button 
                  onClick={() => setActiveTab('management')}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all ${activeTab === 'management' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Manajemen</span>
                  <span className="md:hidden">Kelola</span>
                </button>
              </>
            )}
          </div>
        </div>

        {activeTab === 'dashboard' && user.role === 'admin' && renderDashboard()}
        {activeTab === 'assess' && renderAssessmentForm()}
        {activeTab === 'submissions' && user.role === 'admin' && renderSubmissionForm()}
        {activeTab === 'management' && user.role === 'admin' && renderManagement()}
      </main>
    </div>
  );
}
