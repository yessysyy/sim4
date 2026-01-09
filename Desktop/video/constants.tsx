
import { JudgingCriteria, Judge, VideoEntry } from './types';

export const JUDGING_CRITERIA_LIST = [
  { 
    id: JudgingCriteria.CREATIVITY, 
    description: "Seberapa unik konsep yang dibawakan dan kebaruan ide.", 
    weight: 0.2 
  },
  { 
    id: JudgingCriteria.CINEMATOGRAPHY, 
    description: "Komposisi gambar, pencahayaan, dan pergerakan kamera.", 
    weight: 0.2 
  },
  { 
    id: JudgingCriteria.EDITING, 
    description: "Pacing (tempo), transisi, dan penggunaan efek visual.", 
    weight: 0.15 
  },
  { 
    id: JudgingCriteria.STORYTELLING, 
    description: "Alur cerita, kejelasan pesan, dan keterikatan emosional.", 
    weight: 0.2 
  },
  { 
    id: JudgingCriteria.AUDIO, 
    description: "Kualitas suara, dubbing, latar musik, dan sound design.", 
    weight: 0.15 
  },
  { 
    id: JudgingCriteria.MESSAGE, 
    description: "Seberapa relevan video dengan tema lomba yang ditentukan.", 
    weight: 0.1 
  },
];

export const INITIAL_JUDGES: Judge[] = [
  { id: '1', name: 'Bpk. Syaifuddin' },
  { id: '2', name: 'Sdri. Yessy' },
  { id: '3', name: 'Sdr. Zeva' },
  { id: '4', name: 'Sdr. Rizal' },
  { id: '5', name: 'Sdr. Ilham' }
];

export const INITIAL_CATEGORIES: string[] = [
  'Film Pendek',
  'Dokumenter',
  'Musik Video',
  'Iklan Layanan Masyarakat'
];

export const INITIAL_ENTRIES: VideoEntry[] = [
  {
    id: 'e1',
    teamName: 'Tim Merdeka Visual',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    category: 'Film Pendek',
    uploadDate: '2024-05-10'
  },
  {
    id: 'e2',
    teamName: 'Studio Cahaya',
    videoUrl: 'https://www.w3schools.com/html/horse.mp4',
    category: 'Dokumenter',
    uploadDate: '2024-05-11'
  }
];
