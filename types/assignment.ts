export interface Assignment {
  _id: string;
  title: string;
  tasks: Task[];
  lessonId: string;
  submissions: Submission[];
}

export interface Task {
  task: string;
  solution: string;
}

export interface Submission {
  _id: string;
  assignment_id: string;
  task_index: number;
  submission: string;
  review: Review;
  feedback: string;
  submitted_at: Date;
}

export interface Review {
  verdict: string;
}

export interface SubmissionResponse {
  message: string;
  verdict: "correct" | "incorrect" | "partially_correct";
  feedback: string;
}
