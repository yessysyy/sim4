
import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, User, Group } from '../types';
import { storageService } from '../services/storage';
import { Icons, GROUPS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface Props {
  user: User;
  onBack: () => void;
}

type TabType = 'ringkasan' | 'individu' | 'kegiatan' | 'waktu';

const RecapView: React.FC<Props> = ({ user, onBack }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  // Default filter ke kelompok user, Admin bisa lihat 'Semua'
  const [filterGroup, setFilterGroup] = useState<Group | 'Semua'>(user.role === 'Admin' ? 'Semua' : (user.group || 'Semua'));
  const [filterDate, setFilterDate] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');

  useEffect(() => {
    const all = storageService.getAttendance();
    // Filter record dari awal jika bukan admin untuk keamanan tampilan
    if (user.role !== 'Admin' && user.group) {
      setRecords(all.filter(r => r.group === user.group));
    } else {
      setRecords(all);
    }
  }, [user]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchGroup = filterGroup === 'Semua' || r.group === filterGroup;
      const matchDate = !filterDate || r.date === filterDate;
      return matchGroup && matchDate;
    });
  }, [records, filterGroup, filterDate]);

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
      const month = new Date(r.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      if (!map[month]) map[month] = { total: 0, hadir: 0 };
      map[month].total++;
      if (r.status === 'Hadir') map[month].hadir++;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      hadir: data.hadir,
      percent: Math.round((data.hadir / data.total) * 100)
    }));
  }, [filteredRecords]);

  const chartData = [
    { name: 'Hadir', value: stats.hadir, color: '#10b981' },
    { name: 'Izin', value: stats.izin, color: '#3b82f6' },
    { name: 'Sakit', value: stats.sakit, color: '#f59e0b' },
    { name: 'Alfa', value: stats.alfa, color: '#ef4444' },
  ];

  const handleDownload = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (format === 'csv') {
      const headers = ['Tanggal', 'Kegiatan', 'Kelompok', 'Nama', 'Status', 'Feedback'];
      const rows = filteredRecords.map(r => [r.date, r.kegiatan, r.group, r.memberName, r.status, r.feedback || ''].join(','));
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rekap_presensi_${user.group || 'pusat'}_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
    setShowExportMenu(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <button onClick={onBack} className="text-emerald-600 font-medium hover:underline flex items-center gap-1 mb-2">
            ← Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Rekapitulasi {user.group || 'Muda-Mudi'}</h1>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => window.print()} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50 font-bold">
            <Icons.Print /> Cetak
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 shadow-md font-bold">
              <Icons.Download /> Simpan <span className="text-[10px] opacity-70">▼</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                <button onClick={() => handleDownload('xlsx')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-50 font-medium">Excel (.xlsx)</button>
                <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-50 font-medium">PDF (.pdf)</button>
                <button onClick={() => handleDownload('csv')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 font-medium">CSV (.csv)</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-6 items-end no-print">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Kelompok</label>
          <select 
            disabled={user.role !== 'Admin'}
            className="w-full md:w-56 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold disabled:bg-slate-50 disabled:text-slate-400"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value as any)}
          >
            {user.role === 'Admin' && <option value="Semua">Semua Kelompok</option>}
            {GROUPS.map(g => <option key={g.name} value={g.name}>{g.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Tanggal</label>
          <input 
            type="date" 
            className="w-full md:w-48 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        {user.role === 'Admin' && (
          <button onClick={() => { setFilterGroup('Semua'); setFilterDate(''); }} className="bg-slate-100 text-slate-500 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
            Reset Filter
          </button>
        )}
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Hadir" value={stats.hadir} color="emerald" total={stats.total} />
        <StatCard label="Izin" value={stats.izin} color="blue" total={stats.total} />
        <StatCard label="Sakit" value={stats.sakit} color="amber" total={stats.total} />
        <StatCard label="Alfa" value={stats.alfa} color="red" total={stats.total} />
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 no-print overflow-x-auto">
        <TabButton active={activeTab === 'ringkasan'} onClick={() => setActiveTab('ringkasan')} label="Grafik Umum" />
        <TabButton active={activeTab === 'individu'} onClick={() => setActiveTab('individu')} label="Ranking Anggota" />
        <TabButton active={activeTab === 'kegiatan'} onClick={() => setActiveTab('kegiatan')} label="Analisis Acara" />
        <TabButton active={activeTab === 'waktu'} onClick={() => setActiveTab('waktu')} label="Riwayat Tren" />
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'ringkasan' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[450px]">
            <h3 className="font-black text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-tight">
              <Icons.Chart /> Perbandingan Kehadiran
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'individu' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Ranking Keaktifan Anggota</h3>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Tinggi ke Rendah</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nama Peserta</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Sesi</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Hadir</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {individualStats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-5 font-black text-slate-800">{item.name}</td>
                      <td className="px-8 py-5 text-center text-slate-500 font-bold">{item.total}</td>
                      <td className="px-8 py-5 text-center text-emerald-600 font-black">{item.hadir}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${item.percent > 80 ? 'bg-emerald-500' : item.percent > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-slate-700 w-12">{item.percent}%</span>
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
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="font-black text-slate-800 text-xl tracking-tight">{act.name}</h4>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-700 leading-none">{act.percent}%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Hadir</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-tight">
                    <span>Partisipasi: {act.hadir} / {act.total} Anggota</span>
                  </div>
                  <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner">
                    <div className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30" style={{ width: `${act.percent}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'waktu' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[400px]">
              <h3 className="font-black text-slate-800 mb-8 uppercase tracking-tight">Tren Kehadiran Bulanan</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="percent" stroke="#10b981" strokeWidth={5} dot={{ r: 7, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 9, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Data Log Harian</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Hari / Tanggal</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Sesi Terhitung</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Rata-rata Hadir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(filteredRecords.reduce((acc: any, curr) => {
                      if (!acc[curr.date]) acc[curr.date] = { total: 0, hadir: 0 };
                      acc[curr.date].total++;
                      if (curr.status === 'Hadir') acc[curr.date].hadir++;
                      return acc;
                    }, {})).sort((a: any, b: any) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([tgl, d]: any) => (
                      <tr key={tgl} className="hover:bg-slate-50/50">
                        <td className="px-8 py-5 font-bold text-slate-700">{new Date(tgl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{d.total} Record</td>
                        <td className="px-8 py-5">
                          <span className="font-black text-emerald-600 text-lg">{Math.round((d.hadir / d.total) * 100)}%</span>
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

      {/* Raw Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
          <h3 className="font-black text-slate-800 uppercase tracking-tight">Rincian Riwayat Presensi</h3>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredRecords.length} Baris Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nama Peserta</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Kegiatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.slice(0, 100).map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{r.date}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800">{r.memberName}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      r.status === 'Hadir' ? 'bg-emerald-600 text-white' :
                      r.status === 'Izin' ? 'bg-blue-500 text-white' :
                      r.status === 'Sakit' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{r.kegiatan}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length > 100 && (
            <div className="p-4 text-center bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Gunakan filter atau ekspor untuk melihat seluruh data ({filteredRecords.length} total)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-5 text-sm font-black transition-all border-b-4 whitespace-nowrap uppercase tracking-widest ${
      active ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
    }`}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, color, total }: { label: string; value: number; color: string; total: number }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`${colorMap[color]} p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all`}>
      <div className="absolute right-0 top-0 p-5 opacity-5 group-hover:scale-150 transition-transform duration-700">
        <Icons.Chart />
      </div>
      <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-black">{value}</div>
        <div className="text-xs font-black opacity-40 uppercase tracking-tight">{percentage}%</div>
      </div>
    </div>
  );
};

export default RecapView;
