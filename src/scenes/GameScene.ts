import Phaser from 'phaser';
import type { PowerType, GameState as GState } from '../types';
import {
  GAME_AREA_WIDTH,
  DANGER_ZONE_Y,
  BASE_FALL_SPEED,
  SPAWN_DELAY_BASE,
  LIMIT_PCT_PER_MISSED,
  PROGRESS_PCT_PER_WORD,
  POWER_DROP_RATE_BASE,
  POWER_DROP_RATE_PER_LEVEL,
  POWER_DROP_RATE_MAX,
  POWER_DURATION_ICE,
  POWER_DURATION_SLOW,
  SLOW_FACTOR,
  FIRE_POINTS_PER_WORD,
  POWER_KEYS,
  FONT_FAMILY,
  FONT_SIZE,
  COLORS,
} from '../config/constants';
import { getWordPoolForLevel } from '../config/words';

interface WordObject {
  text: Phaser.GameObjects.Text;
  textValue: string;
  x: number;
  y: number;
  speed: number;
  frozen: boolean;
  power: PowerType;
  container?: Phaser.GameObjects.Rectangle;
  letters: Phaser.GameObjects.Text[];
}

export class GameScene extends Phaser.Scene {
  words: WordObject[] = [];
  typedInput = '';
  score = 0;
  level = 1;
  limitPct = 0;
  progressPct = 0;
  powerStack: PowerType[] = [];
  wordsCompleted = 0;
  wordsMissed = 0;
  gameState: GState = 'playing';
  spawnTimer = 0;
  slowFactor = 1;
  powerTimer = 0;
  activePower: PowerType = 'none';
  inputText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.drawDangerZone();
    this.drawInputArea();
    this.input.keyboard!.on('keydown', this.handleKeyDown, this);
    this.scene.launch('UIScene');
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  getGameData() {
    return {
      score: this.score,
      level: this.level,
      limitPct: this.limitPct,
      progressPct: this.progressPct,
      powerStack: this.powerStack,
      wordsCompleted: this.wordsCompleted,
      wordsMissed: this.wordsMissed,
      input: this.typedInput,
      gameState: this.gameState,
    };
  }

  drawDangerZone() {
    this.add.rectangle(GAME_AREA_WIDTH / 2, DANGER_ZONE_Y + 2, GAME_AREA_WIDTH, 4, COLORS.DANGER);
  }

  drawInputArea() {
    const containerW = 400;
    const containerH = 40;
    const containerX = GAME_AREA_WIDTH / 2 - containerW / 2;
    const containerY = 650;

    this.add.rectangle(containerX + containerW / 2, containerY + containerH / 2, containerW, containerH, COLORS.BG_PANEL);

    this.inputText = this.add.text(GAME_AREA_WIDTH / 2, containerY + containerH / 2 + 8, '', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE}px`,
      color: '#4fc3f7',
    });
    this.inputText.setOrigin(0.5, 0.5);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.gameState === 'gameOver') {
      if (event.code === 'Space') {
        this.resetGame();
      }
      return;
    }

    if (this.gameState === 'levelComplete') {
      if (event.code === 'Enter') {
        this.continueAfterLevelComplete();
      }
      return;
    }

    if (event.key === 'Backspace') {
      this.typedInput = this.typedInput.slice(0, -1);
      this.updateInputDisplay();
      return;
    }

    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
      this.typedInput += event.key.toLowerCase();
      this.updateInputDisplay();
      this.checkWordMatch();
    }
  }

  updateInputDisplay() {
    this.inputText.setText(this.typedInput.toUpperCase());
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  checkWordMatch() {
    const powerType = POWER_KEYS[this.typedInput.toUpperCase()];
    if (powerType && this.hasPowerInStack(powerType)) {
      this.activatePower(powerType);
      this.typedInput = '';
      this.updateInputDisplay();
      return;
    }

    const targetWord = this.findTargetWord();
    if (targetWord && targetWord.textValue.toLowerCase() === this.typedInput.toLowerCase()) {
      this.onWordComplete(targetWord);
    }
  }

  hasPowerInStack(power: PowerType): boolean {
    return this.powerStack.includes(power);
  }

  removePowerFromStack(power: PowerType) {
    const idx = this.powerStack.indexOf(power);
    if (idx >= 0) {
      this.powerStack.splice(idx, 1);
    }
  }

  activatePower(power: PowerType) {
    this.removePowerFromStack(power);
    this.activePower = power;

    switch (power) {
      case 'fire':
        this.score += this.words.length * FIRE_POINTS_PER_WORD;
        this.words.forEach(w => {
          w.letters.forEach(l => l.destroy());
          w.container?.destroy();
        });
        this.words = [];
        break;
      case 'ice':
        this.words.forEach(w => {
          w.frozen = true;
        });
        this.powerTimer = POWER_DURATION_ICE;
        break;
      case 'slow':
        this.slowFactor = SLOW_FACTOR;
        this.powerTimer = POWER_DURATION_SLOW;
        break;
      case 'wind':
        this.limitPct = 0;
        break;
    }

    this.events.emit('gameDataUpdate', this.getGameData());
  }

  findTargetWord(): WordObject | null {
    let target: WordObject | null = null;
    let targetY = -1;

    for (const word of this.words) {
      if (word.textValue.toLowerCase().startsWith(this.typedInput.toLowerCase())) {
        if (word.y > targetY) {
          targetY = word.y;
          target = word;
        }
      }
    }

    return target;
  }

  onWordComplete(word: WordObject) {
    const points = word.textValue.length * 10;
    this.score += points;
    this.wordsCompleted++;
    this.progressPct += PROGRESS_PCT_PER_WORD;
    if (this.progressPct > 100) this.progressPct = 100;

    if (word.power !== 'none' && this.powerStack.length < 6) {
      this.powerStack.push(word.power);
    }

    word.letters.forEach(l => l.destroy());
    word.container?.destroy();
    this.words = this.words.filter(w => w !== word);

    this.typedInput = '';
    this.updateInputDisplay();

    if (this.progressPct >= 100) {
      this.gameState = 'levelComplete';
    }

    this.events.emit('gameDataUpdate', this.getGameData());
  }

  update(_time: number, delta: number) {
    if (this.gameState !== 'playing') return;

    this.updatePowerTimer(delta);
    this.spawnWords(delta);
    this.moveWords(delta);
    this.checkMissedWords();
    this.highlightTargetWord();
  }

  updatePowerTimer(delta: number) {
    if (this.powerTimer > 0) {
      this.powerTimer -= delta;
      if (this.powerTimer <= 0) {
        this.activePower = 'none';
        this.slowFactor = 1;
        this.words.forEach(w => {
          w.frozen = false;
        });
      }
    }
  }

  spawnWords(delta: number) {
    this.spawnTimer += delta;
    const spawnDelay = Math.max(SPAWN_DELAY_BASE - this.level * 5, 30) * (1000 / 60);

    if (this.spawnTimer >= spawnDelay) {
      this.spawnTimer = 0;
      this.createWord();
    }
  }

  createWord() {
    const pool = getWordPoolForLevel(this.level);
    const textValue = pool[Math.floor(Math.random() * pool.length)];
    const speed = (BASE_FALL_SPEED + (this.level - 1) * 0.15) * (0.8 + Math.random() * 0.4);

    let power: PowerType = 'none';
    const dropRate = Math.min(POWER_DROP_RATE_BASE + (this.level - 1) * POWER_DROP_RATE_PER_LEVEL, POWER_DROP_RATE_MAX);
    if (Math.random() < dropRate) {
      const powers: PowerType[] = ['fire', 'ice', 'wind', 'slow'];
      power = powers[Math.floor(Math.random() * powers.length)];
    }

    const x = Math.random() * (GAME_AREA_WIDTH - 150) + 20;
    const y = -30;

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE}px`,
      color: '#ffffff',
    };

    const letters: Phaser.GameObjects.Text[] = [];
    let letterX = x;
    for (const char of textValue.toUpperCase()) {
      const letterText = this.add.text(letterX, y, char, style);
      letters.push(letterText);
      letterX += letterText.width;
    }

    const totalWidth = letterX - x;
    let container: Phaser.GameObjects.Rectangle | undefined;
    if (power !== 'none') {
      const powerColors: Record<PowerType, number> = {
        none: 0,
        fire: COLORS.POWER_FIRE,
        ice: COLORS.POWER_ICE,
        wind: COLORS.POWER_WIND,
        slow: COLORS.POWER_SLOW,
      };
      const padding = 8;
      container = this.add.rectangle(
        x + totalWidth / 2,
        y + 13,
        totalWidth + padding * 2,
        26,
        powerColors[power]
      );
      letters.forEach(l => l.setDepth(1));
    }

    const placeholderText = this.add.text(x, y, '', style);

    this.words.push({
      text: placeholderText,
      textValue,
      x,
      y,
      speed,
      frozen: false,
      power,
      container,
      letters,
    });
  }

  moveWords(delta: number) {
    const deltaSec = delta / 1000;
    for (const word of this.words) {
      if (!word.frozen) {
        word.y += word.speed * this.slowFactor * 60 * deltaSec;
        word.letters.forEach(l => l.setY(word.y));
        word.container?.setY(word.y + 13);
      }
    }
  }

  checkMissedWords() {
    const toRemove: WordObject[] = [];

    for (const word of this.words) {
      if (word.y >= DANGER_ZONE_Y) {
        this.wordsMissed++;
        this.limitPct += LIMIT_PCT_PER_MISSED;
        if (this.limitPct >= 100) {
          this.limitPct = 100;
          this.gameState = 'gameOver';
        }
        toRemove.push(word);
      }
    }

    for (const word of toRemove) {
      word.letters.forEach(l => l.destroy());
      word.container?.destroy();
      this.words = this.words.filter(w => w !== word);
    }

    if (toRemove.length > 0) {
      this.events.emit('gameDataUpdate', this.getGameData());
    }
  }

  highlightTargetWord() {
    for (const word of this.words) {
      const isTarget = this.typedInput !== '' && 
        word.textValue.toLowerCase().startsWith(this.typedInput.toLowerCase()) &&
        word === this.findTargetWord();
      
      const matchedLen = isTarget ? this.typedInput.length : 0;
      
      for (let i = 0; i < word.letters.length; i++) {
        if (word.frozen) {
          word.letters[i].setColor('#64b4ff');
        } else if (i < matchedLen) {
          word.letters[i].setColor('#4CAF50');
        } else if (isTarget) {
          word.letters[i].setColor('#4fc3f7');
        } else {
          word.letters[i].setColor('#ffffff');
        }
      }
    }
  }

  resetGame() {
    this.words.forEach(w => {
      w.letters.forEach(l => l.destroy());
      w.container?.destroy();
    });
    this.words = [];
    this.typedInput = '';
    this.score = 0;
    this.level = 1;
    this.limitPct = 0;
    this.progressPct = 0;
    this.wordsCompleted = 0;
    this.wordsMissed = 0;
    this.powerStack = [];
    this.gameState = 'playing';
    this.slowFactor = 1;
    this.powerTimer = 0;
    this.activePower = 'none';
    this.spawnTimer = 0;
    this.updateInputDisplay();
    this.scene.stop('UIScene');
    this.scene.launch('UIScene');
  }

  continueAfterLevelComplete() {
    this.score += this.calculateLevelTotal();
    this.level++;
    this.progressPct = 0;
    this.limitPct = 0;
    this.wordsCompleted = 0;
    this.wordsMissed = 0;
    this.words.forEach(w => {
      w.letters.forEach(l => l.destroy());
      w.container?.destroy();
    });
    this.words = [];
    this.typedInput = '';
    this.gameState = 'playing';
    this.updateInputDisplay();
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  calculateAccuracy(): number {
    const total = this.wordsCompleted + this.wordsMissed;
    if (total === 0) return 100;
    return (this.wordsCompleted / total) * 100;
  }

  calculateAccuracyBonus(): number {
    return Math.floor((this.calculateAccuracy() / 100) * this.level * 10);
  }

  isErrorFree(): boolean {
    return this.wordsMissed === 0;
  }

  calculateErrorFreeBonus(): number {
    return this.isErrorFree() ? this.level * 20 : 0;
  }

  calculateLevelTotal(): number {
    return this.calculateAccuracyBonus() + this.calculateErrorFreeBonus();
  }
}
