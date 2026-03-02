import Phaser from 'phaser';

import { GAME_HEIGHT,GAME_WIDTH } from './config/constants';
import { AuthScene } from './scenes/AuthScene';
import { CountdownScene } from './scenes/CountdownScene';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { UIScene } from './scenes/UIScene';
import { initAnalytics } from './services/AnalyticsService';
import { initObservability } from './services/ObservabilityService';

initObservability();
initAnalytics();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0x000000,
  roundPixels: true,
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [AuthScene, MenuScene, CountdownScene, GameScene, UIScene, SettingsScene],
};

// @ts-expect-error - resolution is valid but not in types
config.resolution = window.devicePixelRatio || 1;

new Phaser.Game(config);
