export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic';

export type Subject = 'mathematics' | 'physics' | 'chemistry' | 'biology';

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
  topic: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  assignments: Assignment[];
  estimatedTime: number; // в минутах
  completed: boolean;
}

export interface Assignment {
  id: string;
  question: string;
  difficulty: 1 | 2 | 3;
  solution?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface UserProgress {
  userId: string;
  completedLessons: string[]; // ID уроков
  learningStyle: LearningStyle;
  subjectProgress: Record<
    Subject,
    {
      level: number;
      totalScore: number;
      lessonsCompleted: number;
    }
  >;
  achievements: string[];
  totalPoints: number;
}
