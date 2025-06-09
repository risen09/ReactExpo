import { router, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function LearningTracksLayout() {
  return (
    <Stack>
    {/* Главный экран - без кнопки назад */}
    <Stack.Screen 
      name="index" 
      options={{ 
        title: 'Треки',
        headerLeft: () => null,
      }} 
    />
    
    {/* Детали трека - с кнопкой назад */}
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
