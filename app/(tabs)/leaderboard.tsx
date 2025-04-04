import { Stack } from 'expo-router';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import React from 'react';
export default function LeaderboardTab() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Таблица лидеров',
          headerShown: false,
        }}
      />
      <LeaderboardScreen />
    </>
  );
}