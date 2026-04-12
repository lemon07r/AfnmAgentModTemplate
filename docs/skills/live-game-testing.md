# Skill: Live Game Testing

Safe workflow for testing mods in the actual game client without Steam relaunch loops.

## When to activate

- When the runtime oracle is insufficient (need visual/UI verification)
- When testing UI overlays, screens, or injected components
- When verifying mod behavior in actual gameplay

## Workflow

1. Build the mod: `bun run build`
2. Copy the zip to the game's mods directory:
   ```bash
   cp builds/*.zip "/path/to/Ascend From Nine Mountains/mods/"
   ```
3. Create the disable_steam sentinel:
   ```bash
   touch "/path/to/Ascend From Nine Mountains/disable_steam"
   ```
4. Launch the game directly (NOT through Steam):
   ```bash
   # Linux:
   "/path/to/Ascend From Nine Mountains/launch-native.sh"
   # Or with DevTools:
   "/path/to/Ascend From Nine Mountains/Ascend From Nine Mountains" --remote-debugging-port=9222
   ```
5. Test your mod
6. **CRITICAL — Clean up when done:**
   ```bash
   rm "/path/to/Ascend From Nine Mountains/disable_steam"
   ```

## Rules

- **ALWAYS delete `disable_steam` when finished.** If left behind, Workshop mods stop loading for all users.
- Prefer the runtime oracle (`bun run runtime:oracle`, `bun run runtime:grep`) over live launches. Live testing is opt-in only.
- Do NOT launch the game from the repo directory — the app may write a `settings.json` in the working directory.
- After rebuilding, recopy the zip to the mods directory before retesting.
- If the Mod Manager is open, press its CONTINUE button to apply mod enable/disable state before loading a save.
- For DevTools access, use `--remote-debugging-port=9222` and open `chrome://inspect` in Chrome.
