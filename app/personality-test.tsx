import React from 'react';
import { Stack } from 'expo-router';
import PersonalityTestScreen from './screens/PersonalityTestScreen';

export default function PersonalityTest() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Тест личности MBTI',
          headerShown: true,
        }}
      />
      <PersonalityTestScreen />
    </>
  );
} 