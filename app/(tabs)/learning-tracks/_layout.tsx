import { router, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function LearningTracksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Треки',
          headerLeft: () => null,
        }} 
      />
      
      <Stack.Screen 
        name="[trackId]" 
        options={{ 
          title: '',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <ArrowLeft size={24} color="black" />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack>
  );
}
