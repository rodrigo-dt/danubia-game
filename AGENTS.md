# Project instructions

## Project objective

This repository contains a short browser-based 2D pixel-art birthday game
created for Danubia.

The game must remain small, stable, personal, and finishable within the
available deadline. Do not expand the scope unless explicitly requested.

Before implementing gameplay changes, read:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/GAME_DESIGN.md`
3. `docs/ASSET_MANIFEST.md`
4. `docs/ROADMAP.md`

## Technology

- TypeScript
- Phaser 3
- Vite
- HTML and CSS
- npm
- Phaser Arcade Physics
- Browser Gamepad API through Phaser

Do not introduce React, Angular, Vue, a backend, database, external API, map
editor, state-management framework, or another game engine.

## Language rules

- Use English for filenames, class names, variables, methods, interfaces,
  types, comments, asset keys, and Git commits.
- User-facing dialogue and interface text must be in Brazilian Portuguese.
- Keep dialogue data separate from scene implementation.

## Visual rules

- Internal game resolution is 960 × 540.
- Maintain a 16:9 aspect ratio.
- Gameplay sprites use transparent 128 × 128 PNG files.
- Backgrounds use 960 × 540 PNG files.
- Enable Phaser pixel-art rendering and rounded pixels.
- Never blur or apply smoothing to pixel-art assets.
- Do not modify, regenerate, rename, crop, or overwrite visual assets unless
  explicitly requested.
- Prefer code-based tweens, tint, particles, shaking, scaling, and rotation
  instead of requesting additional animation frames.

## Architecture

- Each major phase must be represented by a Phaser Scene.
- Keep reusable input, dialogue, save, checkpoint, and HUD behavior outside
  individual scenes.
- Keep scenes focused on scene-specific composition and progression.
- Use Phaser Arcade Physics.
- Use invisible static collision bodies over fixed backgrounds.
- Use keyboard input as fallback for every gamepad action.
- Avoid unnecessary abstractions and premature generalization.

## Scope rules

- Implement only the requested feature and required supporting changes.
- Do not perform unrelated refactors.
- Do not add production dependencies without explaining why they are needed.
- Prefer Phaser and browser-native capabilities over extra libraries.
- Do not create online features, analytics, authentication, accounts,
  multiplayer, or cloud saves.
- Save progress only in browser localStorage.
- Preserve existing working behavior.

## Asset loading

- All runtime assets live under `public/assets`.
- Load assets with absolute paths beginning with `/assets/`.
- Asset keys must use lowercase kebab-case.
- Do not load source PSD files or raw AI-generated images.
- If a referenced asset is missing, use a temporary generated rectangle or
  placeholder and report the missing filename. Do not silently substitute a
  different permanent asset.

## Gameplay rules

- The game must support DualShock 4, DualSense, generic gamepads, and keyboard.
- Movement must use the left stick, directional pad, arrow keys, and A/D.
- The PlayStation X button and Space jump.
- Square and E interact.
- Circle and F activate the temporal power.
- Options and Escape pause.
- Touchpad/Select and Tab open the phone checklist.
- The player must never lose substantial progress.
- Death or failure restarts from the latest checkpoint.
- Dialogues must be skippable or advanceable.
- The game must be playable in fullscreen on a television.

## Code quality

- Enable TypeScript strict mode.
- Do not use `any` unless unavoidable and documented.
- Prefer small, readable classes and functions.
- Avoid deep inheritance.
- Use explicit types for game state and content data.
- Avoid duplicated asset paths and scene keys.
- Do not leave debug logging in completed features.

## Required verification

After changing code:

1. Run `npm run build`.
2. Fix TypeScript and build errors.
3. If gameplay behavior changed, run the game and verify the affected scene.
4. Report what was changed, what was tested, and any remaining limitation.

Never claim a feature was tested if it was not actually run.

## Documentation maintenance

After completing a meaningful phase:

- Update `docs/ROADMAP.md`.
- Update `docs/ASSET_MANIFEST.md` if asset expectations changed.
- Update `docs/GAME_DESIGN.md` only when the requested gameplay or story
  behavior changed.