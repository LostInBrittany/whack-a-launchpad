# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] – 2026-09-22

### Added

- A demo in `demo/`, playing the game against
  [`@granite-elements/granite-launchpad`](https://github.com/LostInBrittany/granite-launchpad)
  instead of a physical Launchpad. Two pages: `demo/index.html` on
  `<granite-launchpad-board>`, screen only and with no MIDI at all, and
  `demo/twin.html` on `<granite-launchpad>`, the digital twin, where a press on
  either side reaches the game and a plugged-in Mini lights up with the screen.
- `demo/board-pad.js`, an adapter presenting a granite-launchpad element
  through the slice of the `launchpad-webmidi` interface the game uses, so the
  same game code drives hardware or a screen without knowing which. The one
  real translation is `reset(1)`: on hardware a single message meaning "all LEDs
  low", on screen 80 pads painted `amber low`.
- A test suite, run with [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview)
  in headless Chromium: `npm test`. It covers the adapter, the game rules
  played through it, and the twin catching up with hardware that connects late.

### Changed

- The game itself moved to `game.js` and now takes the pad it plays on:
  `createGame( pad )`. `whack-a-launchpad.js` is the hardware entry point,
  connecting a real Launchpad and handing it over. The rules, the layout and
  the colours are unchanged, and `index.html` is untouched.
- `showScore()` fills the Scene column in a loop rather than through a chain of
  thirty-two comparisons. Same lamps, same thresholds.

### Fixed

- The next target never lands on the square the last one was on. The check was
  there from the start, in a `getDifferentPosition( x, y )` whose do/while
  compared the new position against its two arguments – but it was called as
  `getDifferentPosition()`, so both were always `undefined`, nothing ever
  matched and the loop never ran twice. Roughly one target in sixty-four asked
  you to hit the pad your finger was already on.

## [1.1.0] – 2026-09-22

### Changed

- Upgraded [`launchpad-webmidi`](https://github.com/LostInBrittany/launchpad-webmidi)
  from 1.1.0 to 2.0.0. The breaking changes in that release are confined to
  `fromPattern()`, which this game never calls, so the rules, the board layout
  and the colours are all unchanged.
- The library is imported by name, resolved through an
  [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
  in `index.html`:

  ```js
  import Launchpad from 'launchpad-webmidi';
  ```

  `launchpad-webmidi` 2.0.0 publishes only `dist/`, so the deep path into
  `node_modules/launchpad-webmidi/launchpad-webmidi.js` the game used before no
  longer resolves.
- `repository` in `package.json` pointed at the `launchpad-webmidi` repository
  rather than this one.

### Added

- Connection failures are reported on the page, under the title. Before, the
  rejected `connect()` promise had no handler, so a browser without the Web MIDI
  API, a missing Launchpad or a denied permission all left a blank page and a
  console warning. `launchpad-webmidi` 2.0.0 also made those rejections
  meaningful – a missing device now reports itself as one instead of raising a
  `TypeError`.
- README sections on what the game needs, how to serve and run it, how to play,
  and why `npm install` is required for a page with no build step.

### Fixed

- The score column clears before it is repainted. `showScore()` switches the
  eight lamps off with `pad.col(pad.off, …)`, and that call failed under
  `launchpad-webmidi` 1.1.0: the valid colour code `0` was read as falsy, so a
  `Color` object reached `MIDIOutput.send()` and it threw. Fixed upstream in
  [launchpad-webmidi 1.3.0](https://github.com/LostInBrittany/launchpad-webmidi/issues/5).

## [1.0.0] – 2021-04-24

### Added

- Initial release: the whack-a-mole game on the 8×8 grid, with the Automap
  button to start a run, an accelerating timer, and the Scene column as a score
  meter.

[Unreleased]: https://github.com/LostInBrittany/whack-a-launchpad/compare/1.2.0...HEAD
[1.2.0]: https://github.com/LostInBrittany/whack-a-launchpad/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/LostInBrittany/whack-a-launchpad/compare/34593cd...1.1.0
[1.0.0]: https://github.com/LostInBrittany/whack-a-launchpad/commit/5c96acd
