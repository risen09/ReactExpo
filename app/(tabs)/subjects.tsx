import { Stack } from 'expo-router';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import React from 'react';
export default function SubjectsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Выбор предмета',
          headerShown: false,
        }}
      />
      <SubjectSelectionScreen />
    </>
  );
} 