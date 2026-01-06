
import React, { useMemo } from 'react';
import { User, Member } from '../types';
import { Icons, PENDIDIKAN_OPTIONS, GROUPS, KATEGORI_OPTIONS } from '../constants';
import { storageService } from '../services/storage';

interface DashboardProps {
  user: User;
  onNavigate: (view: 'database' | 'recap' | 'attendance') => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onLogout }) => {
  const allMembers = storageService.getMembers();
  
  // Filter data berdasarkan kelompok user jika bukan admin
  const members = useMemo(() => {
    if (user.role === 'Admin') return allMembers;
    return allMembers.filter(m => m.group === user.group);
  }, [allMembers, user]);

  const activeStats = useMemo(() => {
    const active = members.filter(m => m.statusKeaktifan === 'Aktif');
    
    const statsByEducation = PENDIDIKAN_OPTIONS.reduce((acc: any, p) => {
      acc[p] = active.filter(m => m.pendidikanTerakhir === p).length;
      return acc;
    }, {});

    const statsByGroup = GROUPS.reduce((acc: any, g) => {
      acc[g.name] = active.filter(m => m.group === g.name).length;
      return acc;
    }, {});

    const statsByCategory = KATEGORI_OPTIONS.reduce((acc: any, k) => {
      acc[k] = active.filter(m => m.kategori === k).length;
      return acc;
    }, {});

    return {
      totalActive: active.length,
      male: active.filter(m => m.jenisKelamin === 'Laki-laki').length,
      female: active.filter(m => m.jenisKelamin === 'Perempuan').length,
      education: statsByEducation,
      group: statsByGroup,
      category: statsByCategory
    };
  }, [members]);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-700 rounded-3xl flex items-center justify-center border border-emerald-800 shadow-lg">
             <span className="text-2xl font-black text-white">HI</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Assalamu'alaikum, {user.username}!</h1>
            <p className="text-slate-500 font-medium">Dashboard {user.role === 'Admin' ? 'Pusat' : `Kelompok ${user.group}`}.</p>
          </div>
        </div>
        <div className="bg-emerald-800 text-white px-6 py-4 rounded-3xl font-black text-sm flex items-center gap-3 shadow-lg shadow-emerald-700/20 border-l-4 border-yellow-400">
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
          {user.role}
        </div>
      </div>

      {/* Main Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MenuCard 
          title="Kelola Database" 
          description="Akses penuh data anggota, tambah personil baru, atau perbarui profil keaktifan anggota."
          icon={<Icons.Users />}
          color="bg-emerald-800"
          onClick={() => onNavigate('database')}
        />
        <MenuCard 
          title="Rekap Presensi" 
          description="Monitoring grafik kehadiran, analisis bulanan, dan cetak laporan evaluasi kegiatan."
          icon={<Icons.Chart />}
          color="bg-emerald-700"
          onClick={() => onNavigate('recap')}
        />
        <MenuCard 
          title="Form Presensi" 
          description="Buka sesi kehadiran untuk kegiatan hari ini. Proses absen cepat dan mudah."
          icon={<Icons.Calendar />}
          color="bg-emerald-600"
          onClick={() => onNavigate('attendance')}
        />
      </div>

      {/* Statistics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kesehatan Data Anggota {user.group ? `(${user.group})` : ''}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gender Stats */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between gap-8 h-full">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Komposisi Gender</span>
              <span className="text-emerald-800 font-black bg-emerald-50 px-3 py-1.5 rounded-full text-xs">{activeStats.totalActive} Total</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50/50 p-5 rounded-3xl border border-blue-100 flex flex-col items-center gap-2 group hover:bg-blue-50 transition-colors">
                <Icons.Male />
                <div className="text-3xl font-black text-blue-700">{activeStats.male}</div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Laki-laki</div>
              </div>
              <div className="flex-1 bg-pink-50/50 p-5 rounded-3xl border border-pink-100 flex flex-col items-center gap-2 group hover:bg-pink-50 transition-colors">
                <Icons.Female />
                <div className="text-3xl font-black text-pink-700">{activeStats.female}</div>
                <div className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Perempuan</div>
              </div>
            </div>
          </div>

          {/* Education Breakdown */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 col-span-1 md:col-span-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-6">Jenjang Pendidikan</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {PENDIDIKAN_OPTIONS.map(edu => (
                <div key={edu} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-center hover:bg-white hover:shadow-md transition-all group">
                  <div className="text-2xl font-black text-slate-700 group-hover:text-emerald-700 transition-colors">{activeStats.education[edu] || 0}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{edu}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-6">Distribusi Kategori</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {KATEGORI_OPTIONS.map(cat => (
                        <div key={cat} className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 text-center hover:bg-white hover:shadow-md transition-all group">
                            <div className="text-2xl font-black text-emerald-800">{activeStats.category[cat] || 0}</div>
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{cat}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Group Breakdown (Hanya muncul jika Admin) */}
            {user.role === 'Admin' && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-6">Data Per Kelompok</span>
                <div className="grid grid-cols-2 gap-4">
                    {GROUPS.map(g => (
                        <div key={g.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-all">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{g.label}</div>
                        <div className="text-xl font-black text-emerald-800">{activeStats.group[g.name] || 0}</div>
                        </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const MenuCard = ({ title, description, icon, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group text-left relative overflow-hidden flex flex-col items-start h-full"
  >
    <div className={`absolute -bottom-12 -right-12 w-32 h-32 ${color} opacity-5 rounded-full group-hover:scale-[3] transition-transform duration-700`}></div>
    
    <div className={`${color} text-white p-4 rounded-2xl mb-6 shadow-xl group-hover:scale-110 transition-transform relative z-10`}>
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-3 relative z-10">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-6 relative z-10 flex-grow">{description}</p>
    <div className="mt-auto flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-widest relative z-10">
      Buka Menu <span className="group-hover:translate-x-2 transition-transform">→</span>
    </div>
  </button>
);

export default Dashboard;
