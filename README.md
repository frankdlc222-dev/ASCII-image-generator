# ASCII Image Generator v1.5

A polished browser-based app that converts text prompts into ASCII art. Type a description, and the app generates an image locally in your browser, converts it to ASCII characters, and animates the reveal line by line.

**Everything runs entirely in the browser. No backend, no API keys, no server-side processing.**

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Architecture

### Dual Generation Modes

1. **Local AI Mode** (Primary)
   - Uses WebGPU compute shaders for GPU-accelerated image generation
   - Attempts to load browser-based ML models via Transformers.js
   - Falls back to WebGPU compute-based procedural generation with richer detail
   - Requires a WebGPU-capable browser (Chrome 113+, Edge 113+)

2. **Procedural Fallback** (Always Available)
   - Canvas2D-based scene generation
   - Parses prompts for keywords (mountain, robot, cat, etc.)
   - Renders stylized scenes with gradients, shapes, and effects
   - Works in any modern browser

### How It Works

1. User enters a text prompt
2. App detects device capabilities (WebGPU availability)
3. Selects the best generation mode
4. Generates an image (512x512)
5. Converts the image to ASCII using brightness mapping
6. Animates the ASCII reveal from top to bottom

### Key Modules

```
src/
├── components/          # React UI components
│   ├── PromptInput      # Prompt text input + example chips
│   ├── ControlsPanel    # Output width, speed, character ramp, etc.
│   ├── StatusPanel      # Loading states and progress
│   ├── AsciiViewport    # ASCII output display + action buttons
│   └── GenerationModeBadge  # Shows which mode was used
├── hooks/
│   ├── useGenerator     # Core generation orchestration
│   └── useAsciiAnimation # Line-by-line reveal animation
├── generators/
│   ├── localAiGenerator # WebGPU/ML-based generation
│   └── proceduralGenerator # Canvas2D fallback scenes
├── lib/
│   ├── asciiConverter   # Image-to-ASCII conversion with edge detection
│   ├── capability       # WebGPU feature detection
│   ├── imageToCanvas    # Canvas utility functions
│   └── modelCache       # Browser cache for model weights
└── types.ts             # TypeScript interfaces and constants
```

### Generator Abstraction

Both generators implement a common interface:

```typescript
interface Generator {
  initialize(onProgress?): Promise<void>;
  isSupported(): Promise<boolean>;
  generate(options): Promise<ImageData>;
  dispose(): void;
}
```

To add a new generation backend, implement this interface and register it in the generator selection logic.

### ASCII Conversion

- Maps pixel brightness to character density
- Corrects for monospace character aspect ratio (~2:1)
- Supports multiple character ramps (standard, blocks, minimal)
- Optional Sobel edge enhancement for sharper detail

### Caching

- Model weights cached via the Cache API
- Subsequent loads skip downloads
- Cache can be cleared programmatically

## Browser Requirements

| Feature | Minimum |
|---------|---------|
| Local AI Mode | Chrome 113+, Edge 113+ (WebGPU required) |
| Procedural Mode | Any modern browser |
| ASCII rendering | Any browser with ES2023 support |

## Controls

- **Output Width**: 40-200 columns
- **Animation Speed**: 5-120 lines/second
- **Character Ramp**: Standard (`@%#*+=-:. `), Blocks (`█▓▒░ `), Minimal (`#*:. `)
- **Edge Enhancement**: Sobel filter for sharper ASCII edges
- **Seed**: Reproducible generation
- **Force Fallback**: Test procedural mode regardless of capabilities

## Export Options

- **Copy**: ASCII text to clipboard
- **Download .txt**: Plain text file
- **Download .png**: Rendered image of the ASCII art

## Future Improvements

- Integrate a true text-to-image diffusion model when browser ONNX/WebGPU support matures
- Add color ASCII mode (ANSI colors)
- Web Worker for ASCII conversion on large outputs
- More procedural scene types
- Prompt history with localStorage persistence
- Shareable ASCII art links
- Real-time preview during generation

## Tech Stack

- React 19 + TypeScript
- Vite 8
- WebGPU API (compute shaders)
- Canvas2D API (procedural fallback)
