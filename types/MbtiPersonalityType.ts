import { PersonalityType as BasePersonalityType } from '../data/personalityTypes';

export interface MbtiPersonalityType extends BasePersonalityType {
  bgGradient: [string, string];
} 