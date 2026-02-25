# Game Design Reference

Based on `design-example.png` - Original Typing Maniac UI design.

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                                     ┌──────────────┐│
│                                     │ LEVEL    1   ││
│                                     │ SCORE  804   ││
│    ┌─────────────────────────┐      │              ││
│    │                         │      │ SPECIAL      ││
│    │    MAIN GAME AREA       │      │ [FIRE][ICE]  ││
│    │    (falling words)      │      │ [WIND]       ││
│    │                         │      │              ││
│    │                         │      │ PROGRESS     ││
│    │                         │      │   ██ 26%     ││
│    │                         │      │   ██         ││
│    │                         │      │              ││
│    │                         │      │ LIMIT        ││
│    │                         │      │   ██ 40%     ││
│    └─────────────────────────┘      │   ██         ││
│    > typing input                   └──────────────┘│
└─────────────────────────────────────────────────────┘
```

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | Dark teal (#1a4a4a) | Main background |
| Panel | Darker teal (#143c3c) | Sidebar background |
| Accent (active) | Bright blue (#4fc3f7) | Active words, highlights |
| Text | White (#ffffff) | Primary UI text |
| Progress (green) | Green (#4CAF50) | Progress column fill |
| Limit (red) | Red (#C83232) | Limit column fill |
| Power Fire | Red/orange (#ff6b35) | Fire power containers |
| Power Ice | Blue (#64b5f6) | Ice power containers |
| Power Wind | Purple (#ba68c8) | Wind power containers |
| Power Slow | Orange (#ffb74d) | Slow power containers |

## UI Components

### Right Panel (Sidebar)
- **LEVEL**: Current level number (large, blue)
- **SCORE**: Points accumulated (large, blue)
- **SPECIAL**: Power-up stack (max 6, colored rectangles with emoji)
- **PROGRESS**: Green vertical bar with percentage
- **LIMIT**: Red vertical bar with percentage

### Main Area
- **Falling words**: Text elements falling from top
- **Power-up words**: Words with colored rectangle containers
- **Danger zone**: Red line at bottom (words crossing = missed)

### Bottom Area
- **Typing input**: Current input text (blue, centered)

## Game Mechanics

### Two-Column Progress System

| Column | Color | Increases When | At 100% |
|--------|-------|----------------|---------|
| PROGRESS | Green | Word completed (+12%) | Level complete |
| LIMIT | Red | Word missed (+10%) | Game over |

### Power-Up System

**Acquiring Powers:**
- Random words have colored containers (~5-25% based on level)
- Colors: Fire=red, Ice=blue, Wind=purple, Slow=orange
- Completing a colored word adds that power to SPECIAL stack (max 6)

**Activating Powers:**
- Type the power name directly: "FIRE", "ICE", "WIND", "SLOW"
- Consumes one power from stack

**Power Effects:**

| Power | Effect |
|-------|--------|
| FIRE | Destroys all words on screen, +50 points each |
| ICE | Freezes all words for 5 seconds |
| WIND | Resets LIMIT (red column) to 0% |
| SLOW | Slows falling speed for 5 seconds |

### Difficulty Scaling

| Setting | Formula |
|---------|---------|
| Word length (L1) | 4 letters |
| Word length increase | +1 every 3 levels |
| Word length cap | 8 letters |
| Fall speed base | 1.5 |
| Fall speed increase | +0.15 per level |
| Power drop rate (L1) | 5% |
| Power drop rate increase | +2% per level |
| Power drop rate cap | 25% |

### Level Complete Screen

When PROGRESS reaches 100%, show scroll overlay:

```
┌─────────────────────────┐
│     LEVEL COMPLETE      │
│                         │
│     Accuracy  100%      │
│     Bonus    2240       │
│                         │
│     :) Error Free       │
│     Bonus    0224       │
│                         │
│     Total    4480       │
│                         │
│  PRESS <ENTER> TO       │
│        CONTINUE         │
└─────────────────────────┘
```

**Calculations:**
- **Accuracy**: (words completed / total words) × 100%
- **Accuracy bonus**: accuracy% × level × 10
- **Error-free**: `:)` if 0 missed words, `:(` otherwise
- **Error-free bonus**: level × 20 (only if error-free)
- **Total**: score + accuracy bonus + error-free bonus

## Word Display

### Normal Words
- White text
- Blue when being typed (active target)
- Green for matched letters

### Power-Up Words
- Colored rectangle container behind text
- Container color matches power type
- Same typing behavior as normal words

## Typography

- **Style**: Rounded sans-serif
- **Game text**: Larger for main elements (LEVEL, SCORE)
- **Interactive words**: Blue coloring for active target
- **Power names**: Colored rectangles in SPECIAL area

## Design Notes

1. **Screen layout**: 1280×720 with 180px sidebar on right
2. **Game area**: 1100×720 for falling words
3. **Word positioning**: Words spawn in game area only
4. **Progress bars**: Vertical orientation, right side
5. **Color scheme**: Dark teal dominant with blue/green/red accents
