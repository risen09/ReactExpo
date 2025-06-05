import { Lesson } from './lesson';
import { Test } from '../models/LearningAgents';

export interface Schedule {
  days: { date: string; lessons: string[] }[];
}

export interface Track {
  _id: string;
  name: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  expectedDuration: number;
  createdAt: string;
  lessons: Lesson[];
  progress: number;
  tests: Test[];
  schedule?: Schedule;
}
