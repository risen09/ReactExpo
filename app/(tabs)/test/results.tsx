import { useLocalSearchParams } from 'expo-router';
import { TestResultsScreen } from '../../screens/tests/TestResultsScreen';

export default function TestResultsPage() {
  const { testId, results } = useLocalSearchParams();
  return <TestResultsScreen testId={testId as string} results={JSON.parse(results as string)} />;
}