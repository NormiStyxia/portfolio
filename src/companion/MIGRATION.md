# Green Colleague Companion migration notes

Source reviewed from `牛顿-maker/scripts/green_assistant/` and the generated runtime manifest at `assets/image/green_assistant/runtime/manifest.json`.

## 1:1 behavior mapping

- `IDLE → WALK → IDLE` remains a small finite-state loop.
- Idle duration stays randomized; walks use weighted short, medium, and occasional long distances.
- Movement speed remains 64 px/s on desktop, matching `CompanionConfig.moveSpeed`.
- The current frame source faces left; right-facing movement reuses the same frames with a horizontal mirror.
- Position is owned by a single foot/root coordinate and clamped to a safe horizontal zone.
- A pointer interaction interrupts walking before playing one of the two original tap reactions.
- Dragging uses the source `dragGrab` semantic anchor at the cape tip; mirrored facing mirrors the hotspot around the foot/root instead of changing direction during the gesture.
- `idle`, `blink`, `move`, `tap_react_a`, and `tap_react_b` keep their original FPS, loop rules, frame sizes, and foot anchors.

## UrhoX / NVG / Lua runtime dependencies

- `GreenAssistView` loads textures and draws frames through NVG image patterns.
- Hit testing, screen-space coordinate mapping, and bubble layout are coupled to the UrhoX viewport and the game renderer.
- The runtime manifest is consumed through Lua/UrhoX resource paths and mipmap policy.
- Failure observation, replay takeover, input locking, and level identity use game runtime adapters.

## Browser rewrites

- `requestAnimationFrame` advances the movement controller; a small React animation player advances the original PNG sequences.
- CSS fixed positioning replaces the UrhoX root transform while preserving the foot-center anchor.
- `IntersectionObserver` plus viewport-center scoring replaces game-level context events.
- A semantic HTML button and lightweight non-modal speech bubble replace NVG hit testing and bubble rendering.
- Resize updates the legal movement bounds and walks an out-of-range root back into the viewport instead of teleporting it.

## Source states and resources

- Portable source behavior states: `IDLE`, `WALK/ROAM`, `INTERACT/DIALOGUE`.
- Game-only source states: `DRAGGING`, `OBSERVE`, `OFFER`, `TAKEOVER`, `SUCCESS`, `DISABLED`.
- Runtime clips: `idle`, `blink`, `move`, `drag`, `tap_react_a`, `tap_react_b`, `takeover_raise`, `takeover_loop`, `takeover_finish`.
- Portfolio clips included: `idle`, `blink`, `move`, `drag`, `tap_react_a`, `tap_react_b`, `takeover_raise`, `takeover_loop`, and `takeover_finish`.

## Intentionally excluded

- Out-of-zone relocation effects: the portfolio version keeps the original drag pose and allows free in-viewport dragging without changing facing. On release it preserves the clamped horizontal position and settles vertically back to the shared bottom baseline.
- Failure thresholds, tutorial observation, standard-solution replay, player-input locking, and Computer Use/takeover behavior.
- UrhoX/NVG renderer code, game event subscriptions, level IDs, and NEWTONignore-specific adapters.
- Takeover animation clips and gameplay choice UI. Extension points remain at the section-context and navigation bridge instead.
