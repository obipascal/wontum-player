# Changelog

All notable changes to this project will be documented in this file.

## [1.0.12] - 2026-01-16

### Fixed

- **CRITICAL**: Fixed center controls (play button, skip forward/backward) not showing after video source change
  - `wontum-player-container` CSS class now added before early return in `injectStyles()`
  - Previously, the class was only added on first player instance, causing hover-based controls to fail on subsequent instances
  - Center controls now properly visible on all video source changes

## [1.0.11] - 2026-01-16

### Fixed

- **CRITICAL**: Fixed controls disappearing when `src` prop changes in `WontumPlayerReact` component
  - UIController now properly removes progressContainer on destroy()
  - React component adds comprehensive dependency array to handle all prop changes
  - Added pre-cleanup to remove residual DOM elements before player reinitialization
  - Fixed memory leak from accumulated controls and progress bars in DOM

### Added

- **New Method**: `player.updateSource(src)` - Efficiently change video source without full player reinitialization
  - Better performance for video playlist/navigation scenarios
  - Properly destroys HLS instance and resets state
  - Emits `sourcechange` event when source changes
- **New Event**: `sourcechange` - Fires when video source is updated via `updateSource()`
- **React Enhancement**: Full dependency tracking in `WontumPlayerReact` useEffect for robust prop change handling
- **Documentation**: Added extensive guide for handling video source changes in React
- **Documentation**: Added `updateSource()` method examples and best practices

### Changed

- React component now properly cleans up all DOM elements (video, controls, progress bars) before reinitialization
- Improved null safety in destroy cleanup functions

## [1.0.0] - 2026-01-10

### Added

- Initial release of Wontum Player
- HLS streaming support with hls.js integration
- S3 URL handling with presigned URL support
- Built-in analytics and QoE metrics
- Customizable UI with player controls
- React components and hooks
- TypeScript support with full type definitions
- Quality selection (auto and manual)
- Fullscreen support
- Playback rate control
- Volume control
- Seek functionality
- Event system for player state changes
- Responsive design
- Mobile support
- Demo page with examples

### Features

- Play/pause/seek controls
- Progress bar with scrubbing
- Volume slider
- Quality selector
- Fullscreen toggle
- Playback speed control
- Analytics tracking
- S3 integration
- React wrapper components
- Custom event system
- Buffering indicators
- Error handling
- Auto-hide controls
- Custom theming support
