# Lessons Learned

## Framework Migration (Go/Ebiten → TypeScript/Phaser)

### Why We Switched
- **Scaling complexity**: Ebiten requires manual scaling code for responsive canvas
- **WASM limitations**: Binary size ~10-20MB, text rendering quality issues
- **Phaser advantages**: Built-in Scale Manager handles responsive automatically

### Phaser Scale Manager
- Use `mode: Phaser.Scale.FIT` and `autoCenter: Phaser.Scale.CENTER_BOTH`
- No manual scaling calculations needed
- Game renders at design resolution (1280x720) and scales automatically

## Progress System Tuning

### Level Completion
- Original game: ~8 words to complete first level
- Use `ProgressPctPerWord = 12` (100/12 ≈ 8 words)
- Not `ProgressPctPerWord = 2` which would require 50 words

### Word Length
- Level 1 should start with 4-letter words, not 3
- Formula: `minLen = 4 + (level-1)/3`
