import { Stack } from 'expo-router';


export const unstable_settings = {
  initialRouteName: 'index',
};


export default function LearningTracksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="[trackId]" options={{ href: null }} /> 
    </Stack>
  );
}
