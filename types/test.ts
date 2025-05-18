export type Question = {
    sub_topic: string;
    grade: number;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
};

export interface TestResponse {
    _id: string;
    testTitle: string;
    subject: string;
    topic: string;
    grade: number;
    difficulty: string;
    questions: Question[];
    userAnswers: any[];
    completed: boolean;
    score: number | null;
    createdAt: string;
}

export interface TestInitialResponse {
    testId: string;
}

export interface TestResultsScreenProps {
    testId: string;
    results: {
      assessedLevel: string;
      correctAnswers: number;
      learningTrackId: string;
      results: Array<{
        explanation: string;
        isCorrect: boolean;
        questionIndex: number;
        selectedOption: {
          questionId: string;
          selectedOption: number;
        };
      }>;
      score: number;
      totalQuestions: number;
    };
  }