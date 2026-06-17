
import { Member, AttendanceRecord, Group } from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'simm_members',
  ATTENDANCE: 'simm_attendance',
  KEGIATAN: 'simm_kegiatan_list',
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxnIm9_Trdxpt39m92_dkuO5FORjNYLVJVsmFNfXIaLx6iqrFf7PCh2ODBfIYorXgT/exec';

const syncToGoogleSheet = async (type: 'MEMBER' | 'ATTENDANCE' | 'KEGIATAN', data: any) => {
  try {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data, timestamp: new Date().toISOString() })
    });
  } catch (error) {
    console.error("Gagal sinkronisasi ke Google Sheets:", error);
  }
};

export const storageService = {
  syncFromCloud: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_all`);
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      
      const cloudData = await response.json();
      
      if (cloudData.members) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(cloudData.members));
      }
      if (cloudData.attendance) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(cloudData.attendance));
      }
      if (cloudData.kegiatan) {
        localStorage.setItem(STORAGE_KEYS.KEGIATAN, JSON.stringify(cloudData.kegiatan));
      }
      return true;
    } catch (error) {
      console.warn("Sync otomatis gagal:", error);
      return false;
    }
  },

  getMembers: (): Member[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : [];
  },

  saveMember: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Member => {
    const members = storageService.getMembers();
    const now = new Date().toISOString();
    let updatedMember: Member;
    
    if (member.id) {
      const index = members.findIndex(m => m.id === member.id);
      updatedMember = { ...members[index], ...member, updatedAt: now } as Member;
      members[index] = updatedMember;
    } else {
      updatedMember = {
        ...member,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: now,
        updatedAt: now,
      } as Member;
      members.push(updatedMember);
    }
    
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    syncToGoogleSheet('MEMBER', updatedMember);
    return updatedMember;
  },

  deleteMember: (id: string) => {
    const members = storageService.getMembers().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },

  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

 saveAttendance: (records: Omit<AttendanceRecord, 'id' | 'timestamp'>[]): void => {
  const existing = storageService.getAttendance();

  records.forEach(record => {

    const index = existing.findIndex(
      r =>
        r.memberName === record.memberName &&
        r.date === record.date &&
        r.kegiatan === record.kegiatan
    );

    const newRecord = {
      ...record,
      id:
        index >= 0
          ? existing[index].id
          : Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    if (index >= 0) {
      // update data lama
      existing[index] = newRecord;
    } else {
      // tambah data baru
      existing.push(newRecord);
    }
  });

  localStorage.setItem(
    STORAGE_KEYS.ATTENDANCE,
    JSON.stringify(existing)
  );

  syncToGoogleSheet('ATTENDANCE', records);
},

  updateAttendanceRecord: (record: AttendanceRecord): void => {
    const attendance = storageService.getAttendance();
    const index = attendance.findIndex(r => r.id === record.id);
    if (index !== -1) {
      attendance[index] = record;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
      syncToGoogleSheet('ATTENDANCE', [record]);
    }
  },

  deleteAttendanceRecord: (id: string): void => {
    const attendance = storageService.getAttendance().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  },

  getKegiatan: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.KEGIATAN);
    if (!data) {
      const defaultList = ['Pengajian Rutin', 'Malam Keakraban', 'Anjangsana'];
      localStorage.setItem(STORAGE_KEYS.KEGIATAN, JSON.stringify(defaultList));
      return defaultList;
    }
    return JSON.parse(data);
  },

  saveKegiatan: (list: string[]) => {
    localStorage.setItem(STORAGE_KEYS.KEGIATAN, JSON.stringify(list));
    syncToGoogleSheet('KEGIATAN', list);
  },

  getStats: (group?: Group) => {
    const attendance = storageService.getAttendance();
    const filtered = group ? attendance.filter(a => a.group === group) : attendance;
    return {
      total: filtered.length,
      hadir: filtered.filter(a => a.status === 'Hadir').length,
      izin: filtered.filter(a => a.status === 'Izin').length,
      sakit: filtered.filter(a => a.status === 'Sakit').length,
      alfa: filtered.filter(a => a.status === 'Alfa').length,
    };
  }
};
