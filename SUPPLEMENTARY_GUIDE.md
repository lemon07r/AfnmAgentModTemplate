# Supplementary Guide: AFNM Mod Patterns That Matter

This is the guide for the parts that do not fit cleanly into the upstream example repo.

It distills the patterns learned while shipping:

- `AFNM-CraftBuddy`
- `Lucky All Around`
- `ElderGPT Spirit Ring`

Unless noted otherwise, the runtime statements below were rechecked against the installed AFNM runtime `0.6.50-c2637ae` on `2026-04-11`.

## 1. Pick The Right Mod Shape First

Do not start with code. Start with the mod category.

### Gameplay modifier

Use this when you are changing probabilities, rewards, event pools, stat math, or settings-driven behavior.

Default stack:

- hooks
- numeric global flags for settings
- minimal or no custom UI

Good examples:

- Lucky All Around

### Read-only advisor or overlay

Use this when the mod explains, visualizes, or recommends without mutating gameplay.

Default stack:

- `getGameStateSnapshot()`
- `subscribe()`
- `injectUI()` for local entry points
- persistent overlay only if the UI must survive screen/dialog transitions

Good examples:

- ElderGPT Spirit Ring

### Search / simulation / optimizer

Use this when the mod predicts future turns or compares multiple possible lines.

Default stack:

- strict separation between live integration and pure simulation
- authoritative local math for hypothetical future-state evaluation
- replayable fixtures and parity tests

Good examples:

- CraftBuddy

## 2. ModAPI-First Means More Than “Use The API When Convenient”

Use this order deliberately:

1. `window.modAPI.getGameStateSnapshot()`
2. `window.modAPI.subscribe()`
3. `window.modAPI.actions.registerOptionsUI(...)`
4. `window.modAPI.injectUI(...)`
5. raw store, DOM, or fiber fallback only for verified gaps

Practical consequences:

- do not poll with `setInterval` if `subscribe()` is enough
- do not scrape English UI copy if the snapshot already contains the state
- do not mutate `window.gameStore`
- do not reach for a body-mounted overlay if a small injected affordance solves the problem

## 3. Important Runtime Truths

### `onGenerateExploreEvents` is earlier than it looks

The hook fires before the game expands weighted explore candidates into repeated `{ index, event }` entries.

That matters because repeat-penalty bookkeeping is keyed by the expanded weighted index:

- `currentLocationLastEvent`
- `currentLocationLastEventCount`

If you duplicate events inside the hook, you change repeat semantics. Lucky All Around therefore uses the hook only to arm a narrowly scoped weighted-slot patch.

### `onReduxAction` is powerful and dangerous

It runs inside the reducer.

That means:

- keep it fast
- keep it deterministic
- avoid side effects
- avoid network requests
- avoid UI work

If `subscribe()` can solve the problem, prefer that.

### Networking is no longer the blocker

On `0.6.50+`, normal `fetch()` works from mod code. The real risks are now:

- offline players
- CORS/server policy on the target service
- hanging requests
- uncaught failures inside hot paths

Treat remote calls as optional inputs, not required runtime dependencies.

## 4. Settings And UI Patterns

### Use numeric global flags for cross-save settings

This is the clean default for mod configuration.

Why:

- the storage already exists
- the values are available inside game flags
- the settings survive reloads and save switches

Pattern:

- read defaults from `getGlobalFlags()`
- normalize missing or legacy values on startup
- write numbers with `setGlobalFlag(...)`
- render the settings panel through `registerOptionsUI(...)`

### Choose `injectUI()` or a persistent overlay intentionally

Use `injectUI()` when:

- the action belongs to one dialog or screen
- you need a lightweight CTA, button, or readout
- the game already has a natural host slot

Use a persistent overlay when:

- the affordance must survive location, combat, event, and crafting transitions
- the user needs ongoing access from anywhere
- slot-by-slot injection would become a maintenance tax

Spirit Ring uses both: a body-mounted chat overlay plus injected entry points.

## 5. Crafting / Simulation Lessons Worth Preserving

These matter even if your new mod is not CraftBuddy-sized, because they explain where naive parity attempts drift.

- `CraftingTechnique.name` is a stable, non-localized identifier. It matches `KnownCraftingTechnique.technique` and `modAPI.gameData.craftingTechniques`.
- `modAPI.utils.evaluateScaling(...)` is useful, but not trustworthy as the optimizer authority for hypothetical future-state simulation. Keep local evaluation authoritative when future-state variables differ from the live runtime.
- Runtime-shaped percent buffs on crafting stats scale the pre-craft base stat. Flat in-craft bonuses are additive and are not multiplied by those percent buffs.
- Max-pool buffs affect both `% of max pool` restores and the effective clamp cap.
- Static `poolcost`, `stabilitycost`, and `successchance` masteries are already baked into live techniques; double-applying them is a real bug.
- `noQiCost` is a real field in current runtime payloads.
- `craftingTeamUpOverride` companion buffs also matter in current payloads.

Harmony-specific notes:

- Inscribed Patterns has a catastrophic stack-halving penalty on invalid-color actions.
- Spiritual Resonance can retarget after a repeated new-color streak; the state machine is not just “current color plus progress”.

## 6. Validation Discipline

Default validation should be:

1. `bun run typecheck`
2. `bun run build`
3. `bun run runtime:oracle`
4. targeted `bun run runtime:grep -- "<pattern>"`

Why this matters:

- docs drift
- patch notes drift
- older notes drift
- live executable behavior is the authority

Use direct client launch only when you need true UI proof.

When doing that:

1. place the built zip in the installed `mods/` directory
2. create `disable_steam` beside the executable
3. launch with the platform's direct executable or native launcher
4. remove `disable_steam` when finished

Current installed-runtime check also confirms:

- `supportsDisableSteamSentinel: true`
- `restartsThroughSteamByDefault: true`
- `writesRelativeSettingsJson: false`

## 7. Anti-Patterns To Avoid

- broad global monkeypatches when a narrow scoped patch will do
- DOM click listeners for behavior that already has a ModAPI hook
- English-only text parsing as the primary state source
- simulation logic that depends on live mutable runtime state
- shipping a template that cannot build as cloned
- telling future agents to use a toolchain that the repo does not actually use

## 8. Release Order

The reliable order is:

1. finish code and docs
2. validate locally
3. build the zip
4. upload to Workshop locally
5. only then push/tag any release automation path you keep in git

If the upload path depends on the sibling `ModUploader-AFNM` repo, document that early instead of letting it surprise the next agent.
