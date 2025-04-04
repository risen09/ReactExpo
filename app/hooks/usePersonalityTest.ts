import { useState } from 'react';
import { TestSubmission, MBTIResult } from '../types/personalityTest';

// API configuration
const API_BASE_URL = 'https://j0cl9aplcsh5.share.zrok.io';

export function usePersonalityTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit test results
  const submitTestResults = async (testData: TestSubmission): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/personality-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit test results');
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error submitting test results:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's latest test results
  const getUserTestResults = async (userId: string): Promise<MBTIResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/personality-test/user/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No results found is not an error
          return null;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch test results');
      }
      
      const data = await response.json();
      return data.data ? {
        personalityType: data.data.personalityType,
        description: '', // This would be filled in the component
        scores: data.data.mbtiScores,
      } : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching test results:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    submitTestResults,
    getUserTestResults,
  };
} 