import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Lesson {
  id: string;
  title: string;
  subject: string;
  progress: number;
  completed: boolean;
}

interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;
}

const initialState: LessonState = {
  lessons: [],
  currentLesson: null,
  loading: false,
  error: null,
};

const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {
    setLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.lessons = action.payload;
    },
    setCurrentLesson: (state, action: PayloadAction<Lesson>) => {
      state.currentLesson = action.payload;
    },
    updateLessonProgress: (
      state,
      action: PayloadAction<{ lessonId: string; progress: number }>
    ) => {
      const lesson = state.lessons.find((l) => l.id === action.payload.lessonId);
      if (lesson) {
        lesson.progress = action.payload.progress;
        lesson.completed = action.payload.progress === 100;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLessons,
  setCurrentLesson,
  updateLessonProgress,
  setLoading,
  setError,
} = lessonSlice.actions;
export default lessonSlice.reducer;