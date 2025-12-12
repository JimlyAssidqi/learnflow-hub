export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface UserForAdmin {
  id: number;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Material {
  id?: number;
  mata_pelajaran_id: number;
  teacher_id: string | number;
  title: string;
  description: string;
  file: string; // saat GET: url/path file
  file_type?: 'pdf' | 'ppt' | 'video';
  fileName?: string;
  fileSize?: number;
  file_url?: string;
  teacherName?: string;
  createdAt?: string;
  downloadCount?: number;
  subjectId?: string;
  subjectName?: string;
}


export interface Quiz {
  id?: string;
  id_guru?: string;
  id_matapelajaran?: number;
  judul_kuis?: string;
  teacherName?: string;
  subjectName?: string;
  timeLimit?: number;
  createdAt?: string;
  isPublished?: boolean;
}

export interface KuisData {
  id_guru: number;
  id_matatpelajaran: number;
  judul: string;
}

export interface Question {
  id?: string;
  id_kuis: string;
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: string;
  skor_soal: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: { questionId: string; answer: string }[];
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  materialId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  materialId?: string;
  quizId?: string;
  type: 'material_view' | 'material_download' | 'quiz_attempt';
  completedAt: string;
  score?: number;
}

export interface OfflineMaterial {
  id: string;
  materialId: string;
  title: string;
  fileName: string;
  fileBlob: Blob;
  cachedAt: string;
}

export interface Subject {
  id: number;
  mata_pelajaran: string;
  createdAt: string;
}
