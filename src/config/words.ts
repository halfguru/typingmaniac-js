const WORDS_BY_LENGTH: Record<number, string[]> = {
  3: ['cat', 'dog', 'sun', 'run', 'box', 'hat', 'red', 'big', 'top', 'cup', 'pen', 'map', 'bed', 'car', 'bus', 'sky', 'fly', 'sea', 'ice', 'key'],
  4: ['book', 'rain', 'star', 'moon', 'tree', 'bird', 'fish', 'wolf', 'jump', 'snow', 'gold', 'pink', 'dark', 'lamp', 'door', 'hand', 'foot', 'head', 'blue', 'cool', 'fast', 'warm', 'cold', 'high', 'deep', 'wide', 'long'],
  5: ['apple', 'dream', 'earth', 'heart', 'house', 'light', 'ocean', 'queen', 'river', 'water', 'cloud', 'green', 'music', 'night', 'plant', 'storm', 'tiger', 'watch', 'world', 'happy', 'crazy', 'brave', 'quick', 'smooth'],
  6: ['banana', 'castle', 'dragon', 'flower', 'forest', 'garden', 'island', 'jungle', 'kitten', 'market', 'number', 'purple', 'rabbit', 'silver', 'violet', 'yellow', 'orange', 'bridge', 'candle', 'button', 'bottle', 'balloon'],
  7: ['captain', 'diamond', 'eclipse', 'fantasy', 'giraffe', 'holiday', 'journey', 'kitchen', 'lantern', 'monster', 'network', 'package', 'quality', 'rainbow', 'silence', 'umbrella', 'village', 'warrior', 'penguin'],
  8: ['absolute', 'birthday', 'champion', 'dialogue', 'elephant', 'festival', 'grateful', 'hospital', 'innocent', 'junction', 'keyboard', 'language', 'marathon', 'national', 'obsidian', 'platform', 'question', 'republic', 'sandwich', 'treasure', 'universe', 'whisper'],
};

export function getWordsByLength(length: number): string[] {
  return WORDS_BY_LENGTH[length] || WORDS_BY_LENGTH[4];
}

export function getWordLengthForLevel(level: number): number {
  const minLen = 4 + Math.floor((level - 1) / 3);
  return Math.min(minLen, 8);
}

export function getWordPoolForLevel(level: number): string[] {
  const length = getWordLengthForLevel(level);
  return getWordsByLength(length);
}
