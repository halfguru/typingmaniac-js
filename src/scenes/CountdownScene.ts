import Phaser from 'phaser';

import { FONT_FAMILY,GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import { themeService } from '../services/ThemeService';

export class CountdownScene extends Phaser.Scene {
  private fadeOverlay?: Phaser.GameObjects.Rectangle;
  private ring?: Phaser.GameObjects.Graphics;
  private particles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'CountdownScene' });
  }

  create() {
    this.drawBackground();
    this.createParticles();
    this.createFadeOverlay();
    this.createRing();

    const getReadyText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, 'GET READY', {
      fontFamily: FONT_FAMILY,
      fontSize: '32px',
      color: themeService.getText('text.secondary'),
      fontStyle: 'bold',
    });
    getReadyText.setOrigin(0.5, 0.5);
    getReadyText.setAlpha(0);

    this.tweens.add({
      targets: getReadyText,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
    });

    const sequence = [
      { text: '3', duration: 900 },
      { text: '2', duration: 900 },
      { text: '1', duration: 900 },
      { text: 'GO!', duration: 600, isFinal: true },
    ];

    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex >= sequence.length) {
        this.transitionToGame();
        return;
      }

      const item = sequence[currentIndex];
      
      if (this.ring) {
        this.animateRing();
      }

      const textObj = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, item.text, {
        fontFamily: FONT_FAMILY,
        fontSize: item.isFinal ? '100px' : '140px',
        color: item.isFinal ? '#4ade80' : themeService.getText('text.primary'),
        fontStyle: 'bold',
      });
      textObj.setOrigin(0.5, 0.5);
      textObj.setAlpha(0);
      textObj.setScale(0.3);

      if (item.isFinal) {
        textObj.setShadow(0, 0, '#4ade80', 30, true, true);
      } else {
        textObj.setShadow(0, 0, themeService.getText('text.primary'), 20, true, true);
      }

      this.tweens.add({
        targets: textObj,
        alpha: 1,
        scale: 1,
        duration: 350,
        ease: 'Back.easeOut',
        onComplete: () => {
          if (item.isFinal) {
            this.createBurstEffect();
            getReadyText.destroy();
          }
          
          this.time.delayedCall(item.duration - 350, () => {
            this.tweens.add({
              targets: textObj,
              alpha: 0,
              scale: item.isFinal ? 1.5 : 0.7,
              duration: 250,
              ease: 'Power2',
              onComplete: () => {
                textObj.destroy();
                currentIndex++;
                showNext();
              },
            });
          });
        },
      });
    };

    this.time.delayedCall(300, showNext);
  }

  createRing() {
    this.ring = this.add.graphics();
    this.ring.lineStyle(4, themeService.getNumber('ui.panelBorder'), 0.5);
    this.ring.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 80);
    this.ring.setAlpha(0);
  }

  animateRing() {
    if (!this.ring) return;

    this.ring.setAlpha(0.8);
    this.ring.setScale(0.8);

    this.tweens.add({
      targets: this.ring,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 600,
      ease: 'Power2',
    });
  }

  createParticles() {
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;
      const size = 2 + Math.random() * 4;
      const alpha = 0.1 + Math.random() * 0.2;

      const particle = this.add.circle(x, y, size, themeService.getNumber('ui.panelBorder'), alpha);
      this.particles.push(particle);

      this.tweens.add({
        targets: particle,
        y: y - 100 - Math.random() * 100,
        x: x + (Math.random() - 0.5) * 50,
        alpha: 0,
        duration: 2000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        repeat: -1,
        onRepeat: () => {
          particle.setPosition(Math.random() * GAME_WIDTH, GAME_HEIGHT + 20);
          particle.setAlpha(alpha);
        },
      });
    }
  }

  createBurstEffect() {
    const burstCount = 12;
    const colors = [0x4ade80, 0x22c55e, 0x86efac, 0xbbf7d0];

    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2;
      const startX = GAME_WIDTH / 2;
      const startY = GAME_HEIGHT / 2 + 20;
      const endX = startX + Math.cos(angle) * 200;
      const endY = startY + Math.sin(angle) * 200;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const particle = this.add.circle(startX, startY, 8 + Math.random() * 8, color, 1);

      this.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0.2,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    for (let i = 0; i < 8; i++) {
      const x = GAME_WIDTH / 2 + (Math.random() - 0.5) * 100;
      const y = GAME_HEIGHT / 2 + 20 + (Math.random() - 0.5) * 50;

      const spark = this.add.text(x, y, '✦', {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: '#ffd700',
      });
      spark.setOrigin(0.5, 0.5);
      spark.setAlpha(0);

      this.tweens.add({
        targets: spark,
        alpha: { from: 1, to: 0 },
        y: y - 50,
        scale: { from: 0.5, to: 1.5 },
        duration: 500,
        delay: Math.random() * 200,
        onComplete: () => spark.destroy(),
      });
    }
  }

  createFadeOverlay() {
    this.fadeOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1);
    this.fadeOverlay.setDepth(1000);

    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
    });
  }

  transitionToGame() {
    if (!this.fadeOverlay) return;

    this.fadeOverlay.setDepth(1000);

    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        audioService.startMusic();
        this.scene.start('GameScene');
      },
    });
  }

  drawBackground() {
    BackgroundRenderer.draw(this);
  }
}
