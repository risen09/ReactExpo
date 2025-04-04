import React from 'react';
import { Stack } from 'expo-router';
import ProfileScreen from '../screens/ProfileScreen';

export default function ProfileTab() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Профиль',
          headerShown: true,
        }}
      />
      <ProfileScreen />
    </>
  );
}