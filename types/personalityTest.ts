export interface MBTIQuestion {
  id: string;
  category:
    | 'Extraversion vs. Introversion'
    | 'Sensing vs. Intuition'
    | 'Thinking vs. Feeling'
    | 'Judging vs. Perceiving';
  text: string;
}

export interface MBTIAnswer {
  questionId: string;
  value: number; // 1-5 scale
}

export interface MBTIScores {
  extraversion: number;
  introversion: number;
  sensing: number;
  intuition: number;
  thinking: number;
  feeling: number;
  judging: number;
  perceiving: number;
}

export interface MBTIResult {
  personalityType: string; // e.g., "INTJ", "ESTP"
  description: string;
  scores: MBTIScores;
}

export interface TestSubmission {
  userId: string;
  answers: Record<string, number>;
  personalityType: string;
  mbtiScores: MBTIScores;
}

export const mbtiDescriptions: Record<string, string> = {
  INTJ: 'Архитектор: стратегический мыслитель, который ценит логику, систему и оригинальность.',
  INTP: 'Логик: изобретательный мыслитель, ценящий знания, логику и глубокое понимание.',
  ENTJ: 'Командир: харизматичный лидер, фокусирующийся на эффективности и стратегии.',
  ENTP: 'Изобретатель: увлеченный мыслитель, любящий дебаты и инновации.',
  INFJ: 'Защитник: заботливый идеалист, ориентированный на смысл и глубокие связи.',
  INFP: 'Посредник: поэтичная и добросердечная личность, ценящая гармонию и аутентичность.',
  ENFJ: 'Наставник: вдохновляющий лидер, способный понимать и вдохновлять других.',
  ENFP: 'Борец: энтузиаст и свободный дух, ценящий возможности и глубокие связи.',
  ISTJ: 'Инспектор: надежный и практичный организатор, ценящий традиции и порядок.',
  ISFJ: 'Защитник: теплый и преданный хранитель традиций и близких отношений.',
  ESTJ: 'Руководитель: организованный и ответственный лидер, ценящий порядок и ясность.',
  ESFJ: 'Консул: дружелюбный и общительный человек, заботящийся о благополучии других.',
  ISTP: 'Виртуоз: практичный экспериментатор, который любит понимать, как работают вещи.',
  ISFP: 'Творец: творческая личность, живущая в гармонии с окружающим миром.',
  ESTP: 'Делец: энергичная и предприимчивая личность, действующая здесь и сейчас.',
  ESFP: 'Развлекатель: спонтанный и энергичный человек, любящий жить моментом.',
};
