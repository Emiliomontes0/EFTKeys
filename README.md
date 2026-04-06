# EFT Keys

Desktop app (Tauri + React + TypeScript) for Escape from Tarkov **key lookup**, backed by public item APIs (e.g. [Tarkov.dev](https://tarkov.dev)).

## Prerequisites

Install these on **every** machine where you develop or build:

| Tool | Why |
|------|-----|
| [Node.js](https://nodejs.org/) (LTS) | `npm`, Vite frontend |
| [Rust via rustup](https://www.rust-lang.org/tools/install) | Tauri’s native shell (`rustc`, `cargo`) |

### Windows (for building the Windows app)

- **Microsoft C++ Build Tools** (Visual Studio installer → “Desktop development with C++” or the MSVC + Windows SDK components Tauri lists).  
  See: [Tauri prerequisites — Windows](https://v2.tauri.app/start/prerequisites/#windows).

### macOS

- Xcode Command Line Tools: `xcode-select --install`

### Linux

- Typical dev packages (WebKitGTK, etc.).  
  See: [Tauri prerequisites — Linux](https://v2.tauri.app/start/prerequisites/#linux).

## Setup (first time)

```bash
cd /path/to/EFTKeys
npm install
```

## Run in development

Starts Vite on `localhost` and opens the native window:

```bash
npm run tauri dev
```

The template includes a small **Rust `greet` command** so you can confirm the JS ↔ Rust bridge works.

## Build installers (per OS)

Build on the OS you target (Tauri does not cross-compile the native shell the same way a pure web app does):

| You build on | You get (typical) |
|--------------|-------------------|
| Windows | `.msi`, `.exe` (see `src-tauri/target/release/bundle/`) |
| macOS | `.app`, `.dmg` |
| Linux | `.deb`, `.AppImage`, etc. |

```bash
npm run tauri build
```

Artifacts appear under `src-tauri/target/release/bundle/`.

To prioritize **Windows** while you develop on macOS: use a Windows PC or VM, or CI (e.g. GitHub Actions `windows-latest`) running `npm ci` and `npm run tauri build`.

## Project layout

| Path | Role |
|------|------|
| `src/` | React UI (Vite) |
| `src-tauri/` | Rust: window, permissions, future native features |
| `src-tauri/tauri.conf.json` | App name, window size, bundle settings |

## IDE

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Next steps (features)

- Query [Tarkov.dev GraphQL](https://api.tarkov.dev/) for keys and show details in the UI (all from the React layer; no extra Rust required at first).
