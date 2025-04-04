import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  const [ready, setReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setReady(true);
    }
  }, []);

  return ready;
} 