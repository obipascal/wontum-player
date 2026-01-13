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
- 🔌 **Real-time Analytics**: Native WebSocket and Socket.IO support for live analytics streaming
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

**Optional:** For Socket.IO real-time analytics support:

```bash
npm install socket.io-client
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

### Using with Apollo Client / GraphQL

If you're using Apollo Client or other GraphQL clients for URL signing, use `useQuery` instead of `useLazyQuery` to avoid abort errors:

```tsx
import React from "react"
import { S3Config, WontumPlayerReact } from "@obipascal/player"
import { useQuery } from "@apollo/client"
import { GET_MEDIA_SIGNED_URL } from "@/graphql/queries/media.queries"

interface VideoPlayerProps {
	videoUrl: string
}

function VideoPlayer({ videoUrl }: VideoPlayerProps) {
	// ✅ Use useQuery with skip option instead of useLazyQuery
	const { refetch } = useQuery(GET_MEDIA_SIGNED_URL, {
		skip: true, // Don't run on mount
		fetchPolicy: "no-cache", // Always fetch fresh signed URLs
	})

	const url = new URL(videoUrl)

	const s3config: S3Config = {
		cloudFrontDomains: [url.hostname],
		withCredentials: true, // Enable cookies for CloudFront signed cookies
		signUrl: async (resourceUrl: string) => {
			try {
				const { data } = await refetch({
					signingMediaInput: {
						resourceUrl,
						isPublic: false,
						type: "COOKIES",
					},
				})

				console.log("Signed URL result:", data)
				// For cookie-based signing, return the original URL
				// The server sets cookies in the response
				return resourceUrl
			} catch (error) {
				console.error("Failed to sign URL:", error)
				throw error
			}
		},
	}

	return (
		<WontumPlayerReact
			src={videoUrl}
			width="100%"
			height="500px"
			autoplay={false}
			controls
			s3Config={s3config}
			theme={{
				primaryColor: "#3b82f6",
				accentColor: "#60a5fa",
			}}
		/>
	)
}
```

**Why `useQuery` with `skip` instead of `useLazyQuery`?**

- `useLazyQuery` creates a new AbortController on each call, which can be aborted during React lifecycle
- `useQuery` with `skip: true` and `refetch` persists across renders, avoiding abort issues
- The SDK includes retry logic for AbortErrors, but using `useQuery` prevents them entirely

## 🔒 CloudFront & S3 Integration

This player supports **three video hosting scenarios**. Choose the one that fits your needs:

### Scenario 1: Public Videos (Easiest - No Authentication Required)

**When to use:** Your videos are publicly accessible and don't require user authentication.

**Setup:** Just provide the video URL!

```typescript
import { WontumPlayer } from "@obipascal/player"

const player = new WontumPlayer({
	src: "https://d1234567890.cloudfront.net/video/playlist.m3u8",
	container: "#player",
})
```

✅ **That's it!** No backend needed. Works for public S3 buckets or CloudFront distributions.

---

### Scenario 2: Private Videos with CloudFront Signed Cookies (Recommended)

**When to use:** You want to restrict video access to authorized users (e.g., paid courses, premium content).

**How it works:**

1. User logs into your app
2. Your backend verifies the user and sets CloudFront signed cookies
3. Player automatically sends these cookies with every video request
4. CloudFront checks the cookies and allows/denies access

**Frontend Setup:**

```typescript
import { WontumPlayer } from "@obipascal/player"

// STEP 1: Call your backend to set signed cookies BEFORE creating the player
async function initializePlayer() {
	// This endpoint sets CloudFront cookies in the browser
	await fetch("/api/auth/video-access", {
		credentials: "include", // Important: include cookies
	})

	// STEP 2: Create player - it will automatically use the cookies
	const player = new WontumPlayer({
		src: "https://media.yourdomain.com/videos/lesson-1/playlist.m3u8",
		container: "#player",
		s3Config: {
			cloudFrontDomains: ["media.yourdomain.com"], // Your CloudFront domain
			withCredentials: true, // Enable cookies for all HLS requests (required for CloudFront signed cookies)
			signUrl: async (url) => {
				// This function is called when player needs to access a video
				// Call your backend to refresh/set cookies if needed
				const response = await fetch("/api/auth/sign-url", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ url }),
				})

				if (!response.ok) {
					throw new Error("Failed to authenticate video access")
				}

				// Backend sets cookies, return the URL
				return url
			},
		},
	})
}

initializePlayer()
```

**Backend Setup (Node.js/Express):**

```typescript
import express from "express"
import { getSignedCookies } from "@aws-sdk/cloudfront-signer"
import fs from "fs"

const app = express()

// STEP 1: Create endpoint that sets CloudFront signed cookies
app.get("/api/auth/video-access", (req, res) => {
	// Check if user is logged in (your authentication logic)
	if (!req.user) {
		return res.status(401).json({ error: "Not authenticated" })
	}

	// Define what resources user can access
	const policy = {
		Statement: [
			{
				Resource: "https://media.yourdomain.com/*", // All videos on this domain
				Condition: {
					DateLessThan: {
						"AWS:EpochTime": Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
					},
				},
			},
		],
	}

	// Generate CloudFront signed cookies
	const cookies = getSignedCookies({
		keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!, // Your CloudFront key pair ID
		privateKey: fs.readFileSync("./cloudfront-private-key.pem", "utf8"), // Your private key
		policy: JSON.stringify(policy),
	})

	// Set the three required cookies
	res.cookie("CloudFront-Policy", cookies["CloudFront-Policy"], {
		domain: ".yourdomain.com", // Use your domain
		path: "/",
		secure: true, // HTTPS only
		httpOnly: true, // Prevent JavaScript access
		sameSite: "none",
	})

	res.cookie("CloudFront-Signature", cookies["CloudFront-Signature"], {
		domain: ".yourdomain.com",
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "none",
	})

	res.cookie("CloudFront-Key-Pair-Id", cookies["CloudFront-Key-Pair-Id"], {
		domain: ".yourdomain.com",
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "none",
	})

	res.json({ success: true })
})

// STEP 2: Optional endpoint for on-demand signing (called by signUrl function)
app.post("/api/auth/sign-url", (req, res) => {
	const { url } = req.body

	// Verify user is authorized
	if (!req.user) {
		return res.status(401).json({ error: "Not authenticated" })
	}

	// You can add additional authorization logic here
	// For example, check if user has access to this specific video

	// Refresh cookies (same code as above)
	const policy = {
		Statement: [
			{
				Resource: "https://media.yourdomain.com/*",
				Condition: {
					DateLessThan: {
						"AWS:EpochTime": Math.floor(Date.now() / 1000) + 3600,
					},
				},
			},
		],
	}

	const cookies = getSignedCookies({
		keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
		privateKey: fs.readFileSync("./cloudfront-private-key.pem", "utf8"),
		policy: JSON.stringify(policy),
	})

	res.cookie("CloudFront-Policy", cookies["CloudFront-Policy"], {
		domain: ".yourdomain.com",
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "none",
	})

	res.cookie("CloudFront-Signature", cookies["CloudFront-Signature"], {
		domain: ".yourdomain.com",
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "none",
	})

	res.cookie("CloudFront-Key-Pair-Id", cookies["CloudFront-Key-Pair-Id"], {
		domain: ".yourdomain.com",
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "none",
	})

	res.json({ success: true })
})
```

**AWS CloudFront Setup:**

1. Create a CloudFront key pair in AWS Console → CloudFront → Key pairs
2. Download the private key file
3. Set up environment variables:
   ```bash
   CLOUDFRONT_KEY_PAIR_ID=APKA...
   ```
4. Configure your CloudFront distribution to require signed cookies

---

### Scenario 3: Private S3 Videos with Presigned URLs

**When to use:** Videos are in private S3 buckets without CloudFront.

**How it works:**

1. Your backend generates temporary presigned URLs for S3 objects
2. Player uses these URLs to access videos
3. URLs expire after a set time (e.g., 1 hour)

**Frontend Setup:**

```typescript
import { WontumPlayer } from "@obipascal/player"

const player = new WontumPlayer({
	src: "s3://my-bucket/videos/lesson-1/playlist.m3u8", // S3 URI
	container: "#player",
	s3Config: {
		getPresignedUrl: async (s3Key) => {
			// Call your backend to generate presigned URL
			const response = await fetch("/api/s3/presigned-url", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: s3Key }),
			})

			if (!response.ok) {
				throw new Error("Failed to get presigned URL")
			}

			const data = await response.json()
			return data.url // Return the presigned URL
		},
	},
})
```

**Backend Setup (Node.js):**

```typescript
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
	region: "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
})

app.post("/api/s3/presigned-url", async (req, res) => {
	const { key } = req.body

	// Verify user is authorized to access this video
	if (!req.user) {
		return res.status(401).json({ error: "Not authenticated" })
	}

	try {
		// Generate presigned URL
		const command = new GetObjectCommand({
			Bucket: "my-bucket",
			Key: key, // e.g., "videos/lesson-1/playlist.m3u8"
		})

		const url = await getSignedUrl(s3Client, command, {
			expiresIn: 3600, // URL valid for 1 hour
		})

		res.json({ url })
	} catch (error) {
		console.error("Error generating presigned URL:", error)
		res.status(500).json({ error: "Failed to generate presigned URL" })
	}
})
```

---

### Which Method Should I Use?

| Method                 | Best For                                       | Complexity  | Performance  |
| ---------------------- | ---------------------------------------------- | ----------- | ------------ |
| **Public Videos**      | Free content, marketing videos                 | ⭐ Easy     | ⚡ Fast      |
| **CloudFront Cookies** | ⭐ **Recommended** for paid courses, premium   | ⭐⭐ Medium | ⚡⚡ Fastest |
| **S3 Presigned URLs**  | Direct S3 access, simple private video hosting | ⭐⭐ Medium | ⚡ Good      |

💡 **Tip:** Use CloudFront with signed cookies for production. It's more secure and performant for HLS videos (which have many file segments).

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

Track video engagement and quality metrics with HTTP endpoints or real-time WebSocket/Socket.IO streaming:

**Features:**

- ✅ HTTP endpoint support for traditional analytics
- ✅ Native WebSocket support for real-time streaming
- ✅ Socket.IO support with full TypeScript types
- ✅ Dual streaming (HTTP + Socket simultaneously)
- ✅ Event transformation and filtering
- ✅ Auto-reconnection with configurable delays
- ✅ Quality of Experience (QoE) metrics included in every event

### HTTP Analytics

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

### WebSocket Real-Time Analytics

Stream analytics events in real-time using native WebSocket for live dashboards and monitoring:

```typescript
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		userId: "user_456",
		videoId: "video_789",
		// Native WebSocket configuration
		webSocket: {
			type: "websocket", // Specify native WebSocket
			connection: "wss://analytics.example.com/stream",
			// Optional: Transform events before sending
			transform: (event) => ({
				type: event.eventType,
				video_id: event.videoId,
				user_id: event.userId,
				timestamp: event.timestamp,
				metrics: event.data,
			}),
			// Optional: Handle errors
			onError: (error) => {
				console.error("Analytics WebSocket error:", error)
			},
			// Optional: Connection opened
			onOpen: (event) => {
				console.log("Analytics WebSocket connected")
			},
			// Optional: Connection closed
			onClose: (event) => {
				console.log("Analytics WebSocket disconnected")
			},
			// Auto-reconnect on disconnect (default: true)
			autoReconnect: true,
			// Reconnect delay in milliseconds (default: 3000)
			reconnectDelay: 3000,
		},
	},
})
```

### Socket.IO Real-Time Analytics

For Socket.IO-based real-time analytics (requires `socket.io-client` to be loaded):

```typescript
// Option 1: Let the SDK create the Socket.IO connection
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		userId: "user_456",
		videoId: "video_789",
		webSocket: {
			type: "socket.io",
			connection: "https://analytics.example.com", // Socket.IO server URL
			options: {
				path: "/socket.io/",
				transports: ["websocket", "polling"],
				auth: {
					token: "your-auth-token",
				},
				reconnection: true,
				reconnectionDelay: 1000,
			},
			eventName: "video_analytics", // Event name to emit (default: "analytics")
			transform: (event) => ({
				event: event.eventType,
				video: event.videoId,
				user: event.userId,
				data: event.data,
			}),
			onConnect: () => {
				console.log("Socket.IO connected")
			},
			onDisconnect: (reason) => {
				console.log("Socket.IO disconnected:", reason)
			},
			onError: (error) => {
				console.error("Socket.IO error:", error)
			},
		},
	},
})
```

```typescript
// Option 2: Use existing Socket.IO connection
import { io } from "socket.io-client"

const socket = io("https://analytics.example.com", {
	auth: {
		token: "your-auth-token",
	},
})

const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		userId: "user_456",
		videoId: "video_789",
		webSocket: {
			type: "socket.io",
			connection: socket, // Use existing Socket.IO instance
			eventName: "analytics",
		},
	},
})
```

### Using Existing WebSocket Connection

```typescript
// Create your own WebSocket connection
const ws = new WebSocket("wss://analytics.example.com/stream")

// Configure authentication or custom headers before connecting
ws.addEventListener("open", () => {
	// Send authentication message
	ws.send(
		JSON.stringify({
			type: "auth",
			token: "your-auth-token",
		}),
	)
})

const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		userId: "user_456",
		videoId: "video_789",
		webSocket: {
			type: "websocket",
			connection: ws, // Use existing connection
			transform: (event) => ({
				// Custom format for your backend
				action: "video_event",
				payload: {
					event: event.eventType,
					data: event.data,
				},
			}),
		},
	},
})
```

### Dual Analytics (HTTP + WebSocket/Socket.IO)

Send analytics to both HTTP endpoint and real-time socket simultaneously:

```typescript
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
	analytics: {
		enabled: true,
		endpoint: "https://api.example.com/analytics", // HTTP fallback/storage
		webSocket: {
			type: "socket.io",
			connection: "https://realtime.example.com", // Real-time monitoring
			eventName: "video_analytics",
		},
		userId: "user_456",
		videoId: "video_789",
	},
})
```

### Analytics Events Tracked

The SDK automatically tracks these events:

- **Session**: `session_start`, `session_end`
- **Playback**: `play`, `pause`, `ended`, `playing`
- **Buffering**: `buffering_start`, `buffering_end`, `waiting`, `stalled`
- **Seeking**: `seeking`, `seeked`
- **Quality**: `qualitychange`, `renditionchange`
- **Errors**: `error`
- **User Actions**: Volume changes, fullscreen, playback rate changes

Each event includes Quality of Experience (QoE) metrics:

- `sessionDuration` - Total session time
- `totalPlayTime` - Actual video play time
- `totalBufferTime` - Time spent buffering
- `bufferingRatio` - Buffer time / play time ratio
- `rebufferCount` - Number of rebuffer events
- `seekCount` - Number of seek operations

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
	s3Config?: S3Config // S3/CloudFront configuration
	analytics?: AnalyticsConfig // Analytics configuration
	hlsConfig?: Partial<any> // HLS.js config override
	subtitles?: SubtitleTrack[] // Subtitle tracks
	stickyControls?: boolean // Keep controls always visible
}

interface S3Config {
	signUrl?: (url: string) => Promise<string> // Sign URL and set cookies
	cloudFrontDomains?: string[] // CloudFront domains (e.g., ['media.example.com'])
	withCredentials?: boolean // Enable cookies for HLS requests (default: false, required for CloudFront signed cookies)
	region?: string // S3 region
	endpoint?: string // Custom S3 endpoint
}

interface AnalyticsConfig {
	enabled?: boolean // Enable analytics tracking
	endpoint?: string // HTTP endpoint for analytics events
	webSocket?: WebSocketAnalyticsHandler | SocketIOAnalyticsHandler // Real-time streaming
	sessionId?: string // Session identifier
	userId?: string // User identifier
	videoId?: string // Video identifier
}

// Native WebSocket Configuration
interface WebSocketAnalyticsHandler {
	type: "websocket"
	connection: WebSocket | string // WebSocket instance or URL
	transform?: (event: AnalyticsEvent) => any // Transform before sending
	onError?: (error: Event) => void
	onOpen?: (event: Event) => void
	onClose?: (event: CloseEvent) => void
	autoReconnect?: boolean // Default: true
	reconnectDelay?: number // Default: 3000ms
}

// Socket.IO Configuration
interface SocketIOAnalyticsHandler {
	type: "socket.io"
	connection: Socket | string // Socket.IO instance or URL
	options?: Partial<ManagerOptions & SocketOptions> // Socket.IO options
	eventName?: string // Event name to emit (default: "analytics")
	transform?: (event: AnalyticsEvent) => any
	onError?: (error: Error) => void
	onConnect?: () => void
	onDisconnect?: (reason: string) => void
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
player.getQualities(): QualityLevel[]

// Fullscreen
player.enterFullscreen(): void
player.exitFullscreen(): void

// Picture-in-Picture
player.enterPictureInPicture(): Promise<void>
player.exitPictureInPicture(): Promise<void>
player.togglePictureInPicture(): Promise<void>

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
	| "pictureinpictureenter"
	| "pictureinpictureexit"
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
import { netflixTheme, youtubeTheme, modernTheme, greenTheme, cyberpunkTheme, pastelTheme, educationTheme } from "@obipascal/player"

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

// Picture-in-Picture events
player.on("pictureinpictureenter", () => {
	console.log("Entered Picture-in-Picture mode")
})

player.on("pictureinpictureexit", () => {
	console.log("Exited Picture-in-Picture mode")
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

// Picture-in-Picture
await player.enterPictureInPicture()
await player.exitPictureInPicture()
await player.togglePictureInPicture()

// Cleanup
player.destroy() // Remove player and clean up resources
```

### Picture-in-Picture Mode

Enable floating video that stays on top while users work in other apps:

```typescript
const player = new WontumPlayer({
	src: "https://example.com/video.m3u8",
	container: "#player",
})

// Enter PiP mode
await player.enterPictureInPicture()

// Listen for PiP events
player.on("pictureinpictureenter", () => {
	console.log("Video is now floating!")
})

player.on("pictureinpictureexit", () => {
	console.log("Back to normal mode")
})

// Custom button to toggle PiP
const pipButton = document.getElementById("pip-btn")
pipButton.addEventListener("click", async () => {
	await player.togglePictureInPicture()
})
```

**Note:** Picture-in-Picture is supported in most modern browsers. The player includes a built-in PiP button in the controls.

### File Information Utility

The SDK includes a `WontumFileInfo` utility class to extract metadata from video files before uploading or processing them.

```typescript
import { WontumFileInfo } from "@obipascal/player"

// Example: File input handling
const fileInput = document.querySelector<HTMLInputElement>("#video-upload")

fileInput.addEventListener("change", async (event) => {
	const file = event.target.files?.[0]
	if (!file) return

	try {
		// Create instance (validates it's a video file)
		const videoInfo = new WontumFileInfo(file)

		// Extract metadata
		await videoInfo.extract()

		// Access properties
		console.log("Video Information:")
		console.log("- Width:", videoInfo.width) // e.g., 1920
		console.log("- Height:", videoInfo.height) // e.g., 1080
		console.log("- Aspect Ratio:", videoInfo.aspectRatio) // e.g., "16:9"
		console.log("- Quality:", videoInfo.quality) // e.g., "Full HD (1080p)"
		console.log("- Duration (raw):", videoInfo.durationInSeconds, "seconds") // e.g., 125.5
		console.log("- Formatted Duration:", videoInfo.durationFormatted) // e.g., "02:05"
		console.log("- File Size (raw):", videoInfo.sizeInBytes, "bytes") // e.g., 52428800
		console.log("- Formatted Size:", videoInfo.sizeFormatted) // e.g., "50 MB"
		console.log("- MIME Type:", videoInfo.mimeType) // e.g., "video/mp4"
		console.log("- File Name:", videoInfo.fileName) // e.g., "my-video.mp4"
		console.log("- Extension:", videoInfo.fileExtension) // e.g., ".mp4"
		console.log("- Bitrate:", videoInfo.bitrate, "kbps") // e.g., 3500

		// Get all info as object
		const allInfo = videoInfo.getInfo()
		console.log(allInfo)

		// Clean up when done
		videoInfo.destroy()
	} catch (error) {
		console.error("Error extracting video info:", error.message)
		// Throws error if file is not a video
	}
})
```

#### WontumFileInfo API

**Constructor:**

```typescript
new WontumFileInfo(file: File)
```

Throws an error if the file is not a valid video file.

**Methods:**

- `extract(): Promise<VideoFileInfo>` - Extracts metadata from the video file
- `getInfo(): VideoFileInfo | null` - Returns the extracted information object
- `destroy(): void` - Cleans up resources

**Properties (available after calling `extract()`):**

- `width: number` - Video width in pixels
- `height: number` - Video height in pixels
- `aspectRatio: string` - Aspect ratio (e.g., "16:9", "4:3", "21:9")
- `quality: string` - Quality description (e.g., "4K (2160p)", "Full HD (1080p)")
- `size: number` - File size in bytes (raw value for computation)
- `sizeInBytes: number` - Alias for size (raw value for computation)
- `sizeFormatted: string` - Human-readable size (e.g., "50 MB")
- `duration: number` - Duration in seconds (raw value for computation)
- `durationInSeconds: number` - Alias for duration (raw value for computation)
- `durationFormatted: string` - Formatted duration (e.g., "01:23:45")
- `mimeType: string` - MIME type (e.g., "video/mp4")
- `fileName: string` - Original file name
- `fileExtension: string` - File extension (e.g., ".mp4")
- `bitrate: number | undefined` - Estimated bitrate in kbps

**Supported Video Formats:**

`.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, `.mkv`, `.flv`, `.wmv`, `.m4v`, `.3gp`, `.ts`, `.m3u8`

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
- **Picture-in-Picture:** `enterPictureInPicture()`, `exitPictureInPicture()`, `togglePictureInPicture()`
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

| Browser        | Minimum Version   |
| -------------- | ----------------- |
| Chrome         | Latest 2 versions |
| Edge           | Latest 2 versions |
| Firefox        | Latest 2 versions |
| Safari         | Latest 2 versions |
| iOS Safari     | iOS 12+           |
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

- **Issues:** [GitHub Issues](https://github.com/obipascal/wontum-player/issues)
- **Discussions:** [GitHub Discussions](https://github.com/obipascal/wontum-player/discussions)
- **Email:** pascalobi83@gmail.com

## 🙏 Acknowledgments

- Inspired by [Mux Player](https://www.mux.com/player)
- Powered by [HLS.js](https://github.com/video-dev/hls.js)
- Built with [TypeScript](https://www.typescriptlang.org/)

---

Made with ❤️ for educational platforms
