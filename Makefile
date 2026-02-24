.PHONY: run build wasm serve clean lint fmt

# Desktop build
run:
	go run .

build:
	go build -o typingmaniac .

# Web/WASM build
wasm:
	GOOS=js GOARCH=wasm go build -o web/game.wasm .
	cp "$(shell go env GOROOT)/lib/wasm/wasm_exec.js" web/

serve:
	python3 -m http.server 8080 -d web

# Linting and formatting
lint:
	golangci-lint run

fmt:
	golangci-lint fmt

clean:
	rm -f typingmaniac web/game.wasm
