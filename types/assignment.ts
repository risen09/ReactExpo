
export interface Assignment {
  _id: string;
  title: string;
  tasks: Task[];
  lessonId: string;
}

export interface Task {
  task: string;
  solution: string;
}

export interface Submission {
  assignmentId: string;
  taskId: number;
  submission: string;
}

export interface SubmissionResponse {
  message: string;
  verdict: "correct" | "incorrect" | "partially_correct";
  feedback: string;
}
