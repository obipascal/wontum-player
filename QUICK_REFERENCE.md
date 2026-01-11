# Wontum Player - Quick Reference

## 📦 Installation

```bash
npm install @wontum/player hls.js
```

## 🎯 Basic Usage

### JavaScript

```javascript
import { WontumPlayer } from "@wontum/player"

const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
})
```

### React

```tsx
import { WontumPlayerReact } from "@wontum/player"

;<WontumPlayerReact src="https://example.com/video.m3u8" width="100%" height="500px" />
```

## 🎮 Player Control

```javascript
player.play() // Start playback
player.pause() // Pause playback
player.seek(30) // Seek to 30 seconds
player.setVolume(0.5) // Set volume (0-1)
player.mute() // Mute audio
player.unmute() // Unmute audio
player.setPlaybackRate(1.5) // Set speed (0.5-2)
player.setQuality(1) // Set quality level
player.enterFullscreen() // Enter fullscreen
player.exitFullscreen() // Exit fullscreen
player.getState() // Get player state
player.destroy() // Cleanup player
```

## 📡 Events

```javascript
player.on("play", () => {})
player.on("pause", () => {})
player.on("ended", () => {})
player.on("timeupdate", (e) => {
	console.log(e.data.currentTime)
})
player.on("error", (e) => {
	console.error(e.data.error)
})
```

## 🔐 S3 Configuration

```javascript
const player = new WontumPlayer({
	src: "s3://bucket/video.m3u8",
	container: "#player",
	s3Config: {
		getPresignedUrl: async (key) => {
			const res = await fetch(`/api/url?key=${key}`)
			return res.json().url
		},
	},
})
```

## 📊 Analytics

```javascript
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		endpoint: "/api/analytics",
		videoId: "video_123",
		userId: "user_456",
	},
})

// Get metrics
const metrics = player.analytics.getMetrics()
```

## 🎨 Theming

```javascript
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	theme: {
		primaryColor: "#3b82f6",
		accentColor: "#60a5fa",
		fontFamily: "Inter, sans-serif",
	},
})
```

## ⚛️ React Hooks

```tsx
import { useWontumPlayer } from "@wontum/player"

function CustomPlayer() {
	const { containerRef, player, state } = useWontumPlayer({
		src: "https://example.com/video.m3u8",
	})

	return (
		<div>
			<div ref={containerRef} />
			{state && <button onClick={() => player?.play()}>{state.playing ? "Pause" : "Play"}</button>}
		</div>
	)
}
```

## 🔧 Configuration Options

```typescript
interface WontumPlayerConfig {
	src: string // Required: Video URL
	container: HTMLElement | string // Required: Container
	autoplay?: boolean // Default: false
	muted?: boolean // Default: false
	controls?: boolean // Default: true
	poster?: string // Poster image URL
	preload?: "none" | "metadata" | "auto"
	theme?: PlayerTheme
	s3Config?: S3Config
	analytics?: AnalyticsConfig
	hlsConfig?: any // HLS.js config
}
```

## 📱 Responsive Design

```tsx
<div
	style={{
		position: "relative",
		paddingBottom: "56.25%", // 16:9
		height: 0,
	}}
>
	<div
		style={{
			position: "absolute",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
		}}
	>
		<WontumPlayerReact src="https://example.com/video.m3u8" width="100%" height="100%" />
	</div>
</div>
```

## 🐛 Error Handling

```javascript
player.on("error", (event) => {
	const error = event.data.error

	console.error("Player error:", {
		code: error.code,
		message: error.message,
	})

	// Handle error
	if (error.code === 1) {
		// Network error
	} else if (error.code === 2) {
		// Media error
	}
})
```

## 💾 Save/Resume Playback

```javascript
const videoId = "video_123"

player.on("loadedmetadata", () => {
	const saved = localStorage.getItem(`pos_${videoId}`)
	if (saved) player.seek(parseFloat(saved))
})

player.on("timeupdate", (e) => {
	localStorage.setItem(`pos_${videoId}`, e.data.currentTime.toString())
})

player.on("ended", () => {
	localStorage.removeItem(`pos_${videoId}`)
})
```

## 🎬 Playlist

```javascript
const playlist = ["https://example.com/video1.m3u8", "https://example.com/video2.m3u8", "https://example.com/video3.m3u8"]

let currentIndex = 0

player.on("ended", () => {
	if (currentIndex < playlist.length - 1) {
		currentIndex++
		player.destroy()
		player = new WontumPlayer({
			src: playlist[currentIndex],
			container: "#player",
		})
	}
})
```

## 📚 Documentation

- **README.md**: Complete API reference
- **GETTING_STARTED.md**: Quick setup
- **ARCHITECTURE.md**: Technical details
- **BACKEND_INTEGRATION.md**: Server integration
- **examples/**: Code examples

## 🚀 Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview build
```

## 🌐 Browser Support

- ✅ Chrome/Edge (latest 2)
- ✅ Firefox (latest 2)
- ✅ Safari (latest 2)
- ✅ iOS Safari (12+)
- ✅ Android Chrome (latest 2)

## 📄 License

MIT - Free for commercial use

---

For complete documentation, see README.md
