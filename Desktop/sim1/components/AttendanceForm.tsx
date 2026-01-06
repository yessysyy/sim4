
import React, { useState, useEffect } from 'react';
import { Member, AttendanceStatus, AttendanceRecord, Group } from '../types';
import { storageService } from '../services/storage';
import { ATTENDANCE_STATUS_OPTIONS, GROUPS, Icons } from '../constants';

interface Props {
  onBack: () => void;
}

const AttendanceForm: React.FC<Props> = ({ onBack }) => {
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group>('Wonokusumo 1');
  const [kegiatanList, setKegiatanList] = useState<string[]>([]);
  const [kegiatan, setKegiatan] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEvent, setIsEvent] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, { status: AttendanceStatus; feedback?: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const list = storageService.getKegiatan();
    setKegiatanList(list);
    if (list.length > 0) setKegiatan(list[0]);
  }, []);

  useEffect(() => {
    const all = storageService.getMembers();
    const active = all.filter(m => m.statusKeaktifan === 'Aktif' && m.group === selectedGroup);
    setActiveMembers(active);
    
    const initial: any = {};
    active.forEach(m => initial[m.id] = { status: 'Hadir' });
    setAttendance(initial);
  }, [selectedGroup]);

  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], status }
    }));
  };

  const handleFeedbackChange = (memberId: string, feedback: string) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], feedback }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records: Omit<AttendanceRecord, 'id' | 'timestamp'>[] = activeMembers.map(m => ({
      memberId: m.id,
      memberName: m.namaLengkap,
      group: m.group,
      date,
      kegiatan,
      status: attendance[m.id]?.status || 'Alfa',
      feedback: attendance[m.id]?.feedback,
    }));

    storageService.saveAttendance(records);
    setSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  const filteredMembers = activeMembers.filter(m => 
    m.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Presensi Berhasil Dikirim!</h2>
        <p className="text-slate-500">Terima kasih telah mengisi presensi kegiatan hari ini.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-slate-500 flex items-center gap-1 font-bold text-sm uppercase tracking-widest hover:text-emerald-700 transition-colors">
          ← Kembali
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Presensi Kegiatan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Config */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Kelompok</label>
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold bg-slate-50 focus:bg-white"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as Group)}
            >
              {GROUPS.map(g => <option key={g.name} value={g.name}>{g.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Kegiatan</label>
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold bg-slate-50 focus:bg-white"
              value={kegiatan}
              onChange={(e) => setKegiatan(e.target.value)}
              required
            >
              {kegiatanList.length === 0 && <option value="">Belum ada kegiatan</option>}
              {kegiatanList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal</label>
            <input 
              type="date"
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold bg-slate-50 focus:bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-3 pt-8">
            <input 
              type="checkbox" 
              id="isEvent" 
              checked={isEvent} 
              onChange={(e) => setIsEvent(e.target.checked)}
              className="w-6 h-6 rounded-lg border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer accent-emerald-600"
            />
            <label htmlFor="isEvent" className="text-slate-700 font-black text-sm uppercase tracking-tight cursor-pointer select-none">Event Khusus (Feedback On)</label>
          </div>
        </div>

        {/* List Peserta */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Daftar Anggota Aktif</h2>
            <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icons.Search />
                </div>
                <input 
                    type="text" 
                    placeholder="Cari nama peserta..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          <div className="space-y-3">
            {filteredMembers.map(m => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:border-emerald-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                      <div className="font-black text-slate-800">{m.namaLengkap}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.kategori} • {m.pendidikanTerakhir}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ATTENDANCE_STATUS_OPTIONS.map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(m.id, status as AttendanceStatus)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          attendance[m.id]?.status === status 
                          ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 scale-105' 
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                {isEvent && (
                  <div className="pt-2">
                    <textarea 
                      placeholder="Tulis kesan, pesan, atau usulan dari peserta..."
                      className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-300 min-h-[80px] font-medium transition-all focus:bg-white"
                      value={attendance[m.id]?.feedback || ''}
                      onChange={(e) => handleFeedbackChange(m.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Icons.Search />
                </div>
                <div className="font-bold">Peserta tidak ditemukan atau belum terdaftar aktif.</div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-4 z-10 pt-4">
          <button 
            type="submit"
            disabled={activeMembers.length === 0 || !kegiatan}
            className="w-full bg-emerald-800 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-900 transition-all shadow-2xl shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Submit Presensi Sekarang
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;
