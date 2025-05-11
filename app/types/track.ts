import { Schedule, Test } from "../models/LearningAgents";
import { Lesson } from "./lesson";

export interface Track {
  _id: string;
  name: string;
  description: string;
  subject: string;
  topic: string;
  createdAt: string;
  lessons: Lesson[];
  tests: Test[];
  schedule?: Schedule;
}
