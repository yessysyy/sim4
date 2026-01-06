
export type Role = 'Admin' | 'Ketua MM Wonokusumo 1' | 'Ketua MM Wonokusumo 2' | 'Ketua MM Kedung Mangu' | 'Ketua MM Kapas Jaya';

export type Group = 'Wonokusumo 1' | 'Wonokusumo 2' | 'Kedung Mangu' | 'Kapas Jaya';

export type Kesibukan = 'Sekolah' | 'Kerja' | 'Kuliah' | 'Kerja Kuliah' | 'Wirausaha';

export type StatusKeaktifan = 'Aktif' | 'Pindah' | 'Menikah' | 'Meninggal';

export type Pendidikan = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'D3' | 'D4' | 'S1' | 'S2' | 'S3';

export type Kategori = 'SMP' | 'SMA' | 'SMK' | 'Pra-Nikah';

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';

export interface User {
  id: string;
  username: string;
  role: Role;
  group?: Group;
}

export interface Member {
  id: string;
  namaLengkap: string;
  noWhatsApp: string;
  ttl: string;
  alamatRumah: string;
  namaAyah: string;
  namaIbu: string;
  jenisKelamin: JenisKelamin;
  kesibukan: Kesibukan;
  statusKeaktifan: StatusKeaktifan;
  pendidikanTerakhir: Pendidikan;
  kategori: Kategori;
  group: Group;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  group: Group;
  date: string;
  kegiatan: string;
  status: AttendanceStatus;
  feedback?: string;
  timestamp: string;
}

export interface AppState {
  currentUser: User | null;
  currentView: 'home' | 'login' | 'dashboard' | 'attendance' | 'database' | 'recap';
}
