import { MBTIScores } from '../types/personalityTest';

export function calculateMBTIScores(answers: Record<string, number>): MBTIScores {
  const scores: MBTIScores = {
    extraversion: 0,
    introversion: 0,
    sensing: 0,
    intuition: 0,
    thinking: 0,
    feeling: 0,
    judging: 0,
    perceiving: 0
  };

  // Process each answer
  Object.entries(answers).forEach(([questionId, value]) => {
    // Convert 1-5 scale to -2 to +2 scale
    // 1 -> -2, 2 -> -1, 3 -> 0, 4 -> 1, 5 -> 2
    const scaledValue = value - 3;
    
    if (questionId.startsWith('ei-')) {
      // For E/I questions
      if (scaledValue > 0) {
        scores.extraversion += Math.abs(scaledValue);
      } else if (scaledValue < 0) {
        scores.introversion += Math.abs(scaledValue);
      }
    } else if (questionId.startsWith('sn-')) {
      // For S/N questions
      if (scaledValue > 0) {
        scores.sensing += Math.abs(scaledValue);
      } else if (scaledValue < 0) {
        scores.intuition += Math.abs(scaledValue);
      }
    } else if (questionId.startsWith('tf-')) {
      // For T/F questions
      if (scaledValue > 0) {
        scores.thinking += Math.abs(scaledValue);
      } else if (scaledValue < 0) {
        scores.feeling += Math.abs(scaledValue);
      }
    } else if (questionId.startsWith('jp-')) {
      // For J/P questions
      if (scaledValue > 0) {
        scores.judging += Math.abs(scaledValue);
      } else if (scaledValue < 0) {
        scores.perceiving += Math.abs(scaledValue);
      }
    }
  });

  return scores;
}

export function determineMBTIType(scores: MBTIScores): string {
  let type = '';
  
  // Determine E or I
  type += scores.extraversion > scores.introversion ? 'E' : 'I';
  
  // Determine S or N
  type += scores.sensing > scores.intuition ? 'S' : 'N';
  
  // Determine T or F
  type += scores.thinking > scores.feeling ? 'T' : 'F';
  
  // Determine J or P
  type += scores.judging > scores.perceiving ? 'J' : 'P';
  
  return type;
}

export function calculateProgress(currentQuestion: number, totalQuestions: number): number {
  return Math.round((currentQuestion / totalQuestions) * 100);
} 