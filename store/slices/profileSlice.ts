import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  personalityType: string | null;
  learningProgress: {
    lessonsCompleted: number;
    averageScore: number;
  };
  preferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    subjects: string[];
  };
}

const initialState: ProfileState = {
  personalityType: null,
  learningProgress: {
    lessonsCompleted: 0,
    averageScore: 0,
  },
  preferences: {
    difficulty: 'beginner',
    subjects: [],
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setPersonalityType: (state, action: PayloadAction<string>) => {
      state.personalityType = action.payload;
    },
    updateLearningProgress: (
      state,
      action: PayloadAction<Partial<ProfileState['learningProgress']>>
    ) => {
      state.learningProgress = {
        ...state.learningProgress,
        ...action.payload,
      };
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<ProfileState['preferences']>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },
  },
});

export const { setPersonalityType, updateLearningProgress, updatePreferences } =
  profileSlice.actions;
export default profileSlice.reducer;