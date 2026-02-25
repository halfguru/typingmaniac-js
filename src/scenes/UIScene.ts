import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SIDEBAR_WIDTH,
  GAME_AREA_WIDTH,
  MAX_POWER_STACK,
  FONT_FAMILY,
  FONT_SMALL,
  FONT_LARGE,
  FONT_SIZE,
  COLORS,
} from '../config/constants';
import { POWER_SYMBOLS } from '../config/constants';
import type { PowerType } from '../types';

interface GameData {
  score: number;
  level: number;
  limitPct: number;
  progressPct: number;
  powerStack: PowerType[];
  wordsCompleted: number;
  wordsMissed: number;
  input: string;
  gameState: string;
}

export class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private limitBar!: Phaser.GameObjects.Rectangle;
  private limitPctText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressPctText!: Phaser.GameObjects.Text;
  private powerBoxes: Phaser.GameObjects.Rectangle[] = [];
  private powerLabels: Phaser.GameObjects.Text[] = [];
  private gameOverOverlay?: Phaser.GameObjects.Container;
  private levelCompleteOverlay?: Phaser.GameObjects.Container;

  private progressBarH = 130;
  private progressBarW = 30;
  private powerBoxW = 130;
  private powerBoxH = 20;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.drawSidebar();
    this.createPowerBoxes();
    this.createProgressBars();

    const gameScene = this.scene.get('GameScene') as any;
    gameScene.events.on('gameDataUpdate', (data: GameData) => {
      this.updateUI(data);
    });
  }

  drawSidebar() {
    this.add.rectangle(GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2, GAME_HEIGHT / 2, SIDEBAR_WIDTH, GAME_HEIGHT, COLORS.BG_PANEL);

    const sidebarX = GAME_AREA_WIDTH + 20;

    this.add.text(sidebarX, 50, 'LEVEL', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SMALL}px`,
      color: '#ffffff',
    });

    this.levelText = this.add.text(sidebarX, 85, '1', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_LARGE}px`,
      color: '#4fc3f7',
    });

    this.add.text(sidebarX, 140, 'SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SMALL}px`,
      color: '#ffffff',
    });

    this.scoreText = this.add.text(sidebarX, 175, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_LARGE}px`,
      color: '#4fc3f7',
    });

    this.add.text(sidebarX, 240, 'SPECIAL', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SMALL}px`,
      color: '#ffffff',
    });
  }

  createPowerBoxes() {
    const sidebarX = GAME_AREA_WIDTH + 15;
    const startY = 265;
    const gap = 3;

    for (let i = 0; i < MAX_POWER_STACK; i++) {
      const y = startY + i * (this.powerBoxH + gap);

      const box = this.add.rectangle(
        sidebarX + this.powerBoxW / 2,
        y + this.powerBoxH / 2,
        this.powerBoxW,
        this.powerBoxH,
        COLORS.PROGRESS_BG
      );
      this.powerBoxes.push(box);

      const label = this.add.text(sidebarX + 5, y + this.powerBoxH / 2, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#ffffff',
      });
      label.setOrigin(0, 0.5);
      this.powerLabels.push(label);
    }
  }

  createProgressBars() {
    const limitX = GAME_AREA_WIDTH + 25;
    const progressX = GAME_AREA_WIDTH + 100;
    const barY = 470;
    const barBottom = barY + this.progressBarH;

    this.add.text(limitX, 450, 'LIMIT', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SMALL}px`,
      color: '#ffffff',
    });

    this.add.rectangle(limitX + this.progressBarW / 2, barY + this.progressBarH / 2, this.progressBarW, this.progressBarH, COLORS.PROGRESS_BG);
    this.limitBar = this.add.rectangle(limitX + this.progressBarW / 2, barBottom, this.progressBarW, 0, COLORS.LIMIT_FILL);
    this.limitBar.setOrigin(0.5, 1);
    this.limitPctText = this.add.text(limitX - 5, barBottom + 25, '0%', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#C83232',
    });

    this.add.text(progressX - 15, 450, 'PROGRESS', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SMALL}px`,
      color: '#ffffff',
    });

    this.add.rectangle(progressX + this.progressBarW / 2, barY + this.progressBarH / 2, this.progressBarW, this.progressBarH, COLORS.PROGRESS_BG);
    this.progressBar = this.add.rectangle(progressX + this.progressBarW / 2, barBottom, this.progressBarW, 0, COLORS.PROGRESS_FILL);
    this.progressBar.setOrigin(0.5, 1);
    this.progressPctText = this.add.text(progressX - 5, barBottom + 25, '0%', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#4CAF50',
    });
  }

  updateUI(data: GameData) {
    this.levelText.setText(data.level.toString());
    this.scoreText.setText(data.score.toString());

    const limitHeight = (data.limitPct / 100) * this.progressBarH;
    this.limitBar.setSize(this.progressBarW, limitHeight);

    const progressHeight = (data.progressPct / 100) * this.progressBarH;
    this.progressBar.setSize(this.progressBarW, progressHeight);

    this.limitPctText.setText(`${data.limitPct}%`);
    this.progressPctText.setText(`${data.progressPct}%`);

    for (let i = 0; i < MAX_POWER_STACK; i++) {
      if (i < data.powerStack.length) {
        const power = data.powerStack[i];
        const powerColors: Record<PowerType, number> = {
          none: COLORS.PROGRESS_BG,
          fire: COLORS.POWER_FIRE,
          ice: COLORS.POWER_ICE,
          wind: COLORS.POWER_WIND,
          slow: COLORS.POWER_SLOW,
        };
        const powerNames: Record<PowerType, string> = {
          none: '',
          fire: 'FIRE',
          ice: 'ICE',
          wind: 'WIND',
          slow: 'SLOW',
        };
        this.powerBoxes[i].setFillStyle(powerColors[power]);
        this.powerLabels[i].setText(`${POWER_SYMBOLS[power]} ${powerNames[power]}`);
      } else {
        this.powerBoxes[i].setFillStyle(COLORS.PROGRESS_BG);
        this.powerLabels[i].setText('');
      }
    }

    if (data.gameState === 'gameOver') {
      this.showGameOver();
    } else if (data.gameState === 'levelComplete') {
      this.showLevelComplete();
    } else {
      this.hideOverlays();
    }
  }

  showGameOver() {
    if (this.gameOverOverlay) return;

    this.gameOverOverlay = this.add.container(0, 0);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    this.gameOverOverlay.add(bg);

    const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'GAME OVER', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_LARGE}px`,
      color: '#C83C3C',
    });
    gameOverText.setOrigin(0.5, 0.5);
    this.gameOverOverlay.add(gameOverText);

    const restartText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'Press SPACE to restart', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE}px`,
      color: '#ffffff',
    });
    restartText.setOrigin(0.5, 0.5);
    this.gameOverOverlay.add(restartText);
  }

  showLevelComplete() {
    if (this.levelCompleteOverlay) return;

    this.levelCompleteOverlay = this.add.container(0, 0);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    this.levelCompleteOverlay.add(bg);

    const scrollX = GAME_WIDTH / 2;
    const scrollY = GAME_HEIGHT / 2;
    const scrollW = 400;
    const scrollH = 440;

    const scroll = this.add.rectangle(scrollX, scrollY, scrollW, scrollH, COLORS.SCROLL);
    this.levelCompleteOverlay.add(scroll);

    const scrollInner = this.add.rectangle(scrollX, scrollY, scrollW - 20, scrollH - 20, COLORS.SCROLL_LIGHT);
    this.levelCompleteOverlay.add(scrollInner);

    const gameScene = this.scene.get('GameScene') as any;
    const accuracy = gameScene.calculateAccuracy();
    const accBonus = gameScene.calculateAccuracyBonus();
    const errorFree = gameScene.isErrorFree();
    const errBonus = gameScene.calculateErrorFreeBonus();
    const total = gameScene.calculateLevelTotal();

    const texts: { text: string; y: number }[] = [
      { text: 'LEVEL COMPLETE', y: -180 },
      { text: `Accuracy  ${Math.floor(accuracy)}%`, y: -120 },
      { text: `Bonus     ${this.formatNumber(accBonus)}`, y: -80 },
      { text: `${errorFree ? ':)' : ':('} Error Free`, y: -20 },
      { text: `Bonus     ${this.formatNumber(errBonus)}`, y: 20 },
      { text: `Total     ${this.formatNumber(total)}`, y: 100 },
      { text: 'PRESS <ENTER>', y: 160 },
    ];

    for (const t of texts) {
      const txt = this.add.text(scrollX, scrollY + t.y, t.text, {
        fontFamily: FONT_FAMILY,
        fontSize: t.text === 'LEVEL COMPLETE' ? `${FONT_SIZE}px` : `${FONT_SIZE}px`,
        color: t.text === 'Total     ' + this.formatNumber(total) ? '#ff8c42' : '#ffffff',
      });
      txt.setOrigin(0.5, 0.5);
      this.levelCompleteOverlay.add(txt);
    }
  }

  formatNumber(n: number): string {
    let s = n.toString();
    while (s.length < 4) s = '0' + s;
    return s;
  }

  hideOverlays() {
    if (this.gameOverOverlay) {
      this.gameOverOverlay.destroy();
      this.gameOverOverlay = undefined;
    }
    if (this.levelCompleteOverlay) {
      this.levelCompleteOverlay.destroy();
      this.levelCompleteOverlay = undefined;
    }
  }
}
