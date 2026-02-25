# Power-Up System Refactor Plan

## Goal
Refactor power-up system to match original Typing Maniac mechanics.

---

## Summary of Changes

### Current → Target

| Aspect | Current (Wrong) | Target (Original) |
|--------|-----------------|-------------------|
| Power charging | 0-100% per power | Stack up to 6 powers |
| Power activation | Number keys 1-4 | Type "FIRE"/"ICE"/etc. |
| Power source | Charge on any word | Complete colored words |
| Limit system | +10 per missed word | Red column % (game over at 100%) |
| Progress system | Words typed count | Green column % (level complete at 100%) |

---

## Design Decisions (Adjustable)

| Setting | Value | Notes |
|---------|-------|-------|
| LIMIT increase per failed word | +10% | 10 missed = game over |
| PROGRESS increase per completed word | +2% | ~50 words = level complete |
| Level complete behavior | LIMIT resets to 0 | |
| Power drop rate (Level 1) | 5% | Increases with level |
| Power drop rate increase | +2% per level | |
| Power drop rate cap | 25% | |
| Word length (Level 1) | 4 letters | |
| Word length increase | +1 every 3 levels | L1=4, L4=5, L7=6, L10=7, L13=8 |
| Word length cap | 8 letters | |
| Fall speed base | 1.5 | |
| Fall speed increase | +0.15 per level | |
| Ice/Slow duration | 5 seconds (~300 frames) | |
| Accuracy bonus multiplier | Level * 10 | |
| Error-free bonus multiplier | Level * 20 | |

---

## Level Complete Screen

When `ProgressPct >= 100`, show scroll overlay:

```
┌─────────────────────┐
│     LEVEL COMPLETE  │
│                     │
│     Accuracy 100%   │
│     Bonus    2240   │
│                     │
│     :) Error Free   │
│     Bonus    0224   │
│                     │
│     Total    4480   │
│                     │
│ PRESS <ENTER> ...   │
└─────────────────────┘
```

- **Accuracy**: (words completed / total words) * 100
- **Accuracy bonus**: accuracy% * level * 10
- **Error-free**: smiley if 0 missed words, sad if any
- **Error-free bonus**: level * 20 (only if error-free)
- **Total**: score + accuracy bonus + error-free bonus

---

## Implementation Tasks

### 1. Update `game/word.go`
- [ ] Add `PowerType` field to `Word` struct
- [ ] Update `GenerateWord()` to:
  - Filter word list by min/max length based on level
  - Randomly assign power type based on level-based drop rate
- [ ] Add `wordPool` with words organized by length (3-8 letters)
- [ ] Add helper functions:
  - `getWordPoolForLevel(level int) []string`
  - `getPowerDropRate(level int) float64`

### 2. Update `game/game.go`
- [ ] Replace `PowerUps []*PowerUp` with `PowerStack []PowerType` (max 6)
- [ ] Remove `SpecialCharge`, `SpecialReady` fields
- [ ] Rename `Limit` to `LimitPct` (0-100, red column)
- [ ] Add `ProgressPct` (0-100, green column)
- [ ] Add `StateLevelComplete` to GameState
- [ ] Add level stats tracking: `LevelWordsCompleted`, `LevelWordsMissed`
- [ ] Replace `WordsTyped` with `ProgressPct` tracking
- [ ] Update `onWordComplete()`:
  - Add +2% to `ProgressPct`
  - Increment `LevelWordsCompleted`
  - If word has power, append to `PowerStack` (if < 6)
  - Check for power name typed (FIRE, ICE, WIND, SLOW)
- [ ] Update `checkMissedWords()`:
  - Add +10% to `LimitPct`
  - Increment `LevelWordsMissed`
  - Game over at 100%
- [ ] Update `checkLevelProgress()`:
  - Level complete at `ProgressPct >= 100`
  - Set state to `StateLevelComplete`
- [ ] Add `CalculateAccuracy() float64`
- [ ] Add `CalculateAccuracyBonus() int`
- [ ] Add `CalculateErrorFreeBonus() int`
- [ ] Add `ContinueAfterLevelComplete()`:
  - Reset `ProgressPct` to 0
  - Reset `LimitPct` to 0
  - Reset `LevelWordsCompleted`, `LevelWordsMissed`
  - Increment level
- [ ] Update `activatePower()`:
  - Consume from `PowerStack` instead of checking charge
  - WIND effect: reset `LimitPct` to 0
- [ ] Remove `handlePowerUpKeys()` (number keys)
- [ ] Add `processInput()`:
  - Check if typed word is a power name
  - If power in stack, consume and activate
- [ ] Update `Reset()`:
  - Clear `PowerStack`
  - Reset `LimitPct`, `ProgressPct`
  - Reset level stats

### 3. Update `game/powerup.go`
- [x] Remove `PowerUp` struct
- [x] Remove `NewPowerUp()`, `AddCharge()`, `IsReady()`, `Use()` methods
- [x] Keep `PowerType` constants
- [x] Keep `powerUpInfo` map for name/symbol lookup
- [x] Add helper:
  - `GetPowerByName(name string) PowerType`
  - `GetPowerColor(pt PowerType) color.RGBA`

### 4. Update `main.go` UI
- [x] Update sidebar:
  - Remove percentage displays for power-ups
  - Show `PowerStack` as colored rectangles with emoji
  - Update LIMIT display (red %)
  - Update PROGRESS display (green %)
- [x] Update `drawWord()`:
  - Draw colored rectangle container for words with powers
- [x] Add `drawPowerStack()`:
  - Draw up to 6 colored rectangles with emoji
  - Colors: fire=red, ice=blue, wind=purple, slow=orange
- [x] Update `drawProgressBar()`:
  - Draw green progress bar
  - Fill based on `ProgressPct`
- [x] Add `drawLevelComplete()`:
  - Scroll-style overlay
  - Show accuracy, bonuses, total
  - Error-free smiley/sad face
  - "Press ENTER to continue"

---

## Files Changed

| File | Changes |
|------|---------|
| `game/word.go` | Add PowerType, level-based word pool, power assignment |
| `game/game.go` | Replace power system, add LimitPct/ProgressPct |
| `game/powerup.go` | Simplify, remove charging logic |
| `main.go` | Update UI for new power display, colored containers |
| `game/words.txt` | Word list file (3-8 letters) |
| `docs/DESIGN.md` | Updated with correct mechanics |

---

## Verification

- [x] `make lint` passes
- [x] `go test ./...` passes
- [x] Desktop run (`make run`) works
- [x] Power-up words show colored containers
- [x] Completing colored word adds to stack
- [x] Typing "FIRE" consumes fire power
- [x] Red column increases on failed words
- [x] Green column increases on completed words
- [x] Level complete resets both columns
- [x] WIND resets red column to 0

---

## Review

**Completed**: Power-up system refactored to match original game mechanics.

**Changes**:
- Two-column progress system (red LIMIT, green PROGRESS)
- Power-ups acquired by completing colored words
- Power stack (max 6) instead of charging percentages
- Type power names to activate (FIRE, ICE, WIND, SLOW)
- Level complete screen with accuracy/bonus stats
- Word list moved to `game/words.txt`
- Progress tuned to ~8 words per level (12% per word)
- Level 1 starts with 4-letter words

**Tuning applied**:
- `ProgressPctPerWord = 12` (was 2)
- Word length starts at 4 (was 3)
