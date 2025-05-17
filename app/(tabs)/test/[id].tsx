import { useLocalSearchParams } from 'expo-router';
import { TestScreen } from '../../screens/tests/TestScreen';

export default function TestPage() {
  const { id } = useLocalSearchParams();
  return <TestScreen testId={id as string} />;
}