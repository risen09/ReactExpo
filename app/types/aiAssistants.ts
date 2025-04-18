// Общий тип для сообщения чата
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

// Интерфейсы для экспертного ассистента
export interface ExpertChat {
  id: string;
  subject: string;
  lastMessage: string;
  messages?: ChatMessage[];
}

// Интерфейсы для помощника по домашним заданиям
export interface HomeworkAssignment {
  id: string;
  subject: string;
  title: string;
  status: 'in_progress' | 'completed';
  lastMessage?: string;
  messages?: ChatMessage[];
  created_at?: string;
  completed_at?: string;
}

// Интерфейсы для учебных планов
export interface StudyPlan {
  plan_id: string;
  subject: string;
  goal: string;
  timeframe?: string;
  difficulty?: string;
  plan_content: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  created_at?: string;
  updated_at?: string;
}

// Интерфейсы для ассистента трека
export interface TrackAssistant {
  assistant_id: string;
  track_id: string;
  track_info?: {
    name: string;
    subject: string;
    topic?: string;
  };
  messages: ChatMessage[];
  created_at?: string;
  last_interaction?: string;
}

// Интерфейсы для анализа прогресса
export interface ProgressStats {
  trackName: string;
  subject: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  averageTestScore: number;
  totalLessonsTime: number; // в минутах
}

export interface ProgressAnalysis {
  progressStats: ProgressStats;
  analysis: string;
} 