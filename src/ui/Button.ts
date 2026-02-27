import Phaser from 'phaser';
import { FONT_FAMILY } from '../config/constants';

export interface ButtonConfig {
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  onClick: () => void;
  color?: number;
  textColor?: string;
  fontSize?: string;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    super(scene, config.x, config.y);

    const width = config.width ?? 200;
    const height = config.height ?? 50;
    const color = config.color ?? 0x4fc3f7;
    const textColor = config.textColor ?? '#ffffff';
    const fontSize = config.fontSize ?? '24px';

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x050a12, 1);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.bg.lineStyle(2, color, 0.8);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.add(this.bg);

    this.label = scene.add.text(0, 0, config.text, {
      fontFamily: FONT_FAMILY,
      fontSize: fontSize,
      color: textColor,
      fontStyle: 'bold',
    });
    this.label.setOrigin(0.5, 0.5);
    this.add(this.label);

    this.setSize(width, height);
    this.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    
    this.on('pointerover', () => {
      this.bg.clear();
      this.bg.fillStyle(0x0a1520, 1);
      this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.bg.fillStyle(color, 1);
      this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.bg.lineStyle(3, 0xffffff, 0.9);
      this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.setScale(1.05, 1.05);
    });

    this.on('pointerout', () => {
      this.bg.clear();
      this.bg.fillStyle(0x050a12, 1);
      this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.bg.fillStyle(color, 1);
      this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.bg.lineStyle(2, color, 0.8);
      this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.setScale(1, 1);
    });

    this.on('pointerdown', () => {
      this.setScale(0.95, 0.95);
    });

    this.on('pointerup', () => {
      this.setScale(1.05, 1.05);
      config.onClick();
    });
  }

  setText(text: string) {
    this.label.setText(text);
  }

  setEnabled(enabled: boolean) {
    this.setAlpha(enabled ? 1 : 0.5);
    if (enabled) {
      this.setInteractive();
    } else {
      this.disableInteractive();
    }
  }
}
