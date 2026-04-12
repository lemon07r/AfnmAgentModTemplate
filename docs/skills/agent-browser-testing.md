# Skill: Agent Browser Game Testing

Use browser automation to test AFNM mods in the running Electron game client. Requires `agent-browser` CLI to be installed.

## When to activate

- When you need automated UI testing beyond manual inspection
- When testing overlay behavior across screen transitions
- When capturing screenshots of mod UI for Workshop previews
- When verifying injected UI appears in the correct dialog slots

## Prerequisites

Install agent-browser (if not already installed):

```bash
npm install -g @anthropic/agent-browser
# Or check if available:
agent-browser --version
```

## Workflow

### 1. Launch game with remote debugging

```bash
# Linux/macOS:
touch "/path/to/Ascend From Nine Mountains/disable_steam"
"/path/to/Ascend From Nine Mountains/Ascend From Nine Mountains" --remote-debugging-port=9222 &

# Windows (PowerShell):
New-Item "C:\...\Ascend From Nine Mountains\disable_steam" -ItemType File
Start-Process "C:\...\Ascend From Nine Mountains\Ascend From Nine Mountains.exe" "--remote-debugging-port=9222"
```

### 2. Connect agent-browser

```bash
# Take a screenshot of the current state
agent-browser screenshot --url "http://localhost:9222" --output screenshot.png

# Navigate and interact
agent-browser navigate --url "http://localhost:9222"

# Execute JS in the game context
agent-browser eval --url "http://localhost:9222" --js "window.__afnmModDebug"
```

### 3. Inspect mod state via debug API

```bash
agent-browser eval --url "http://localhost:9222" --js "JSON.stringify(window.__afnmModDebug?.['<mod-name>']?.getConfig())"
```

### 4. Clean up

```bash
# Linux/macOS:
rm "/path/to/Ascend From Nine Mountains/disable_steam"
# Windows (PowerShell):
Remove-Item "C:\...\Ascend From Nine Mountains\disable_steam"
```

## Rules

- **Always clean up `disable_steam` when done.** See the live-game-testing skill.
- This is an advanced testing path. Prefer `bun run runtime:oracle` for API verification.
- Not all users will have agent-browser installed. Do not make it a required dependency.
- Screenshots taken this way are useful for Workshop preview images.
