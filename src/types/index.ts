export type PowerType = 'none' | 'fire' | 'ice' | 'wind' | 'slow';

export type GameState = 'playing' | 'levelComplete' | 'gameOver';

export interface GameData {
  score: number;
  level: number;
  limitPct: number;
  progressPct: number;
  powerStack: PowerType[];
  wordsCompleted: number;
  wordsMissed: number;
  input: string;
  gameState: GameState;
}
