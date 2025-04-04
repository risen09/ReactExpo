import { Stack } from 'expo-router';
import React from 'react';
import AchievementsScreen from '../screens/AchievementsScreen';

export default function AchievementsTab() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Достижения',
          headerShown: false,
        }}
      />
      <AchievementsScreen />
    </>
  );
} 