import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { Lesson, Subject, LearningStyle } from '../../app/types/lesson';

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

export const generateLesson = createAsyncThunk<
  Lesson,
  { subject: Subject; learningStyle: LearningStyle },
  { state: RootState }
>(
  'lesson/generate',
  async ({ subject, learningStyle }) => {
    try {
      // TODO: Implement API call to OpenAI for lesson generation
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, learningStyle }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }
      
      return await response.json() as Lesson;
    } catch (error) {
      throw error;
    }
  }
);

const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {
    setCurrentLesson: (state: LessonState, action: PayloadAction<Lesson>) => {
      state.currentLesson = action.payload;
    },
    updateLessonProgress: (
      state: LessonState,
      action: PayloadAction<{ lessonId: string; completed: boolean; score: number }>
    ) => {
      const lesson = state.lessons.find((l: Lesson) => l.id === action.payload.lessonId);
      if (lesson) {
        lesson.completed = action.payload.completed;
        lesson.score = action.payload.score;
      }
    },
    clearCurrentLesson: (state: LessonState) => {
      state.currentLesson = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateLesson.pending, (state: LessonState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateLesson.fulfilled, (state: LessonState, action: PayloadAction<Lesson>) => {
        state.loading = false;
        state.lessons.push(action.payload);
        state.currentLesson = action.payload;
      })
      .addCase(generateLesson.rejected, (state: LessonState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate lesson';
      });
  },
});

export const { setCurrentLesson, updateLessonProgress, clearCurrentLesson } = lessonSlice.actions;
export default lessonSlice.reducer;

// Селекторы
export const selectCurrentLesson = (state: RootState) => state.lesson.currentLesson;
export const selectLessons = (state: RootState) => state.lesson.lessons;
export const selectLessonLoading = (state: RootState) => state.lesson.loading;
export const selectLessonError = (state: RootState) => state.lesson.error; 