import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';
import { Button } from './Button';

export interface GameOverData {
  score: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  leaderboardPosition: number;
  onRestart: () => void;
}

export class GameOverOverlay extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, data: GameOverData) {
    super(scene, 0, 0);

    const bg = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    this.add(bg);

    const vignette = scene.add.graphics();
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    for (let i = 0; i < 8; i++) {
      const radius = 800 - i * 80;
      const alpha = 0.03 + i * 0.02;
      vignette.fillStyle(0x8b0000, alpha);
      vignette.fillCircle(cx, cy, radius);
    }
    this.add(vignette);

    const panelW = 520;
    const panelH = 480;
    const panelX = GAME_WIDTH / 2 - panelW / 2;
    const panelY = GAME_HEIGHT / 2 - panelH / 2;

    const panel = scene.add.graphics();
    panel.fillStyle(0x0a1515, 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 24);
    panel.lineStyle(4, 0x8b0000, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 24);
    this.add(panel);

    const skull = scene.add.text(GAME_WIDTH / 2, panelY + 85, '💀', { fontSize: '70px' });
    skull.setOrigin(0.5, 0.5);
    this.add(skull);

    const gameOverText = scene.add.text(GAME_WIDTH / 2, panelY + 165, 'GAME OVER', {
      fontFamily: FONT_FAMILY,
      fontSize: '56px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5, 0.5);
    this.add(gameOverText);

    const scoreLabel = scene.add.text(GAME_WIDTH / 2, panelY + 240, 'SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: '#7ab8b8',
    });
    scoreLabel.setOrigin(0.5, 0.5);
    this.add(scoreLabel);

    const scoreValue = scene.add.text(GAME_WIDTH / 2, panelY + 280, this.formatNumber(data.score), {
      fontFamily: FONT_FAMILY,
      fontSize: '48px',
      color: '#ff8c42',
      fontStyle: 'bold',
    });
    scoreValue.setOrigin(0.5, 0.5);
    this.add(scoreValue);

    const highScoreLabel = scene.add.text(GAME_WIDTH / 2, panelY + 350, 'HIGH SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: '#7ab8b8',
    });
    highScoreLabel.setOrigin(0.5, 0.5);
    this.add(highScoreLabel);

    const highScoreValue = scene.add.text(GAME_WIDTH / 2, panelY + 390, this.formatNumber(data.highScore), {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: '#4fc3f7',
      fontStyle: 'bold',
    });
    highScoreValue.setOrigin(0.5, 0.5);
    this.add(highScoreValue);

    if (data.isNewHighScore) {
      const newRecordText = scene.add.text(GAME_WIDTH / 2, panelY + 320, '🏆 NEW RECORD!', {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: '#ffd700',
        fontStyle: 'bold',
      });
      newRecordText.setOrigin(0.5, 0.5);
      newRecordText.setAlpha(0);
      this.add(newRecordText);
      scene.tweens.add({ targets: newRecordText, alpha: 1, duration: 200, delay: 500 });
    }

    const restartBtn = new Button(scene, {
      text: 'PRESS SPACE TO RESTART',
      x: GAME_WIDTH / 2,
      y: panelY + panelH - 50,
      width: 300,
      height: 40,
      color: 0x4fc3f7,
      onClick: data.onRestart,
    });
    this.add(restartBtn);

    this.setDepth(1000);
  }

  private formatNumber(num: number): string {
    return num.toLocaleString();
  }
}
