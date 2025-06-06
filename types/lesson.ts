import { Assignment } from '@/types/assignment';
import { z } from 'zod';
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

const LessonBaseBlockSchema = z.object({
    blockType: z.enum(["paragraph", "quiz", "plot", "assignmentcs"]).describe("Тип блока"),
});

const LessonParagraphBlockSchema = LessonBaseBlockSchema.extend({
    blockType: z.literal("paragraph"),
    content: z.string().describe("Содержимое параграфа"),
});

const LessonQuizBlockSchema = LessonBaseBlockSchema.extend({
    blockType: z.literal("quiz"),
    quizData: z.object({
        question: z.string().describe("Текст вопроса"),
        answers: z.array(z.string()).describe("Варианты ответов"),
        correctAnswer: z.number().describe("Индекс правильного ответа"),
        explanation: z.string().describe("Объяснение ответа"),
    }).describe("Данные для вопроса"),
});

const LessonPlotBlockSchema = LessonBaseBlockSchema.extend({
    blockType: z.literal('plot'),
    plotData: z.object({
        plotType: z.enum(['line', 'bar', 'scatter', 'pie']).describe("Тип графика"),
        title: z.string().describe("Название графика"),
        xlabel: z.string().describe("Ось X графика"),
        ylabel: z.string().describe("Ось Y графика"),
        // Data can be a generic array of numbers or objects, depending on complexity
        // For simplicity, let's assume an array of objects with x, y for line/scatter
        // Or an array of numbers for bar/pie (with labels)
        series: z.array(z.object({
            name: z.string(),
            points: z.array(z.object({
                x: z.number(),
                y: z.number(),
            })),
        }))
    }).describe("Данные для построения графика")
});

const LessonAssignmentBlockSchema = LessonBaseBlockSchema.extend({
    blockType: z.literal("assignment"),
    assignmentData: z.object({
        _id: z.string().optional().describe("ID задания"),
        title: z.string().default("Домашнее задание"),
        tasks: z.array(z.object({
            task: z.string().describe("Текст задания"),
            solution: z.string().optional().describe("Решение задания"),
        })).describe("Задачи для выполнения"),
    }).describe("**Обязательный** блок для домашнего задания"),
});

const LessonBlockSchema = z.discriminatedUnion("blockType", [
    LessonParagraphBlockSchema,
    LessonQuizBlockSchema,
    LessonPlotBlockSchema,
    LessonAssignmentBlockSchema,
]);

export type LessonBlock = z.infer<typeof LessonBlockSchema>;

export interface Lesson {
  _id: string;
  title: string;
  subject: Subject;
  topic: string;
  sub_topic: string;
  content: LessonBlock[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  assignment_id?: string;
  estimatedTime?: number; // в минутах
  completed?: boolean;
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
