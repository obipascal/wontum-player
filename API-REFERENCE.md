# Wontum Player API Reference

Complete API documentation for Wontum Player SDK.

## Table of Contents

- [WontumPlayer Class](#wontumplayer-class)
  - [Constructor](#constructor)
  - [Playback Methods](#playback-methods)
  - [Volume Methods](#volume-methods)
  - [Subtitle Methods](#subtitle-methods)
  - [Quality Methods](#quality-methods)
  - [Playback Rate Methods](#playback-rate-methods)
  - [Fullscreen Methods](#fullscreen-methods)
  - [State Methods](#state-methods)
  - [Event Methods](#event-methods)
  - [Lifecycle Methods](#lifecycle-methods)
- [Configuration](#configuration)
  - [WontumPlayerConfig](#wontumplayerconfig)
  - [PlayerTheme](#playertheme)
  - [S3Config](#s3config)
  - [AnalyticsConfig](#analyticsconfig)
  - [SubtitleTrack](#subtitletrack)
- [Events](#events)
  - [Event Types](#event-types)
  - [Event Data](#event-data)
- [React API](#react-api)
  - [WontumPlayerReact](#wontumplayerreact)
  - [useWontumPlayer](#usewontumplayer)
  - [WontumPlayerProvider](#wontumplayerprovider)
  - [useWontumPlayerContext](#usewontumplayercontext)
- [Types](#types)
  - [PlayerState](#playerstate)
  - [PlayerEvent](#playerevent)
  - [QualityLevel](#qualitylevel)
- [Themes](#themes)
  - [Pre-made Themes](#pre-made-themes)
  - [Brand Presets](#brand-presets-1)
- [Analytics](#analytics-1)
  - [Metrics](#metrics)
  - [Events](#analytics-events)

---

## WontumPlayer Class

The main player class for controlling video playback.

### Constructor

```typescript
new WontumPlayer(config: WontumPlayerConfig): WontumPlayer
```

**Parameters:**
- `config` - Configuration object (see [WontumPlayerConfig](#wontumplayerconfig))

**Returns:** WontumPlayer instance

**Example:**
```typescript
import { WontumPlayer } from "@obipascal/player"

const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player-container",
	autoplay: false,
	controls: true,
	theme: {
		primaryColor: "#3b82f6",
	},
})
```

---

### Playback Methods

#### `play()`

Start video playback.

```typescript
play(): Promise<void>
```

**Returns:** Promise that resolves when playback starts

**Example:**
```typescript
await player.play()
console.log("Video is playing")
```

**Events Emitted:** `play`, `playing`

---

#### `pause()`

Pause video playback.

```typescript
pause(): void
```

**Example:**
```typescript
player.pause()
```

**Events Emitted:** `pause`

---

#### `seek(time: number)`

Seek to a specific time in the video.

```typescript
seek(time: number): void
```

**Parameters:**
- `time` - Target time in seconds

**Example:**
```typescript
player.seek(60) // Seek to 1 minute
player.seek(player.getCurrentTime() + 10) // Skip forward 10 seconds
```

**Events Emitted:** `seeking`, `seeked`, `timeupdate`

---

#### `skipForward(seconds: number)`

Skip forward by specified number of seconds.

```typescript
skipForward(seconds: number = 10): void
```

**Parameters:**
- `seconds` - Number of seconds to skip (default: 10)

**Example:**
```typescript
player.skipForward(10) // Skip forward 10 seconds
player.skipForward(30) // Skip forward 30 seconds
```

**Events Emitted:** `seeking`, `seeked`, `timeupdate`

---

#### `skipBackward(seconds: number)`

Skip backward by specified number of seconds.

```typescript
skipBackward(seconds: number = 10): void
```

**Parameters:**
- `seconds` - Number of seconds to skip (default: 10)

**Example:**
```typescript
player.skipBackward(10) // Skip backward 10 seconds
player.skipBackward(30) // Skip backward 30 seconds
```

**Events Emitted:** `seeking`, `seeked`, `timeupdate`

---

### Volume Methods

#### `setVolume(volume: number)`

Set the playback volume.

```typescript
setVolume(volume: number): void
```

**Parameters:**
- `volume` - Volume level (0.0 to 1.0)

**Example:**
```typescript
player.setVolume(0.5) // Set to 50%
player.setVolume(1.0) // Set to 100%
player.setVolume(0) // Mute
```

**Events Emitted:** `volumechange`

---

#### `mute()`

Mute the audio.

```typescript
mute(): void
```

**Example:**
```typescript
player.mute()
```

**Events Emitted:** `volumechange`

---

#### `unmute()`

Unmute the audio.

```typescript
unmute(): void
```

**Example:**
```typescript
player.unmute()
```

**Events Emitted:** `volumechange`

---

### Subtitle Methods

#### `enableSubtitles(index: number)`

Enable a specific subtitle track.

```typescript
enableSubtitles(index: number): void
```

**Parameters:**
- `index` - Index of the subtitle track to enable (0-based)

**Example:**
```typescript
player.enableSubtitles(0) // Enable first subtitle track
player.enableSubtitles(1) // Enable second subtitle track
```

**Events Emitted:** `subtitlechange`

---

#### `disableSubtitles()`

Disable all subtitles.

```typescript
disableSubtitles(): void
```

**Example:**
```typescript
player.disableSubtitles()
```

**Events Emitted:** `subtitlechange`

---

#### `toggleSubtitles()`

Toggle subtitles on/off. If subtitles are currently enabled, they will be disabled. If disabled, the first available track will be enabled.

```typescript
toggleSubtitles(): void
```

**Example:**
```typescript
player.toggleSubtitles()
```

**Events Emitted:** `subtitlechange`

---

#### `getSubtitleTracks()`

Get all available subtitle tracks.

```typescript
getSubtitleTracks(): SubtitleTrack[]
```

**Returns:** Array of subtitle tracks

**Example:**
```typescript
const tracks = player.getSubtitleTracks()
console.log(tracks)
// [
//   { label: 'English', src: '...', srclang: 'en', default: true },
//   { label: 'Spanish', src: '...', srclang: 'es' }
// ]
```

---

#### `areSubtitlesEnabled()`

Check if subtitles are currently enabled.

```typescript
areSubtitlesEnabled(): boolean
```

**Returns:** `true` if subtitles are enabled, `false` otherwise

**Example:**
```typescript
if (player.areSubtitlesEnabled()) {
	console.log("Subtitles are on")
} else {
	console.log("Subtitles are off")
}
```

---

### Quality Methods

#### `setQuality(qualityIndex: number)`

Set the video quality level.

```typescript
setQuality(qualityIndex: number): void
```

**Parameters:**
- `qualityIndex` - Index of the quality level (-1 for auto)

**Example:**
```typescript
player.setQuality(-1) // Auto quality
player.setQuality(0) // Lowest quality
player.setQuality(2) // Specific quality level
```

**Events Emitted:** `qualitychange`

---

#### `getQualities()`

Get all available quality levels.

```typescript
getQualities(): QualityLevel[]
```

**Returns:** Array of quality levels

**Example:**
```typescript
const qualities = player.getQualities()
qualities.forEach((quality, index) => {
	console.log(`${index}: ${quality.height}p - ${quality.bitrate} kbps`)
})
// 0: 360p - 800 kbps
// 1: 720p - 2500 kbps
// 2: 1080p - 5000 kbps
```

---

### Playback Rate Methods

#### `setPlaybackRate(rate: number)`

Set the playback speed.

```typescript
setPlaybackRate(rate: number): void
```

**Parameters:**
- `rate` - Playback rate (0.25 to 2.0)
  - `0.25` - Quarter speed
  - `0.5` - Half speed
  - `1.0` - Normal speed
  - `1.5` - 1.5x speed
  - `2.0` - Double speed

**Example:**
```typescript
player.setPlaybackRate(1.5) // 1.5x speed
player.setPlaybackRate(0.5) // Slow motion
player.setPlaybackRate(1.0) // Normal speed
```

**Events Emitted:** `ratechange`

---

### Fullscreen Methods

#### `enterFullscreen()`

Enter fullscreen mode.

```typescript
enterFullscreen(): void
```

**Example:**
```typescript
player.enterFullscreen()
```

**Events Emitted:** `fullscreenchange`

---

#### `exitFullscreen()`

Exit fullscreen mode.

```typescript
exitFullscreen(): void
```

**Example:**
```typescript
player.exitFullscreen()
```

**Events Emitted:** `fullscreenchange`

---

### State Methods

#### `getState()`

Get the current player state.

```typescript
getState(): PlayerState
```

**Returns:** Current player state object

**Example:**
```typescript
const state = player.getState()
console.log(state)
// {
//   playing: true,
//   currentTime: 45.2,
//   duration: 300,
//   volume: 0.8,
//   muted: false,
//   playbackRate: 1,
//   buffered: [...],
//   qualities: [...],
//   currentQuality: 2,
//   isFullscreen: false
// }
```

---

#### `getCurrentTime()`

Get the current playback time in seconds.

```typescript
getCurrentTime(): number
```

**Returns:** Current time in seconds

**Example:**
```typescript
const currentTime = player.getCurrentTime()
console.log(`Current position: ${currentTime}s`)
```

---

#### `getDuration()`

Get the total duration of the video in seconds.

```typescript
getDuration(): number
```

**Returns:** Total duration in seconds

**Example:**
```typescript
const duration = player.getDuration()
console.log(`Total duration: ${duration}s`)
```

---

### Event Methods

#### `on(eventType: string, callback: Function)`

Add an event listener.

```typescript
on(eventType: PlayerEventType, callback: (event: PlayerEvent) => void): void
```

**Parameters:**
- `eventType` - Type of event to listen for (see [Event Types](#event-types))
- `callback` - Function to call when event occurs

**Example:**
```typescript
player.on("play", () => {
	console.log("Video started playing")
})

player.on("timeupdate", (event) => {
	console.log("Current time:", event.data.currentTime)
})

player.on("error", (event) => {
	console.error("Error:", event.data)
})
```

---

#### `off(eventType: string, callback: Function)`

Remove an event listener.

```typescript
off(eventType: PlayerEventType, callback: (event: PlayerEvent) => void): void
```

**Parameters:**
- `eventType` - Type of event
- `callback` - The exact function reference that was added with `on()`

**Example:**
```typescript
const handlePlay = () => console.log("Playing")

player.on("play", handlePlay)
// ... later
player.off("play", handlePlay)
```

---

### Lifecycle Methods

#### `destroy()`

Destroy the player instance and clean up all resources.

```typescript
destroy(): void
```

**Example:**
```typescript
// When you're done with the player
player.destroy()
```

**Note:** After calling `destroy()`, the player instance should not be used anymore. Create a new instance if needed.

---

## Configuration

### WontumPlayerConfig

Main configuration interface for player initialization.

```typescript
interface WontumPlayerConfig {
	// Required
	src: string
	container: HTMLElement | string

	// Playback
	autoplay?: boolean
	muted?: boolean
	controls?: boolean
	preload?: "none" | "metadata" | "auto"
	poster?: string
	loop?: boolean

	// Subtitles
	subtitles?: SubtitleTrack[]

	// UI
	theme?: PlayerTheme
	stickyControls?: boolean

	// Infrastructure
	s3Config?: S3Config
	hlsConfig?: Partial<HlsConfig>

	// Analytics
	analytics?: AnalyticsConfig
}
```

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `src` | `string` | **Required** | HLS manifest URL (.m3u8) |
| `container` | `HTMLElement \| string` | **Required** | Container element or CSS selector |
| `autoplay` | `boolean` | `false` | Auto-play on load |
| `muted` | `boolean` | `false` | Start muted |
| `controls` | `boolean` | `true` | Show player controls |
| `preload` | `string` | `"metadata"` | Preload strategy |
| `poster` | `string` | `undefined` | Poster image URL |
| `loop` | `boolean` | `false` | Loop playback |
| `subtitles` | `SubtitleTrack[]` | `[]` | Subtitle tracks |
| `theme` | `PlayerTheme` | `modernTheme()` | Theme configuration |
| `stickyControls` | `boolean` | `false` | Keep controls always visible |
| `s3Config` | `S3Config` | `undefined` | S3/CloudFront configuration |
| `hlsConfig` | `Partial<HlsConfig>` | `{}` | HLS.js configuration |
| `analytics` | `AnalyticsConfig` | `undefined` | Analytics configuration |

**Example:**
```typescript
const config: WontumPlayerConfig = {
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	autoplay: false,
	muted: false,
	controls: true,
	poster: "https://example.com/poster.jpg",
	subtitles: [
		{
			label: "English",
			src: "https://example.com/en.vtt",
			srclang: "en",
			default: true,
		},
	],
	theme: {
		primaryColor: "#3b82f6",
		accentColor: "#60a5fa",
	},
	stickyControls: false,
	analytics: {
		enabled: true,
		videoId: "video_123",
		userId: "user_456",
	},
}
```

---

### PlayerTheme

Theme customization options.

```typescript
interface PlayerTheme {
	primaryColor?: string
	accentColor?: string
	backgroundColor?: string
	textColor?: string
	fontFamily?: string
	borderRadius?: string
	controlHeight?: string
	iconSize?: string
}
```

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `primaryColor` | `string` | `"#3b82f6"` | Primary brand color |
| `accentColor` | `string` | `"#60a5fa"` | Accent/hover color |
| `backgroundColor` | `string` | `"rgba(0,0,0,0.8)"` | Control background |
| `textColor` | `string` | `"#ffffff"` | Text color |
| `fontFamily` | `string` | `"system-ui, sans-serif"` | Font family |
| `borderRadius` | `string` | `"6px"` | Corner radius |
| `controlHeight` | `string` | `"50px"` | Control bar height |
| `iconSize` | `string` | `"24px"` | Icon size |

**Example:**
```typescript
const theme: PlayerTheme = {
	primaryColor: "#ef4444",
	accentColor: "#f87171",
	backgroundColor: "rgba(10, 10, 10, 0.95)",
	textColor: "#ffffff",
	fontFamily: "Inter, sans-serif",
	borderRadius: "8px",
	controlHeight: "60px",
	iconSize: "28px",
}
```

---

### S3Config

Configuration for S3/CloudFront integration.

```typescript
interface S3Config {
	cloudfront?: {
		domain: string
	}
	region?: string
	credentials?: {
		accessKeyId: string
		secretAccessKey: string
	}
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `cloudfront.domain` | `string` | CloudFront distribution domain |
| `region` | `string` | AWS region |
| `credentials` | `object` | AWS credentials (for direct S3 access) |

**Example:**
```typescript
const s3Config: S3Config = {
	cloudfront: {
		domain: "media.example.com",
	},
	region: "us-east-1",
}
```

---

### AnalyticsConfig

Analytics tracking configuration.

```typescript
interface AnalyticsConfig {
	enabled: boolean
	endpoint?: string
	sessionId?: string
	userId?: string
	videoId?: string
	customData?: Record<string, any>
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | `boolean` | Enable analytics tracking |
| `endpoint` | `string` | Analytics endpoint URL |
| `sessionId` | `string` | Session identifier |
| `userId` | `string` | User identifier |
| `videoId` | `string` | Video identifier |
| `customData` | `object` | Custom data to include |

**Example:**
```typescript
const analytics: AnalyticsConfig = {
	enabled: true,
	endpoint: "https://analytics.example.com/events",
	sessionId: "session_abc123",
	userId: "user_456",
	videoId: "video_789",
	customData: {
		courseId: "course_101",
		lessonId: "lesson_5",
	},
}
```

---

### SubtitleTrack

Subtitle track configuration.

```typescript
interface SubtitleTrack {
	label: string
	src: string
	srclang: string
	default?: boolean
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Display name for the track |
| `src` | `string` | WebVTT file URL |
| `srclang` | `string` | Language code (ISO 639-1) |
| `default` | `boolean` | Set as default track |

**Example:**
```typescript
const subtitles: SubtitleTrack[] = [
	{
		label: "English",
		src: "https://example.com/subtitles/en.vtt",
		srclang: "en",
		default: true,
	},
	{
		label: "Español",
		src: "https://example.com/subtitles/es.vtt",
		srclang: "es",
	},
	{
		label: "Français",
		src: "https://example.com/subtitles/fr.vtt",
		srclang: "fr",
	},
]
```

---

## Events

### Event Types

Wontum Player supports 25 event types, fully compatible with Mux Player:

#### Playback Events
- `play` - Playback has started
- `pause` - Playback has paused
- `ended` - Playback has ended
- `playing` - Playback is playing after being paused or buffering
- `timeupdate` - Current playback time has changed
- `durationchange` - Duration has changed

#### Loading Events
- `loadstart` - Started loading media
- `loadedmetadata` - Metadata has been loaded
- `loadeddata` - First frame has been loaded
- `canplay` - Playback can start
- `canplaythrough` - Can play through without buffering

#### Buffering Events
- `waiting` - Playback stopped due to buffering
- `stalled` - Browser is trying to fetch data but it's not coming
- `suspend` - Media loading has been suspended
- `abort` - Media loading was aborted

#### Seeking Events
- `seeking` - Seeking operation has started
- `seeked` - Seeking operation has completed

#### Quality Events
- `qualitychange` - Video quality level changed
- `renditionchange` - HLS rendition changed

#### Volume Events
- `volumechange` - Volume or muted state changed

#### Playback Rate Events
- `ratechange` - Playback rate changed

#### Fullscreen Events
- `fullscreenchange` - Fullscreen state changed

#### Error Events
- `error` - An error occurred

#### Resize Events
- `resize` - Player size changed

#### Subtitle Events
- `subtitlechange` - Subtitle track changed

---

### Event Data

Each event includes contextual data:

```typescript
interface PlayerEvent {
	type: PlayerEventType
	timestamp: number
	data: Record<string, any>
}
```

**Common Event Data:**

| Event Type | Data Properties |
|------------|----------------|
| `play` | None |
| `pause` | None |
| `timeupdate` | `currentTime`, `duration` |
| `volumechange` | `volume`, `muted` |
| `qualitychange` | `quality`, `qualityIndex` |
| `error` | `error`, `code`, `message` |
| `subtitlechange` | `track`, `trackIndex` |
| `seeking` | `currentTime`, `targetTime` |
| `seeked` | `currentTime` |
| `ratechange` | `playbackRate` |
| `fullscreenchange` | `isFullscreen` |
| `resize` | `width`, `height` |

**Example:**
```typescript
player.on("timeupdate", (event) => {
	console.log("Event type:", event.type) // "timeupdate"
	console.log("Timestamp:", event.timestamp) // 1234567890
	console.log("Current time:", event.data.currentTime) // 45.2
	console.log("Duration:", event.data.duration) // 300
})

player.on("error", (event) => {
	console.error("Error:", event.data.error)
	console.error("Code:", event.data.code)
	console.error("Message:", event.data.message)
})
```

---

## React API

### WontumPlayerReact

React component for embedding the player.

```typescript
function WontumPlayerReact(props: WontumPlayerReactProps): JSX.Element
```

**Props:**

```typescript
interface WontumPlayerReactProps extends WontumPlayerConfig {
	width?: string
	height?: string
	className?: string
	style?: React.CSSProperties

	// Event callbacks
	onReady?: (player: WontumPlayer) => void
	onPlay?: () => void
	onPause?: () => void
	onEnded?: () => void
	onTimeUpdate?: (time: number) => void
	onVolumeChange?: (volume: number, muted: boolean) => void
	onError?: (error: any) => void
	onQualityChange?: (quality: QualityLevel) => void
	onSubtitleChange?: (track: SubtitleTrack | null) => void
	onRateChange?: (rate: number) => void
	onFullscreenChange?: (isFullscreen: boolean) => void
}
```

**Example:**
```tsx
import { WontumPlayerReact } from "@obipascal/player"
import { useState } from "react"

function VideoPlayer() {
	const [player, setPlayer] = useState<WontumPlayer | null>(null)

	return (
		<WontumPlayerReact
			src="https://media.example.com/video/playlist.m3u8"
			width="100%"
			height="500px"
			autoplay={false}
			controls={true}
			subtitles={[
				{
					label: "English",
					src: "/subtitles/en.vtt",
					srclang: "en",
					default: true,
				},
			]}
			theme={{
				primaryColor: "#3b82f6",
				accentColor: "#60a5fa",
			}}
			onReady={(p) => {
				setPlayer(p)
				console.log("Player ready")
			}}
			onPlay={() => console.log("Playing")}
			onPause={() => console.log("Paused")}
			onTimeUpdate={(time) => console.log("Time:", time)}
			onError={(error) => console.error("Error:", error)}
		/>
	)
}
```

---

### useWontumPlayer

React hook for building custom player interfaces.

```typescript
function useWontumPlayer(
	config: WontumPlayerConfig
): {
	containerRef: React.RefObject<HTMLDivElement>
	player: WontumPlayer | null
	state: PlayerState | null
}
```

**Returns:**
- `containerRef` - Ref to attach to container element
- `player` - Player instance (null until initialized)
- `state` - Current player state (null until initialized)

**Example:**
```tsx
import { useWontumPlayer } from "@obipascal/player"

function CustomPlayer() {
	const { containerRef, player, state } = useWontumPlayer({
		src: "https://media.example.com/video/playlist.m3u8",
		controls: false, // Build custom controls
	})

	const handleSkipForward = () => player?.skipForward(10)
	const handleSkipBackward = () => player?.skipBackward(10)

	return (
		<div>
			<div ref={containerRef} style={{ width: "100%", height: "500px" }} />

			{state && (
				<div className="custom-controls">
					<button onClick={() => player?.play()}>
						{state.playing ? "⏸ Pause" : "▶ Play"}
					</button>
					<button onClick={handleSkipBackward}>⏪ -10s</button>
					<button onClick={handleSkipForward}>⏩ +10s</button>
					<button onClick={() => player?.toggleSubtitles()}>CC</button>

					<input
						type="range"
						min="0"
						max={state.duration}
						value={state.currentTime}
						onChange={(e) => player?.seek(Number(e.target.value))}
					/>

					<span>
						{Math.floor(state.currentTime)}s / {Math.floor(state.duration)}s
					</span>
				</div>
			)}
		</div>
	)
}
```

---

### WontumPlayerProvider

Context provider for sharing player instance across components.

```typescript
function WontumPlayerProvider(props: {
	config: WontumPlayerConfig
	children: React.ReactNode
}): JSX.Element
```

**Props:**
- `config` - Player configuration
- `children` - Child components

**Example:**
```tsx
import { WontumPlayerProvider } from "@obipascal/player"

function App() {
	return (
		<WontumPlayerProvider
			config={{
				src: "https://media.example.com/video/playlist.m3u8",
				controls: false,
			}}
		>
			<VideoSection />
			<ControlPanel />
			<Transcript />
		</WontumPlayerProvider>
	)
}
```

---

### useWontumPlayerContext

Hook to access player from context.

```typescript
function useWontumPlayerContext(): {
	containerRef: React.RefObject<HTMLDivElement>
	player: WontumPlayer | null
	state: PlayerState | null
}
```

**Returns:**
- `containerRef` - Ref to attach to container element
- `player` - Player instance
- `state` - Current player state

**Example:**
```tsx
import { useWontumPlayerContext } from "@obipascal/player"

function ControlPanel() {
	const { player, state } = useWontumPlayerContext()

	if (!state) return <div>Loading...</div>

	return (
		<div>
			<button onClick={() => player?.play()}>Play</button>
			<button onClick={() => player?.pause()}>Pause</button>
			<p>Status: {state.playing ? "Playing" : "Paused"}</p>
			<p>Time: {state.currentTime.toFixed(1)}s</p>
		</div>
	)
}

function VideoSection() {
	const { containerRef } = useWontumPlayerContext()
	return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />
}
```

---

## Types

### PlayerState

Current state of the player.

```typescript
interface PlayerState {
	playing: boolean
	currentTime: number
	duration: number
	volume: number
	muted: boolean
	playbackRate: number
	buffered: TimeRanges
	qualities: QualityLevel[]
	currentQuality: number
	isFullscreen: boolean
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `playing` | `boolean` | Whether video is currently playing |
| `currentTime` | `number` | Current playback time (seconds) |
| `duration` | `number` | Total duration (seconds) |
| `volume` | `number` | Volume level (0-1) |
| `muted` | `boolean` | Whether audio is muted |
| `playbackRate` | `number` | Playback speed (0.25-2.0) |
| `buffered` | `TimeRanges` | Buffered time ranges |
| `qualities` | `QualityLevel[]` | Available quality levels |
| `currentQuality` | `number` | Current quality index (-1 = auto) |
| `isFullscreen` | `boolean` | Whether in fullscreen mode |

---

### PlayerEvent

Event object passed to event listeners.

```typescript
interface PlayerEvent {
	type: PlayerEventType
	timestamp: number
	data: Record<string, any>
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `type` | `PlayerEventType` | Event type |
| `timestamp` | `number` | Unix timestamp (milliseconds) |
| `data` | `object` | Event-specific data |

---

### QualityLevel

Video quality level information.

```typescript
interface QualityLevel {
	height: number
	width: number
	bitrate: number
	name: string
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `height` | `number` | Video height (pixels) |
| `width` | `number` | Video width (pixels) |
| `bitrate` | `number` | Bitrate (kbps) |
| `name` | `string` | Display name (e.g., "1080p") |

---

## Themes

### Pre-made Themes

Wontum Player includes 7 professionally designed themes:

#### netflixTheme()
```typescript
import { netflixTheme } from "@obipascal/player"

const theme = netflixTheme()
// Dark theme with Netflix red (#e50914)
```

#### youtubeTheme()
```typescript
import { youtubeTheme } from "@obipascal/player"

const theme = youtubeTheme()
// Bright theme with YouTube red (#ff0000)
```

#### modernTheme()
```typescript
import { modernTheme } from "@obipascal/player"

const theme = modernTheme()
// Modern blue gradient theme (#3b82f6)
```

#### greenTheme()
```typescript
import { greenTheme } from "@obipascal/player"

const theme = greenTheme()
// Nature-inspired green theme (#10b981)
```

#### cyberpunkTheme()
```typescript
import { cyberpunkTheme } from "@obipascal/player"

const theme = cyberpunkTheme()
// Neon pink and purple theme (#ff006e)
```

#### pastelTheme()
```typescript
import { pastelTheme } from "@obipascal/player"

const theme = pastelTheme()
// Soft pastel colors (#a78bfa)
```

#### educationTheme()
```typescript
import { educationTheme } from "@obipascal/player"

const theme = educationTheme()
// Professional education platform theme (#3b82f6)
```

---

### Brand Presets

Quick access to common brand colors:

```typescript
import { BrandPresets } from "@obipascal/player"

// Blues
BrandPresets.blue // #3b82f6
BrandPresets.lightBlue // #60a5fa
BrandPresets.darkBlue // #1e40af

// Reds
BrandPresets.red // #ef4444
BrandPresets.lightRed // #f87171
BrandPresets.darkRed // #b91c1c

// Greens
BrandPresets.green // #10b981
BrandPresets.lightGreen // #34d399
BrandPresets.darkGreen // #047857

// Purples
BrandPresets.purple // #8b5cf6
BrandPresets.lightPurple // #a78bfa
BrandPresets.darkPurple // #6d28d9

// Pinks
BrandPresets.pink // #ec4899
BrandPresets.lightPink // #f472b6
BrandPresets.darkPink // #be185d

// Oranges
BrandPresets.orange // #f59e0b
BrandPresets.lightOrange // #fbbf24
BrandPresets.darkOrange // #d97706
```

**Example:**
```typescript
const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	theme: {
		...modernTheme(),
		primaryColor: BrandPresets.purple,
		accentColor: BrandPresets.lightPurple,
	},
})
```

---

## Analytics

### Metrics

Get analytics metrics:

```typescript
const metrics = player.analytics.getMetrics()
```

**Returns:**
```typescript
interface AnalyticsMetrics {
	sessionId: string
	totalPlayTime: number // milliseconds
	totalBufferTime: number // milliseconds
	bufferingRatio: number // 0-1
	rebufferCount: number
	seekCount: number
	eventCount: number
	qualityChanges: number
	averageQuality: number
}
```

**Example:**
```typescript
const metrics = player.analytics.getMetrics()
console.log(`Watch time: ${metrics.totalPlayTime / 1000}s`)
console.log(`Buffer ratio: ${(metrics.bufferingRatio * 100).toFixed(1)}%`)
console.log(`Rebuffers: ${metrics.rebufferCount}`)
console.log(`Seeks: ${metrics.seekCount}`)
```

---

### Analytics Events

Analytics automatically tracks these events:

- Playback events (play, pause, ended)
- Time updates (every 10 seconds)
- Quality changes
- Buffer events
- Seek events
- Error events
- Volume changes
- Playback rate changes

**Custom Data:**
```typescript
const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		endpoint: "https://analytics.example.com/events",
		customData: {
			courseId: "course_101",
			lessonId: "lesson_5",
			studentId: "student_789",
		},
	},
})
```

All custom data is included with every analytics event sent to your endpoint.

---

## License

MIT © Wontum Player

---

## Support

- **Documentation:** [README.md](./README.md)
- **Issues:** [GitHub Issues](https://github.com/yourorg/wontum-player/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourorg/wontum-player/discussions)
