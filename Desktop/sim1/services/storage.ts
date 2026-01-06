
import { Member, AttendanceRecord, Group } from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'simm_members',
  ATTENDANCE: 'simm_attendance',
  KEGIATAN: 'simm_kegiatan_list',
};

// URL Google Apps Script yang diberikan oleh user
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxiSVdltNGfx0cSxuTasYjXHGf2XwSFPThCuaTmWOenITetSeLrie_RxF60GEgtRzuw/exec';

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
    const newRecords = records.map(r => ({
      ...r,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }));
    
    const allRecords = [...existing, ...newRecords];
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allRecords));
    syncToGoogleSheet('ATTENDANCE', newRecords);
  },

  // Manajemen Daftar Kegiatan
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
