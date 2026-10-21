export type OperationType = 'multiplication' | 'division' | 'mixed';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface MathProblem {
  id: string;
  type: 'multiplication' | 'division';
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[]; // 4 candidate numbers (including correct answer)
  displayQuestion: string;
  stepExplanation: string[];
}

export interface SpaceshipModel {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  bulletColor: string;
  description: string;
}

export interface PlayerProfile {
  nickname: string;
  shipId: string;
  mode: OperationType;
  difficulty: DifficultyLevel;
  soundEnabled: boolean;
  autoShoot: boolean;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  mode: OperationType;
  accuracy: number;
  date: string;
  correctCount: number;
  totalCount: number;
  maxCombo: number;
  shipId: string;
}

export interface QuestionRecord {
  problem: MathProblem;
  userAnswer: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
}
