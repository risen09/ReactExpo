import { Stack } from 'expo-router';
import PracticeScreen from '../screens/PracticeScreen';
import React from 'react';
export default function PracticeTab() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Практика',
          headerShown: false,
        }}
      />
      <PracticeScreen />
    </>
  );
} 