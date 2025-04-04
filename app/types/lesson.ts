export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic';

export type Subject = 'mathematics' | 'physics' | 'chemistry' | 'biology';

export interface LessonStep {
  id: string;
  type: 'text' | 'video' | 'animation' | 'interactive';
  content: string;
  duration: number; // в минутах
}

export interface Practice {
  id: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  attempts: number;
  timeSpent: number; // в секундах
}

export interface Lesson {
  id: string;
  subject: Subject;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LessonStep[];
  practices: Practice[];
  estimatedTime: number; // в минутах
  completed: boolean;
  score: number;
}

export interface UserProgress {
  userId: string;
  completedLessons: string[]; // ID уроков
  learningStyle: LearningStyle;
  subjectProgress: Record<Subject, {
    level: number;
    totalScore: number;
    lessonsCompleted: number;
  }>;
  achievements: string[];
  totalPoints: number;
} 