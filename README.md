# Wontum Player

A modern, feature-rich HLS video player SDK for educational platforms with CloudFront/S3 integration. Built with TypeScript, inspired by Mux Player with a unique modern design.

## ✨ Features

### Core Playback
- 🎬 **HLS Streaming**: Full HLS.js support with adaptive bitrate streaming
- 🔒 **CloudFront Integration**: Native support for CloudFront signed cookies and S3-hosted videos
- 🎯 **Skip Controls**: 10-second forward/backward skip with circular arrow buttons
- 🎯 **Click to Play/Pause**: Click video to toggle playback
- 📺 **Fullscreen**: Native fullscreen API support
- 🎛️ **Playback Rate**: Adjustable speed (0.5x - 2x)

### Subtitle & Accessibility
- 📝 **Subtitle Support**: Full subtitle/caption support with programmatic API
- 🌐 **Multi-language**: Support for multiple subtitle tracks with language selection
- ♿ **Accessibility**: WCAG compliant with keyboard navigation

### UI & Controls
- 🎨 **Modern UI Design**: Beautiful controls with blur effects, gradients, and smooth animations
- 🖱️ **Smart Controls**: Auto-hide on inactivity, fade on hover
- 📍 **Sticky Controls**: Optional persistent controls (toggle in settings)
- 🔊 **Vertical Volume**: Modern vertical volume slider with popup interface
- ⚙️ **Settings Menu**: Quality selection, playback speed, subtitle management
- 🎨 **7 Pre-made Themes**: Netflix, YouTube, Modern, Green, Cyberpunk, Pastel, Education
- 🎨 **Custom Theming**: Full CSS variable theming with 8 customizable properties

### Developer Experience
- ⚛️ **React Support**: Component, Hook, and Context Provider patterns
- 🔧 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 📊 **Analytics & QoE**: Built-in analytics tracking and Quality of Experience metrics
- 🎯 **25 Events**: Complete event system compatible with Mux Player
- 📱 **Responsive**: Mobile-friendly with touch support
- 🎬 **Quality Selector**: Automatic quality switching with manual override

## 📦 Installation

```bash
npm install @obipascal/player hls.js
```

Or with yarn:

```bash
yarn add @obipascal/player hls.js
```

## 🚀 Quick Start

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Wontum Player Demo</title>
	</head>
	<body>
		<div id="player-container"></div>

		<script type="module">
			import { WontumPlayer } from "@obipascal/player"

			const player = new WontumPlayer({
				src: "https://media.example.com/video/playlist.m3u8",
				container: "#player-container",
				autoplay: false,
				muted: false,
				controls: true,
				poster: "https://example.com/poster.jpg",
				// Enable subtitles
				subtitles: [
					{
						label: "English",
						src: "https://example.com/subtitles/en.vtt",
						srclang: "en",
						default: true,
					},
					{
						label: "Spanish",
						src: "https://example.com/subtitles/es.vtt",
						srclang: "es",
					},
				],
				// Sticky controls
				stickyControls: false,
				// Custom theme
				theme: {
					primaryColor: "#3b82f6",
					accentColor: "#60a5fa",
				},
			})

			// Listen to events
			player.on("play", () => console.log("Video playing"))
			player.on("pause", () => console.log("Video paused"))
			player.on("timeupdate", (event) => {
				console.log("Current time:", event.data.currentTime)
			})
			
			// Programmatic subtitle control
			player.enableSubtitles(0) // Enable first subtitle track
			player.toggleSubtitles() // Toggle subtitles on/off
		</script>
	</body>
</html>
```

### React Component

```tsx
import { WontumPlayerReact } from "@obipascal/player"

function VideoPlayer() {
	return (
		<WontumPlayerReact
			src="https://media.example.com/video/playlist.m3u8"
			width="100%"
			height="500px"
			autoplay={false}
			muted={false}
			controls={true}
			stickyControls={false}
			subtitles={[
				{
					label: "English",
					src: "https://example.com/subtitles/en.vtt",
					srclang: "en",
					default: true,
				},
			]}
			theme={{
				primaryColor: "#3b82f6",
				accentColor: "#60a5fa",
			}}
			onPlay={() => console.log("Playing")}
			onPause={() => console.log("Paused")}
			onTimeUpdate={(time) => console.log("Time:", time)}
			onSubtitleChange={(track) => console.log("Subtitle:", track)}
		/>
	)
}
```

### React Hook (Custom Controls)

```tsx
import { useWontumPlayer } from "@obipascal/player"

function CustomPlayer() {
	const { containerRef, player, state } = useWontumPlayer({
		src: "https://media.example.com/video/playlist.m3u8",
		controls: false, // Build your own custom controls
	})

	const handleSkipForward = () => player?.skipForward(10)
	const handleSkipBackward = () => player?.skipBackward(10)

	return (
		<div>
			<div ref={containerRef} style={{ width: "100%", height: "500px" }} />

			{state && (
				<div className="custom-controls">
					<button onClick={() => player?.play()}>Play</button>
					<button onClick={() => player?.pause()}>Pause</button>
					<button onClick={handleSkipBackward}>⏪ -10s</button>
					<button onClick={handleSkipForward}>⏩ +10s</button>
					<button onClick={() => player?.toggleSubtitles()}>CC</button>
					<p>
						{Math.floor(state.currentTime)}s / {Math.floor(state.duration)}s
					</p>
					<p>Status: {state.playing ? "Playing" : "Paused"}</p>
				</div>
			)}
		</div>
	)
}
```

### React Context Provider

```tsx
import { WontumPlayerProvider, useWontumPlayerContext } from "@obipascal/player"

function App() {
	return (
		<WontumPlayerProvider>
			<VideoSection />
			<ControlPanel />
		</WontumPlayerProvider>
	)
}

function VideoSection() {
	const { containerRef } = useWontumPlayerContext()
	return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />
}

function ControlPanel() {
	const { player, state } = useWontumPlayerContext()

	return (
		<div>
			<button onClick={() => player?.play()}>Play</button>
			<button onClick={() => player?.pause()}>Pause</button>
			<p>Playing: {state?.playing ? "Yes" : "No"}</p>
		</div>
	)
}
```

## 🔒 CloudFront & S3 Integration

### CloudFront with Signed Cookies (Recommended)

For secure video delivery, use CloudFront with signed cookies:

```typescript
import { WontumPlayer } from "@obipascal/player"

// Your backend sets signed cookies for CloudFront
// Cookie names: CloudFront-Policy, CloudFront-Signature, CloudFront-Key-Pair-Id

const player = new WontumPlayer({
	src: "https://media.yourdomain.com/video/playlist.m3u8",
	container: "#player",
	s3Config: {
		cloudfront: {
			domain: "media.yourdomain.com",
			// Cookies are automatically sent by browser
		},
	},
})
```

### CloudFront Signed Cookie Setup (Backend)

```typescript
// Node.js backend example
import { CloudFrontClient } from "@aws-sdk/client-cloudfront"
import { getSignedCookies } from "@aws-sdk/cloudfront-signer"

app.get("/api/video-auth", async (req, res) => {
	const policy = {
		Statement: [
			{
				Resource: "https://media.yourdomain.com/*",
				Condition: {
					DateLessThan: {
						"AWS:EpochTime": Math.floor(Date.now() / 1000) + 3600, // 1 hour
					},
				},
			},
		],
	}

	const cookies = getSignedCookies({
		keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
		privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
		policy: JSON.stringify(policy),
	})

	// Set cookies
	res.cookie("CloudFront-Policy", cookies["CloudFront-Policy"], {
		domain: ".yourdomain.com",
		secure: true,
		httpOnly: true,
	})
	res.cookie("CloudFront-Signature", cookies["CloudFront-Signature"], {
		domain: ".yourdomain.com",
		secure: true,
		httpOnly: true,
	})
	res.cookie("CloudFront-Key-Pair-Id", cookies["CloudFront-Key-Pair-Id"], {
		domain: ".yourdomain.com",
		secure: true,
		httpOnly: true,
	})

	res.json({ success: true })
})
```

### Public S3/CloudFront (No Authentication)

For public videos:

```typescript
const player = new WontumPlayer({
	src: "https://d1234567890.cloudfront.net/video/playlist.m3u8",
	container: "#player",
})
```

## 📝 Subtitle Support

### Adding Subtitles

```typescript
const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	subtitles: [
		{
			label: "English",
			src: "https://example.com/subtitles/en.vtt",
			srclang: "en",
			default: true, // Default track
		},
		{
			label: "Spanish",
			src: "https://example.com/subtitles/es.vtt",
			srclang: "es",
		},
		{
			label: "French",
			src: "https://example.com/subtitles/fr.vtt",
			srclang: "fr",
		},
	],
})
```

### Programmatic Subtitle Control

```typescript
// Enable specific subtitle track by index
player.enableSubtitles(0) // Enable first track (English)

// Disable all subtitles
player.disableSubtitles()

// Toggle subtitles on/off
player.toggleSubtitles()

// Get all subtitle tracks
const tracks = player.getSubtitleTracks()
console.log(tracks)
// [
//   { label: 'English', src: '...', srclang: 'en', default: true },
//   { label: 'Spanish', src: '...', srclang: 'es' }
// ]

// Check if subtitles are enabled
const enabled = player.areSubtitlesEnabled()
console.log(enabled) // true or false
```

### Subtitle Events

```typescript
player.on("subtitlechange", (event) => {
	console.log("Subtitle changed:", event.data.track)
})
```

## ⚙️ Settings & Controls

### Sticky Controls

Keep controls visible at all times:

```typescript
const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	stickyControls: true, // Controls always visible
})
```

Users can also toggle sticky controls from the settings menu in the player UI.

### Skip Controls

10-second skip buttons with circular arrow icons are automatically included:

```typescript
// Programmatic skip
player.skipForward(10) // Skip 10 seconds forward
player.skipBackward(10) // Skip 10 seconds backward

// Custom skip duration
player.seek(player.getCurrentTime() + 30) // Skip 30 seconds forward
```

### Click to Play/Pause

Clicking anywhere on the video toggles play/pause automatically.

### Volume Control

Modern vertical volume slider with popup interface - hover over volume button to adjust.

## 📊 Analytics

Track video engagement and quality metrics:

```typescript
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		endpoint: "https://your-analytics-endpoint.com/events",
		sessionId: "session_123",
		userId: "user_456",
		videoId: "video_789",
	},
})

// Get analytics metrics
const metrics = player.analytics.getMetrics()
console.log(metrics)
// {
//   sessionId: 'session_123',
//   totalPlayTime: 120000,
//   totalBufferTime: 2000,
//   bufferingRatio: 0.017,
//   rebufferCount: 3,
//   seekCount: 5,
//   eventCount: 42
// }
```

## API Reference

### WontumPlayer

#### Constructor Options

```typescript
interface WontumPlayerConfig {
	src: string // Video source URL (HLS manifest)
	container: HTMLElement | string // Container element or selector
	autoplay?: boolean // Auto-play on load (default: false)
	muted?: boolean // Start muted (default: false)
	controls?: boolean // Show controls (default: true)
	poster?: string // Poster image URL
	preload?: "none" | "metadata" | "auto" // Preload strategy
	theme?: PlayerTheme // Custom theme
	s3Config?: S3Config // S3 configuration
	analytics?: AnalyticsConfig // Analytics configuration
	hlsConfig?: Partial<any> // HLS.js config override
}
```

#### Methods

```typescript
// Playback control
player.play(): Promise<void>
player.pause(): void
player.seek(time: number): void

// Volume control
player.setVolume(volume: number): void  // 0-1
player.mute(): void
player.unmute(): void

// Playback rate
player.setPlaybackRate(rate: number): void  // 0.5, 1, 1.5, 2, etc.

// Quality control
player.setQuality(qualityIndex: number): void

// Fullscreen
player.enterFullscreen(): void
player.exitFullscreen(): void

// State
player.getState(): PlayerState

// Events
player.on(eventType: PlayerEventType, callback: (event: PlayerEvent) => void): void
player.off(eventType: PlayerEventType, callback: (event: PlayerEvent) => void): void

// Cleanup
player.destroy(): void
```

#### Events

```typescript
type PlayerEventType =
	| "play"
	| "pause"
	| "ended"
	| "timeupdate"
	| "volumechange"
	| "ratechange"
	| "seeked"
	| "seeking"
	| "waiting"
	| "canplay"
	| "loadedmetadata"
	| "error"
	| "qualitychange"
	| "fullscreenchange"
```

### React Components

#### WontumPlayerReact

```tsx
<WontumPlayerReact
	src="https://example.com/video.m3u8"
	width="100%"
	height="500px"
	autoplay={false}
	muted={false}
	controls={true}
	poster="https://example.com/poster.jpg"
	onReady={(player) => console.log("Player ready", player)}
	onPlay={() => console.log("Playing")}
	onPause={() => console.log("Paused")}
	onEnded={() => console.log("Ended")}
	onTimeUpdate={(time) => console.log("Time:", time)}
	onVolumeChange={(volume, muted) => console.log("Volume:", volume, muted)}
	onError={(error) => console.error("Error:", error)}
	theme={{
		primaryColor: "#3b82f6",
		accentColor: "#60a5fa",
		fontFamily: "Inter, sans-serif",
	}}
	analytics={{
		enabled: true,
		videoId: "video_123",
		userId: "user_456",
	}}
/>
```

#### useWontumPlayer Hook

```tsx
function CustomPlayer() {
	const { containerRef, player, state } = useWontumPlayer({
		src: "https://example.com/video.m3u8",
		controls: false, // Build custom controls
	})

	return (
		<div>
			<div ref={containerRef} style={{ width: "100%", height: "500px" }} />

			{state && (
				<div>
					<button onClick={() => player?.play()}>Play</button>
					<button onClick={() => player?.pause()}>Pause</button>
					<p>
						Time: {state.currentTime} / {state.duration}
					</p>
					<p>Status: {state.playing ? "Playing" : "Paused"}</p>
				</div>
			)}
		</div>
	)
}
```

## 🎨 Theming

### Pre-made Themes

Wontum Player comes with 7 beautiful pre-made themes:

```typescript
import {
	netflixTheme,
	youtubeTheme,
	modernTheme,
	greenTheme,
	cyberpunkTheme,
	pastelTheme,
	educationTheme,
} from "@obipascal/player"

const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	theme: netflixTheme(), // Netflix-inspired dark theme
})
```

**Available Themes:**
- `netflixTheme()` - Netflix-inspired red and black
- `youtubeTheme()` - YouTube-inspired red and white
- `modernTheme()` - Modern blue gradient
- `greenTheme()` - Nature-inspired green
- `cyberpunkTheme()` - Neon pink and purple
- `pastelTheme()` - Soft pastel colors
- `educationTheme()` - Professional education platform

### Custom Theme

Create your own custom theme with 8 customizable properties:

```typescript
const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	theme: {
		primaryColor: "#3b82f6", // Primary brand color
		accentColor: "#60a5fa", // Accent/hover color
		backgroundColor: "#1f2937", // Control background
		textColor: "#ffffff", // Text color
		fontFamily: "Inter, sans-serif", // Font
		borderRadius: "8px", // Corner radius
		controlHeight: "50px", // Control bar height
		iconSize: "24px", // Icon size
	},
})
```

### Brand Presets

Quick brand color presets:

```typescript
import { BrandPresets } from "@obipascal/player"

const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
	theme: {
		...modernTheme(),
		primaryColor: BrandPresets.blue,
		accentColor: BrandPresets.lightBlue,
	},
})
```

**Available Brand Colors:**
- `blue`, `lightBlue`, `darkBlue`
- `red`, `lightRed`, `darkRed`
- `green`, `lightGreen`, `darkGreen`
- `purple`, `lightPurple`, `darkPurple`
- `pink`, `lightPink`, `darkPink`
- `orange`, `lightOrange`, `darkOrange`

## 🔧 Advanced Usage

### Custom HLS Configuration

Pass custom HLS.js configuration:

```typescript
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	hlsConfig: {
		maxBufferLength: 30,
		maxMaxBufferLength: 600,
		startLevel: -1, // Auto quality
		capLevelToPlayerSize: true,
		enableWorker: true,
		lowLatencyMode: false,
	},
})
```

### Multiple Players on Same Page

```typescript
const player1 = new WontumPlayer({
	src: "https://example.com/video1.m3u8",
	container: "#player-1",
	theme: netflixTheme(),
})

const player2 = new WontumPlayer({
	src: "https://example.com/video2.m3u8",
	container: "#player-2",
	theme: youtubeTheme(),
})

// Each player operates independently
player1.play()
player2.pause()
```

### Event Handling

```typescript
const player = new WontumPlayer({
	src: "https://media.example.com/video/playlist.m3u8",
	container: "#player",
})

// Playback events
player.on("play", () => console.log("Playing"))
player.on("pause", () => console.log("Paused"))
player.on("ended", () => console.log("Video ended"))

// Time tracking
player.on("timeupdate", (event) => {
	const { currentTime, duration } = event.data
	console.log(`${currentTime}s / ${duration}s`)
})

// Quality changes
player.on("qualitychange", (event) => {
	console.log("Quality changed to:", event.data.quality)
})

// Buffer events
player.on("waiting", () => console.log("Buffering..."))
player.on("canplay", () => console.log("Ready to play"))

// Error handling
player.on("error", (event) => {
	console.error("Player error:", event.data)
})

// Subtitle changes
player.on("subtitlechange", (event) => {
	console.log("Subtitle track:", event.data.track)
})

// Remove event listener
const handlePlay = () => console.log("Playing")
player.on("play", handlePlay)
player.off("play", handlePlay)
```

### State Management

```typescript
// Get current player state
const state = player.getState()
console.log(state)
// {
//   playing: false,
//   currentTime: 45.2,
//   duration: 300,
//   volume: 0.8,
//   muted: false,
//   playbackRate: 1,
//   buffered: [...],
//   qualities: [...],
//   currentQuality: 2
// }

// Track specific properties
const currentTime = player.getCurrentTime() // 45.2
const duration = player.getDuration() // 300
const isPlaying = player.getState().playing // false
```

### Programmatic Control

```typescript
// Playback control
await player.play()
player.pause()
player.seek(60) // Seek to 60 seconds
player.skipForward(10) // Skip 10 seconds forward
player.skipBackward(10) // Skip 10 seconds backward

// Volume control
player.setVolume(0.5) // Set to 50%
player.mute()
player.unmute()

// Playback speed
player.setPlaybackRate(1.5) // 1.5x speed
player.setPlaybackRate(0.5) // 0.5x speed

// Quality selection
const qualities = player.getQualities()
player.setQuality(2) // Set to quality index 2

// Fullscreen
player.enterFullscreen()
player.exitFullscreen()

// Cleanup
player.destroy() // Remove player and clean up resources
```

## 📋 Complete API Reference

For detailed API documentation including all methods, events, types, and configuration options, see **[API-REFERENCE.md](./API-REFERENCE.md)**.

### Quick Reference

**Player Methods:**
- **Playback:** `play()`, `pause()`, `seek(time)`, `skipForward(seconds)`, `skipBackward(seconds)`
- **Volume:** `setVolume(level)`, `mute()`, `unmute()`
- **Subtitles:** `enableSubtitles(index)`, `disableSubtitles()`, `toggleSubtitles()`, `getSubtitleTracks()`, `areSubtitlesEnabled()`
- **Quality:** `setQuality(index)`, `getQualities()`
- **Playback Rate:** `setPlaybackRate(rate)`
- **Fullscreen:** `enterFullscreen()`, `exitFullscreen()`
- **State:** `getState()`, `getCurrentTime()`, `getDuration()`
- **Lifecycle:** `destroy()`

**Events (25 total):**
- **Playback:** `play`, `pause`, `ended`, `timeupdate`, `durationchange`
- **Loading:** `loadstart`, `loadedmetadata`, `loadeddata`, `canplay`, `canplaythrough`
- **Buffering:** `waiting`, `playing`, `stalled`, `suspend`, `abort`
- **Seeking:** `seeking`, `seeked`
- **Volume:** `volumechange`
- **Quality:** `qualitychange`, `renditionchange`
- **Errors:** `error`
- **Playback Rate:** `ratechange`
- **Fullscreen:** `fullscreenchange`
- **Resize:** `resize`
- **Subtitles:** `subtitlechange`

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | Latest 2 versions |
| Edge | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| iOS Safari | iOS 12+ |
| Android Chrome | Latest 2 versions |

**Note:** HLS playback requires HLS.js support. Native HLS playback is supported on Safari.

## 📝 License

MIT © Wontum Player

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/yourorg/wontum-player/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourorg/wontum-player/discussions)
- **Email:** support@wontum.com

## 🙏 Acknowledgments

- Inspired by [Mux Player](https://www.mux.com/player)
- Powered by [HLS.js](https://github.com/video-dev/hls.js)
- Built with [TypeScript](https://www.typescriptlang.org/)

---

Made with ❤️ for educational platforms
