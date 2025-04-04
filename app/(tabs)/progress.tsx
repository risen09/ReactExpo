import { Stack } from 'expo-router';
import ProgressScreen from '../screens/ProgressScreen';
import React from 'react';

export default function ProgressTab() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Прогресс',
          headerShown: false,
        }}
      />
      <ProgressScreen />
    </>
  );
} 