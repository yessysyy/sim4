
export enum JudgingCriteria {
  CREATIVITY = "Kreativitas & Orisinalitas",
  CINEMATOGRAPHY = "Sinematografi (Visual)",
  EDITING = "Editing & Teknik Post-Prod",
  STORYTELLING = "Storytelling & Narasi",
  AUDIO = "Kualitas Audio & Musik",
  MESSAGE = "Kesesuaian Pesan/Tema"
}

export type UserRole = 'admin' | 'judge';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface VideoEntry {
  id: string;
  teamName: string;
  videoUrl: string;
  videoBlobUrl?: string;
  category: string;
  uploadDate: string;
}

export interface ScoreSet {
  [key: string]: number; // Criteria Name: Score
}

export interface Assessment {
  id: string;
  entryId: string;
  judgeName: string;
  scores: ScoreSet;
  comment: string;
  timestamp: string;
}

export interface Judge {
  id: string;
  name: string;
}
