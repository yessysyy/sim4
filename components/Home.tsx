
import React from 'react';
import { Icons } from '../constants';

interface HomeProps {
  onNavigate: (view: 'login' | 'attendance') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center p-4">
      {/* Hero Section */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] overflow-hidden shadow-2xl mt-4 mb-12 border border-slate-100">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-8 md:p-12 lg:p-16 space-y-6 lg:border-r border-slate-50">
            <div className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
              Dashboard Generasi Penerus
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 leading-none">
              Sistem Informasi <br /><span className="text-emerald-700">Remaja</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-lg">
              Solusi digital terpadu untuk pengelolaan database, monitoring keaktifan, dan presensi real-time pengajian Remaja secara akurat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={() => onNavigate('attendance')}
                className="bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20 active:scale-95 text-lg"
              >
                <Icons.Calendar />
                Presensi Peserta
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-95 text-lg"
              >
                Login Pengurus
              </button>
            </div>
          </div>
          
          <div className="lg:w-[35%] bg-gradient-to-br from-emerald-800 to-teal-950 p-12 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-20"></div>
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="text-6xl font-black text-white/10 select-none">SIMM</div>
              <div className="space-y-2">
                <div className="h-1.5 w-12 bg-yellow-400 mx-auto rounded-full"></div>
                <h3 className="text-3xl font-black tracking-tight">DATA CENTER</h3>
                <p className="text-emerald-100 font-medium uppercase tracking-[0.3em] text-xs">Pusat Informasi Terpadu</p>
              </div>
              <div className="pt-8 grid grid-cols-2 gap-4">
                <div className="text-center">
                   <div className="text-2xl font-black text-yellow-400">100%</div>
                   <div className="text-[10px] uppercase font-bold text-white/50">Digital</div>
                </div>
                <div className="text-center">
                   <div className="text-2xl font-black text-emerald-400">Realtime</div>
                   <div className="text-[10px] uppercase font-bold text-white/50">Reporting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <InfoCard 
          title="Database Digital" 
          desc="Semua data anggota tersentralisasi, aman, dan mudah diperbarui kapan saja untuk keperluan administrasi." 
          icon={<Icons.Users />}
          color="bg-blue-600"
        />
        <InfoCard 
          title="Presensi Cepat" 
          desc="Sistem absen yang ramah pengguna, cukup pilih nama dan status kehadiran untuk setiap kegiatan rutin." 
          icon={<Icons.Calendar />}
          color="bg-amber-600"
        />
      </div>
    </div>
  );
};

const InfoCard = ({ title, desc, icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group">
    <div className={`${color} text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default Home;
