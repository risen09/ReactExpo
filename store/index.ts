import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import lessonReducer from './slices/lessonSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    lesson: lessonReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;