export type Role = 'USER' | 'ADMIN';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type InterviewStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  topic: string;
  estimatedTime: number;
  companies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  title: string;
  userId: string;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  questionId: string;
  interviewId?: string;
  codeAnswer?: string;
  audioAnswerUrl?: string;
  feedback?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
}
