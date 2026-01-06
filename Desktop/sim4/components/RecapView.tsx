import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, User, Group, AttendanceStatus } from '../types';
import { storageService } from '../services/storage';
import { Icons, GROUPS, ATTENDANCE_STATUS_OPTIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface Props {
  user: User;
  onBack: () => void;
}

type TabType = 'ringkasan' | 'individu' | 'kegiatan' | 'waktu';

const RecapView: React.FC<Props> = ({ user, onBack }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterGroup, setFilterGroup] = useState<Group | 'Semua'>(user.role === 'Admin' ? 'Semua' : (user.group || 'Semua'));
  
  // Granular Date Filters
  const [filterDayOfWeek, setFilterDayOfWeek] = useState<string>('Semua');
  const [filterMonth, setFilterMonth] = useState<string>('Semua');
  const [filterYear, setFilterYear] = useState<string>('Semua');
  const [filterDateNum, setFilterDateNum] = useState<string>('Semua');

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');
  
  // Edit State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const refreshData = () => {
    const all = storageService.getAttendance();
    if (user.role !== 'Admin' && user.group) {
      setRecords(all.filter(r => r.group === user.group));
    } else {
      setRecords(all);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Available Years from data
  const availableYears = useMemo(() => {
    const years = records.map(r => new Date(r.date).getFullYear().toString());
    // Fix: Explicitly type sort parameters to resolve 'unknown' type error in some TS versions
    return Array.from(new Set(years)).sort((a: string, b: string) => b.localeCompare(a));
  }, [records]);

  // Helper: Format tanggal ke "Jumat, 2 Jan 2026"
  const formatDateFullIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const dayName = dayNames[d.getDay()];
      const day = d.getDate();
      const monthShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"][d.getMonth()];
      const year = d.getFullYear();
      
      return `${dayName}, ${day} ${monthShort} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;

      const matchGroup = filterGroup === 'Semua' || r.group === filterGroup;
      const matchDayOfWeek = filterDayOfWeek === 'Semua' || dayNames[d.getDay()] === filterDayOfWeek;
      const matchMonth = filterMonth === 'Semua' || monthNames[d.getMonth()] === filterMonth;
      const matchYear = filterYear === 'Semua' || d.getFullYear().toString() === filterYear;
      const matchDateNum = filterDateNum === 'Semua' || d.getDate().toString() === filterDateNum;
      
      return matchGroup && matchDayOfWeek && matchMonth && matchYear && matchDateNum;
    });
  }, [records, filterGroup, filterDayOfWeek, filterMonth, filterYear, filterDateNum]);

  // -- CALCULATIONS --
  const stats = useMemo(() => ({
    hadir: filteredRecords.filter(r => r.status === 'Hadir').length,
    izin: filteredRecords.filter(r => r.status === 'Izin').length,
    sakit: filteredRecords.filter(r => r.status === 'Sakit').length,
    alfa: filteredRecords.filter(r => r.status === 'Alfa').length,
    total: filteredRecords.length
  }), [filteredRecords]);

  const individualStats = useMemo(() => {
    const map: Record<string, { total: number; hadir: number }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.memberName]) map[r.memberName] = { total: 0, hadir: 0 };
      map[r.memberName].total++;
      if (r.status === 'Hadir') map[r.memberName].hadir++;
    });
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        ...data,
        percent: Math.round((data.hadir / data.total) * 100)
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [filteredRecords]);

  const activityStats = useMemo(() => {
    const map: Record<string, { total: number; hadir: number }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.kegiatan]) map[r.kegiatan] = { total: 0, hadir: 0 };
      map[r.kegiatan].total++;
      if (r.status === 'Hadir') map[r.kegiatan].hadir++;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      percent: Math.round((data.hadir / data.total) * 100)
    }));
  }, [filteredRecords]);

  const monthlyStats = useMemo(() => {
    const map: Record<string, { total: number; hadir: number }> = {};
    filteredRecords.forEach(r => {
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return;
      const monthLabel = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      if (!map[monthLabel]) map[monthLabel] = { total: 0, hadir: 0 };
      map[monthLabel].total++;
      if (r.status === 'Hadir') map[monthLabel].hadir++;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      hadir: data.hadir,
      percent: Math.round((data.hadir / data.total) * 100)
    }));
  }, [filteredRecords]);

  const chartData = [
    { name: 'Hadir', value: stats.hadir, color: '#047857' },
    { name: 'Izin', value: stats.izin, color: '#1d4ed8' },
    { name: 'Sakit', value: stats.sakit, color: '#b45309' },
    { name: 'Alfa', value: stats.alfa, color: '#be123c' },
  ];

  const handleDownload = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (format === 'csv') {
      const headers = ['Hari', 'Tanggal', 'Kegiatan', 'Kelompok', 'Nama', 'Status', 'Feedback'];
      const rows = filteredRecords.map(r => [
        formatDateFullIndo(r.date).split(', ')[0],
        formatDateFullIndo(r.date).split(', ')[1], 
        r.kegiatan, 
        r.group, 
        r.memberName, 
        r.status, 
        (r.feedback || '').replace(/,/g, ' ')
      ].join(','));
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rekap_presensi_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
    setShowExportMenu(false);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord({ ...record });
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data presensi ini?")) {
      storageService.deleteAttendanceRecord(id);
      refreshData();
    }
  };

  const handleUpdateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      storageService.updateAttendanceRecord(editingRecord);
      setIsEditModalOpen(false);
      setEditingRecord(null);
      refreshData();
    }
  };

  const resetFilters = () => {
    setFilterGroup(user.role === 'Admin' ? 'Semua' : (user.group || 'Semua'));
    setFilterDayOfWeek('Semua');
    setFilterMonth('Semua');
    setFilterYear('Semua');
    setFilterDateNum('Semua');
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <button onClick={onBack} className="text-emerald-700 font-black hover:underline flex items-center gap-1 mb-2 text-xs uppercase tracking-widest">
            ← Kembali
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rekapitulasi Muda-Mudi</h1>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => window.print()} className="bg-white border-2 border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all">
            <Icons.Print /> Cetak
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-emerald-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-900 shadow-lg shadow-emerald-900/20 font-black text-xs uppercase tracking-widest transition-all">
              <Icons.Download /> Ekspor <span className="text-[10px] opacity-50">▼</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden py-2 animate-in fade-in zoom-in duration-200">
                <button onClick={() => handleDownload('csv')} className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">Unduh CSV</button>
                <button onClick={() => window.print()} className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">Cetak PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 no-print">
        <div className="flex items-center gap-2 mb-2">
            <Icons.Search />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Filter Lanjutan</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Kelompok */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kelompok</label>
            <select 
              disabled={user.role !== 'Admin'}
              className="w-full p-3 rounded-2xl border-2 border-slate-50 outline-none focus:border-emerald-600 font-bold bg-slate-50 disabled:opacity-50 transition-all text-xs"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value as any)}
            >
              {user.role === 'Admin' && <option value="Semua">Semua</option>}
              {GROUPS.map(g => <option key={g.name} value={g.name}>{g.label}</option>)}
            </select>
          </div>

          {/* Hari */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hari</label>
            <select 
              className="w-full p-3 rounded-2xl border-2 border-slate-50 outline-none focus:border-emerald-600 font-bold bg-slate-50 transition-all text-xs"
              value={filterDayOfWeek}
              onChange={(e) => setFilterDayOfWeek(e.target.value)}
            >
              <option value="Semua">Semua Hari</option>
              {dayNames.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Tanggal Angka */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
            <select 
              className="w-full p-3 rounded-2xl border-2 border-slate-50 outline-none focus:border-emerald-600 font-bold bg-slate-50 transition-all text-xs"
              value={filterDateNum}
              onChange={(e) => setFilterDateNum(e.target.value)}
            >
              <option value="Semua">Semua Tgl</option>
              {Array.from({length: 31}, (_, i) => (i + 1).toString()).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Bulan */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bulan</label>
            <select 
              className="w-full p-3 rounded-2xl border-2 border-slate-50 outline-none focus:border-emerald-600 font-bold bg-slate-50 transition-all text-xs"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="Semua">Semua Bulan</option>
              {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Tahun */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun</label>
            <select 
              className="w-full p-3 rounded-2xl border-2 border-slate-50 outline-none focus:border-emerald-600 font-bold bg-slate-50 transition-all text-xs"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="Semua">Semua Tahun</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
            <button 
                onClick={resetFilters} 
                className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] hover:text-emerald-900 transition-colors"
            >
                Bersihkan Semua Filter
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Hadir" value={stats.hadir} color="emerald" total={stats.total} />
        <StatCard label="Izin" value={stats.izin} color="blue" total={stats.total} />
        <StatCard label="Sakit" value={stats.sakit} color="amber" total={stats.total} />
        <StatCard label="Alfa" value={stats.alfa} color="red" total={stats.total} />
      </div>

      {/* Navigation */}
      <div className="flex border-b-2 border-slate-100 no-print overflow-x-auto scrollbar-hide">
        <TabButton active={activeTab === 'ringkasan'} onClick={() => setActiveTab('ringkasan')} label="Grafik Partisipasi" />
        <TabButton active={activeTab === 'individu'} onClick={() => setActiveTab('individu')} label="Ranking Keaktifan" />
        <TabButton active={activeTab === 'kegiatan'} onClick={() => setActiveTab('kegiatan')} label="Evaluasi Acara" />
        <TabButton active={activeTab === 'waktu'} onClick={() => setActiveTab('waktu')} label="Trend Bulanan" />
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'ringkasan' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[450px]">
            <h3 className="font-black text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-tighter text-lg">
              <Icons.Chart /> Distribusi Status Kehadiran
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'individu' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sesi</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hadir</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Persentase Keaktifan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {individualStats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-black text-slate-800">{item.name}</td>
                      <td className="px-8 py-5 text-center text-slate-400 font-bold">{item.total}</td>
                      <td className="px-8 py-5 text-center text-emerald-700 font-black">{item.hadir}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 shadow-sm ${item.percent > 75 ? 'bg-emerald-600' : item.percent > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-slate-700 w-10 text-right">{item.percent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'kegiatan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activityStats.map((act, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-emerald-800 transition-colors">{act.name}</h4>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-800 leading-none">{act.percent}%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Keaktifan</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${act.percent}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Partisipasi: {act.hadir} dari {act.total} Anggota</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'waktu' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px]">
              <h3 className="font-black text-slate-800 mb-8 uppercase tracking-tighter text-lg">Grafik Tren Kehadiran</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} unit="%" tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="percent" stroke="#065f46" strokeWidth={6} dot={{ r: 8, fill: '#065f46', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter">Riwayat Log Harian</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">* Diurutkan dari yang terbaru</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hari & Tanggal</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data Terkumpul</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rata-rata Hadir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(filteredRecords.reduce((acc: any, curr) => {
                      const d = new Date(curr.date);
                      const dateKey = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
                      if (!acc[dateKey]) acc[dateKey] = { total: 0, hadir: 0, rawDate: curr.date };
                      acc[dateKey].total++;
                      if (curr.status === 'Hadir') acc[dateKey].hadir++;
                      return acc;
                    }, {})).sort((a: any, b: any) => new Date(b[1].rawDate).getTime() - new Date(a[1].rawDate).getTime()).map(([key, d]: any) => (
                      <tr key={key} className="hover:bg-slate-50/50">
                        <td className="px-8 py-5 font-black text-slate-700">{formatDateFullIndo(d.rawDate)}</td>
                        <td className="px-8 py-5 text-center text-slate-400 font-bold">{d.total} Record</td>
                        <td className="px-8 py-5 text-center">
                          <span className="font-black text-emerald-800 text-lg">{Math.round((d.hadir / d.total) * 100)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-black text-slate-800 uppercase tracking-tighter">Detail Transaksi Presensi</h3>
          <span className="text-[10px] font-black bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-400 uppercase tracking-widest">{filteredRecords.length} Baris</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hari / Tanggal</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Anggota</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Kegiatan</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.slice(0, 50).map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-xs font-black text-slate-500 whitespace-nowrap">{formatDateFullIndo(r.date)}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-800">{r.memberName}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      r.status === 'Hadir' ? 'bg-emerald-700 text-white' :
                      r.status === 'Izin' ? 'bg-blue-600 text-white' :
                      r.status === 'Sakit' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">{r.kegiatan}</td>
                  <td className="px-8 py-5 text-right space-x-3 no-print">
                    <button 
                      onClick={() => handleEditRecord(r)}
                      className="text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteRecord(r.id)}
                      className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Icons.Search />
              </div>
              <p className="text-slate-400 font-bold italic">Data tidak ditemukan pada filter ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Koreksi Data Presensi</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingRecord.memberName}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleUpdateRecord} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Kehadiran</label>
                <div className="grid grid-cols-2 gap-2">
                  {ATTENDANCE_STATUS_OPTIONS.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditingRecord({ ...editingRecord, status: status as AttendanceStatus })}
                      className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        editingRecord.status === status 
                        ? 'bg-emerald-800 border-emerald-800 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Feedback / Catatan</label>
                <textarea 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-emerald-600 font-medium text-sm min-h-[100px] transition-all"
                  placeholder="Opsional: Tulis alasan izin atau feedback..."
                  value={editingRecord.feedback || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, feedback: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-emerald-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-900 transition-all">
                  Simpan Perubahan
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-5 text-xs font-black transition-all border-b-4 whitespace-nowrap uppercase tracking-widest ${
      active ? 'border-emerald-800 text-emerald-800 bg-emerald-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, color, total }: { label: string; value: number; color: string; total: number }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-100',
    blue: 'bg-blue-50 text-blue-900 border-blue-100',
    amber: 'bg-amber-50 text-amber-900 border-amber-100',
    red: 'bg-rose-50 text-rose-900 border-rose-100',
  };
  return (
    <div className={`${colorMap[color]} p-6 rounded-[2.5rem] border-2 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all`}>
      <div className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-black">{value}</div>
        <div className="text-[10px] font-black opacity-30 uppercase">{percentage}%</div>
      </div>
    </div>
  );
};

export default RecapView;