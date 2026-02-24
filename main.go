package main

import (
	"bytes"
	"image/color"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/examples/resources/fonts"
	"github.com/hajimehoshi/ebiten/v2/inpututil"
	"github.com/hajimehoshi/ebiten/v2/text/v2"
)

const (
	ScreenWidth  = 1280
	ScreenHeight = 720
	FontSize     = 28
	FallSpeed    = 1.5
	SpawnDelay   = 90
)

var wordList = []string{
	"apple", "banana", "cherry", "dragon", "elephant",
	"forest", "garden", "house", "island", "jungle",
	"king", "lemon", "mountain", "night", "ocean",
	"piano", "queen", "river", "star", "tree",
	"umbrella", "village", "window", "yellow", "zebra",
	"book", "cloud", "dream", "earth", "fire",
	"gold", "heart", "ice", "jump", "kite",
	"light", "moon", "north", "orange", "pink",
	"quick", "rain", "snow", "thunder", "water",
	"cat", "dog", "bird", "fish", "wolf",
}

type Word struct {
	text string
	x, y float64
}

type Game struct {
	words    []Word
	input    string
	score    int
	spawnCnt int
	rand     *rand.Rand
	fontFace *text.GoTextFace
}

func NewGame() *Game {
	src := rand.NewSource(time.Now().UnixNano())
	r := rand.New(src)

	f, err := text.NewGoTextFaceSource(bytes.NewReader(fonts.MPlus1pRegular_ttf))
	if err != nil {
		log.Fatal(err)
	}
	fontFace := &text.GoTextFace{
		Source: f,
		Size:   FontSize,
	}

	return &Game{
		rand:     r,
		fontFace: fontFace,
	}
}

func (g *Game) spawnWord() {
	word := wordList[g.rand.Intn(len(wordList))]
	x := float64(g.rand.Intn(ScreenWidth - 200))
	g.words = append(g.words, Word{text: word, x: x, y: -30})
}

func (g *Game) Update() error {
	g.spawnCnt++
	if g.spawnCnt >= SpawnDelay {
		g.spawnCnt = 0
		g.spawnWord()
	}

	for i := range g.words {
		g.words[i].y += FallSpeed
	}

	var active []Word
	for _, w := range g.words {
		if w.y < ScreenHeight+50 {
			active = append(active, w)
		}
	}
	g.words = active

	letters := "abcdefghijklmnopqrstuvwxyz"
	for _, r := range letters {
		if inpututil.IsKeyJustPressed(ebiten.Key(r)) {
			g.input += string(r)
		}
	}
	if inpututil.IsKeyJustPressed(ebiten.KeyBackspace) && len(g.input) > 0 {
		g.input = g.input[:len(g.input)-1]
	}

	inputLower := strings.ToLower(g.input)
	for i, w := range g.words {
		if strings.ToLower(w.text) == inputLower {
			g.score += len(w.text) * 10
			g.words = append(g.words[:i], g.words[i+1:]...)
			g.input = ""
			break
		}
	}

	for _, w := range g.words {
		if strings.HasPrefix(strings.ToLower(w.text), inputLower) && inputLower != "" {
			break
		}
	}

	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	screen.Fill(color.RGBA{20, 20, 40, 255})

	for _, w := range g.words {
		wordLower := strings.ToLower(w.text)
		inputLower := strings.ToLower(g.input)

		col := color.RGBA{255, 255, 255, 255}
		if inputLower != "" && strings.HasPrefix(wordLower, inputLower) {
			col = color.RGBA{100, 255, 100, 255}
		}

		op := &text.DrawOptions{}
		op.GeoM.Translate(w.x, w.y)
		op.ColorScale.ScaleWithColor(col)
		text.Draw(screen, w.text, g.fontFace, op)
	}

	inputOp := &text.DrawOptions{}
	inputOp.GeoM.Translate(20, ScreenHeight-40)
	inputOp.ColorScale.ScaleWithColor(color.RGBA{255, 255, 100, 255})
	text.Draw(screen, "> "+g.input, g.fontFace, inputOp)

	scoreOp := &text.DrawOptions{}
	scoreOp.GeoM.Translate(ScreenWidth-150, 40)
	scoreOp.ColorScale.ScaleWithColor(color.RGBA{255, 255, 255, 255})
	text.Draw(screen, "Score: "+intToStr(g.score), g.fontFace, scoreOp)
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return ScreenWidth, ScreenHeight
}

func intToStr(n int) string {
	if n == 0 {
		return "0"
	}
	var neg bool
	if n < 0 {
		neg = true
		n = -n
	}
	var s string
	for n > 0 {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	if neg {
		s = "-" + s
	}
	return s
}

func main() {
	ebiten.SetWindowSize(ScreenWidth, ScreenHeight)
	ebiten.SetWindowTitle("Typing Maniac")
	if err := ebiten.RunGame(NewGame()); err != nil {
		log.Fatal(err)
	}
}
