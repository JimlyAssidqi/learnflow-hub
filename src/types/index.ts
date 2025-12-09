export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'ppt' | 'video';
  fileName: string;
  fileSize: number;
  fileUrl: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  downloadCount: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  materialId?: string;
  teacherId: string;
  teacherName: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  createdAt: string;
  isPublished: boolean;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  text: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  points: number;
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
  id: string;
  mata_pelajaran: string;
  createdAt: string;
}
