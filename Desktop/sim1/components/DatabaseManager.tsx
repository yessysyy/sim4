
import React, { useState, useEffect, useRef } from 'react';
import { Member, User, Group, Kesibukan, StatusKeaktifan, Pendidikan, Kategori, JenisKelamin } from '../types';
import { storageService } from '../services/storage';
import { KESIBUKAN_OPTIONS, STATUS_KEAKTIFAN_OPTIONS, PENDIDIKAN_OPTIONS, KATEGORI_OPTIONS, JENIS_KELAMIN_OPTIONS, GROUPS, Icons } from '../constants';

interface Props {
  user: User;
  onBack: () => void;
}

type DBTab = 'members' | 'kegiatan';

const DatabaseManager: React.FC<Props> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<DBTab>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kegiatan State
  const [kegiatanList, setKegiatanList] = useState<string[]>([]);
  const [newKegiatan, setNewKegiatan] = useState('');

  // Form State Anggota
  const [formData, setFormData] = useState<Partial<Member>>({
    namaLengkap: '',
    noWhatsApp: '',
    ttl: '',
    alamatRumah: '',
    namaAyah: '',
    namaIbu: '',
    jenisKelamin: 'Laki-laki',
    kesibukan: 'Kuliah',
    statusKeaktifan: 'Aktif',
    pendidikanTerakhir: 'SMA',
    kategori: 'SMA',
    group: (user.group || 'Wonokusumo 1') as Group,
  });

  useEffect(() => {
    refreshData();
    setKegiatanList(storageService.getKegiatan());
  }, [user.group]);

  const refreshData = () => {
    const all = storageService.getMembers();
    const filtered = user.role === 'Admin' ? all : all.filter(m => m.group === user.group);
    setMembers(filtered);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveMember(formData as Member);
    setEditingMember(null);
    setIsFormOpen(false);
    resetForm();
    refreshData();
  };

  const handleEditMember = (m: Member) => {
    setEditingMember(m);
    setFormData(m);
    setIsFormOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      storageService.deleteMember(id);
      refreshData();
    }
  };

  const resetForm = () => {
    setFormData({
      namaLengkap: '',
      noWhatsApp: '',
      ttl: '',
      alamatRumah: '',
      namaAyah: '',
      namaIbu: '',
      jenisKelamin: 'Laki-laki',
      kesibukan: 'Kuliah',
      statusKeaktifan: 'Aktif',
      pendidikanTerakhir: 'SMA',
      kategori: 'SMA',
      group: (user.group || 'Wonokusumo 1') as Group,
    });
  };

  // Kegiatan Logic
  const handleAddKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKegiatan.trim()) return;
    const newList = [...kegiatanList, newKegiatan.trim()];
    setKegiatanList(newList);
    storageService.saveKegiatan(newList);
    setNewKegiatan('');
  };

  const handleDeleteKegiatan = (k: string) => {
    if (confirm(`Hapus kegiatan "${k}"?`)) {
      const newList = kegiatanList.filter(item => item !== k);
      setKegiatanList(newList);
      storageService.saveKegiatan(newList);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Nama Lengkap', 'No WhatsApp', 'TTL', 'Alamat Rumah', 
      'Nama Ayah', 'Nama Ibu', 'Jenis Kelamin', 'Kesibukan', 'Status Keaktifan', 
      'Pendidikan Terakhir', 'Kategori', 'Kelompok'
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_database_mudamudi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1);
      
      let count = 0;
      rows.forEach(row => {
        const cols = row.split(',').map(c => c.trim());
        if (cols.length >= 12 && cols[0]) {
          storageService.saveMember({
            namaLengkap: cols[0],
            noWhatsApp: cols[1],
            ttl: cols[2],
            alamatRumah: cols[3],
            namaAyah: cols[4],
            namaIbu: cols[5],
            jenisKelamin: cols[6] as any,
            kesibukan: cols[7] as any,
            statusKeaktifan: cols[8] as any,
            pendidikanTerakhir: cols[9] as any,
            kategori: cols[10] as any,
            group: cols[11] as any,
          });
          count++;
        }
      });
      
      alert(`Berhasil mengimpor ${count} data anggota.`);
      refreshData();
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const filteredMembers = members.filter(m => 
    m.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alamatRumah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={onBack} className="text-emerald-600 font-medium hover:underline flex items-center gap-1 mb-2">
            ← Kembali ke Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Data</h1>
        </div>
        
        {activeTab === 'members' && (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleDownloadTemplate}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Icons.Download /> Format
            </button>
            <button 
              onClick={handleUploadClick}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Icons.Upload /> Upload
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv" 
              className="hidden" 
            />
            <button 
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>+</span> Tambah Anggota
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('members')}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'members' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'
          }`}
        >
          Database Anggota
        </button>
        {user.role === 'Admin' && (
          <button 
            onClick={() => setActiveTab('kegiatan')}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'kegiatan' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'
            }`}
          >
            Kelola Daftar Kegiatan
          </button>
        )}
      </div>

      {activeTab === 'members' ? (
        <div className="space-y-6">
          {/* Search & Stats */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icons.Search />
              </div>
              <input 
                type="text" 
                placeholder="Cari nama atau alamat..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-slate-500 text-sm whitespace-nowrap">
              Menampilkan <span className="font-bold text-emerald-600">{filteredMembers.length}</span> orang
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">L/P</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pendidikan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kesibukan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kelompok</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{m.namaLengkap}</div>
                        <div className="text-xs text-slate-400">{m.noWhatsApp}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          m.statusKeaktifan === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {m.statusKeaktifan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.pendidikanTerakhir}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.kesibukan}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.group}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEditMember(m)} className="text-blue-500 hover:text-blue-700 font-bold text-sm">Edit</button>
                        <button onClick={() => handleDeleteMember(m.id)} className="text-red-500 hover:text-red-700 font-bold text-sm">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Tambah Kegiatan Baru</h2>
            <form onSubmit={handleAddKegiatan} className="flex gap-3">
              <input 
                type="text" 
                placeholder="Contoh: Pengajian Akhir Bulan"
                className="flex-1 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-emerald-600 transition-all font-bold"
                value={newKegiatan}
                onChange={(e) => setNewKegiatan(e.target.value)}
              />
              <button className="bg-emerald-700 text-white px-8 rounded-2xl font-black hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 active:scale-95 transition-all">
                Tambah
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6">Daftar Kegiatan Aktif</h2>
            <div className="space-y-3">
              {kegiatanList.map((k, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all">
                  <span className="font-bold text-slate-700">{k}</span>
                  <button 
                    onClick={() => handleDeleteKegiatan(k)}
                    className="text-red-400 hover:text-red-600 transition-colors p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              ))}
              {kegiatanList.length === 0 && (
                <div className="text-center py-12 text-slate-400 italic">Belum ada daftar kegiatan. Tambahkan di atas.</div>
              )}
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              * Daftar ini akan muncul sebagai pilihan di dropdown "Pilih Kegiatan" pada form presensi untuk semua pengurus.
            </p>
          </div>
        </div>
      )}

      {/* Modal Form Anggota */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {editingMember ? 'Update Data Anggota' : 'Input Data Anggota Baru'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleSaveMember} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Nama Lengkap" value={formData.namaLengkap} onChange={(v: string) => setFormData({...formData, namaLengkap: v})} required />
                <InputGroup label="No WhatsApp" value={formData.noWhatsApp} onChange={(v: string) => setFormData({...formData, noWhatsApp: v})} required />
                <InputGroup label="TTL (cth: Surabaya, 01-01-2000)" value={formData.ttl} onChange={(v: string) => setFormData({...formData, ttl: v})} required />
                <InputGroup label="Alamat Rumah" value={formData.alamatRumah} onChange={(v: string) => setFormData({...formData, alamatRumah: v})} required />
                <InputGroup label="Nama Ayah" value={formData.namaAyah} onChange={(v: string) => setFormData({...formData, namaAyah: v})} />
                <InputGroup label="Nama Ibu" value={formData.namaIbu} onChange={(v: string) => setFormData({...formData, namaIbu: v})} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SelectGroup label="Jenis Kelamin" options={JENIS_KELAMIN_OPTIONS} value={formData.jenisKelamin} onChange={(v: string) => setFormData({...formData, jenisKelamin: v as any})} />
                <SelectGroup label="Kesibukan" options={KESIBUKAN_OPTIONS} value={formData.kesibukan} onChange={(v: string) => setFormData({...formData, kesibukan: v as any})} />
                <SelectGroup label="Status Keaktifan" options={STATUS_KEAKTIFAN_OPTIONS} value={formData.statusKeaktifan} onChange={(v: string) => setFormData({...formData, statusKeaktifan: v as any})} />
                <SelectGroup label="Pendidikan" options={PENDIDIKAN_OPTIONS} value={formData.pendidikanTerakhir} onChange={(v: string) => setFormData({...formData, pendidikanTerakhir: v as any})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectGroup label="Kategori" options={KATEGORI_OPTIONS} value={formData.kategori} onChange={(v: string) => setFormData({...formData, kategori: v as any})} />
                {user.role === 'Admin' && (
                  <SelectGroup 
                    label="Kelompok" 
                    options={GROUPS.map(g => g.name)} 
                    value={formData.group} 
                    onChange={(v: string) => setFormData({...formData, group: v as any})} 
                  />
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">
                  {editingMember ? 'Simpan Perubahan' : 'Simpan Data'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="px-6 bg-slate-100 text-slate-600 rounded-xl font-bold"
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

const InputGroup = ({ label, value, onChange, required }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

const SelectGroup = ({ label, options, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
    <select 
      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default DatabaseManager;
