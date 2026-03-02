import { alchemistTheme } from './alchemist';
import { defaultTheme } from './default';
import type { Theme, ThemeName } from './types';

const themes: Record<ThemeName, Theme> = {
  default: defaultTheme,
  alchemist: alchemistTheme,
};

export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

export { alchemistTheme } from './alchemist';
export { defaultTheme } from './default';
export type { Theme, ThemeColors, ThemeFonts,ThemeName } from './types';
