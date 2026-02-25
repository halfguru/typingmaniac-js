export type PowerType = 'none' | 'fire' | 'ice' | 'wind' | 'slow';

export type GameState = 'playing' | 'levelComplete' | 'gameOver';

export interface Word {
  text: string;
  x: number;
  y: number;
  speed: number;
  frozen: boolean;
  power: PowerType;
}

export interface GameData {
  score: number;
  level: number;
  limitPct: number;
  progressPct: number;
  powerStack: PowerType[];
  wordsCompleted: number;
  wordsMissed: number;
}
