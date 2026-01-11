import { WontumPlayer } from "../src/index"
import type { PlayerEvent } from "../src/types"

/**
 * Example 1: Basic Player Setup
 */
function basicPlayerExample() {
	const player = new WontumPlayer({
		src: "https://your-bucket.s3.amazonaws.com/video/playlist.m3u8",
		container: "#player-container",
		autoplay: false,
		muted: false,
		controls: true,
	})

	return player
}

/**
 * Example 2: Player with Event Listeners
 */
function playerWithEventsExample() {
	const player = new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
	})

	// Listen to playback events
	player.on("play", () => {
		console.log("Video started playing")
	})

	player.on("pause", () => {
		console.log("Video paused")
	})

	player.on("ended", () => {
		console.log("Video ended")
	})

	player.on("timeupdate", (event: PlayerEvent) => {
		console.log("Current time:", event.data.currentTime)
	})

	player.on("error", (event: PlayerEvent) => {
		console.error("Player error:", event.data.error)
	})

	return player
}

/**
 * Example 3: Programmatic Control
 */
function programmaticControlExample() {
	const player = new WontumPlayer({
		src: "https://example.com/video.m3u8",
		container: "#player",
	})

	// Play/Pause
	document.getElementById("play-btn")?.addEventListener("click", () => {
		player.play()
	})

	document.getElementById("pause-btn")?.addEventListener("click", () => {
		player.pause()
	})

	// Seek
	document.getElementById("seek-forward")?.addEventListener("click", () => {
		const state = player.getState()
		player.seek(state.currentTime + 10)
	})

	// Volume
	document.getElementById("volume-slider")?.addEventListener("input", (e) => {
		const volume = parseFloat((e.target as HTMLInputElement).value)
		player.setVolume(volume / 100)
	})

	// Playback rate
	document.getElementById("speed-1x")?.addEventListener("click", () => {
		player.setPlaybackRate(1)
	})

	document.getElementById("speed-2x")?.addEventListener("click", () => {
		player.setPlaybackRate(2)
	})

	return player
}

/**
 * Example 4: S3 Integration
 * Note: Install AWS SDK with: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */
// Commented out to avoid dependency errors - uncomment when AWS SDK is installed
/*
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
*/

async function s3IntegrationExample() {
	// Using AWS SDK (requires installation)
	/*
	const s3Client = new S3Client({
		region: "us-east-1",
		credentials: {
			accessKeyId: "YOUR_ACCESS_KEY",
			secretAccessKey: "YOUR_SECRET_KEY",
		},
	})

	async function getPresignedUrl(key: string): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: "your-bucket-name",
			Key: key,
		})

		return getSignedUrl(s3Client, command, { expiresIn: 3600 })
	}

	const player = new WontumPlayer({
		src: "s3://your-bucket/videos/lesson-1/playlist.m3u8",
		container: "#player",
		s3Config: {
			getPresignedUrl,
			region: "us-east-1",
		},
	})

	return player
	*/

	// Alternative: Use backend API for presigned URLs (recommended)
	async function getPresignedUrl(key: string): Promise<string> {
		const response = await fetch(`/api/presigned-url?key=${encodeURIComponent(key)}`)
		const data = await response.json()
		return data.url
	}

	const player = new WontumPlayer({
		src: "s3://your-bucket/videos/lesson-1/playlist.m3u8",
		container: "#player",
		s3Config: {
			getPresignedUrl,
			region: "us-east-1",
		},
	})

	return player
}

/**
 * Example 5: Backend Presigned URL Generation
 */
async function backendPresignedUrlExample() {
	// Fetch presigned URL from your backend
	async function getPresignedUrl(key: string): Promise<string> {
		const response = await fetch(`/api/presigned-url?key=${encodeURIComponent(key)}`)
		const data = await response.json()
		return data.url
	}

	const player = new WontumPlayer({
		src: "s3://your-bucket/videos/lesson-1/playlist.m3u8",
		container: "#player",
		s3Config: {
			getPresignedUrl,
		},
	})

	return player
}

/**
 * Example 6: Analytics Integration
 */
function analyticsExample() {
	const player = new WontumPlayer({
		src: "https://example.com/video.m3u8",
		container: "#player",
		analytics: {
			enabled: true,
			endpoint: "https://your-analytics-api.com/events",
			videoId: "video_123",
			userId: "user_456",
			sessionId: `session_${Date.now()}`,
		},
	})

	// Track custom events
	player.on("play", () => {
		console.log("User started watching")
	})

	player.on("ended", () => {
		const metrics = player.analytics.getMetrics()
		console.log("Video completed. Metrics:", metrics)

		// Send to your backend
		fetch("/api/video-completion", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				videoId: "video_123",
				userId: "user_456",
				metrics,
			}),
		})
	})

	return player
}

/**
 * Example 7: Quality Selection
 */
function qualitySelectionExample() {
	const player = new WontumPlayer({
		src: "https://example.com/video.m3u8",
		container: "#player",
	})

	player.on("loadedmetadata", (event: PlayerEvent) => {
		const qualities = event.data.qualities
		console.log("Available qualities:", qualities)

		// Create quality menu
		const menu = document.getElementById("quality-menu")
		qualities.forEach((quality: any, index: number) => {
			const button = document.createElement("button")
			button.textContent = quality.name
			button.onclick = () => player.setQuality(index)
			menu?.appendChild(button)
		})
	})

	return player
}

/**
 * Example 8: Multiple Players on One Page
 */
function multiplePlayersExample() {
	const videos = [
		{ id: "player-1", src: "https://example.com/video1.m3u8" },
		{ id: "player-2", src: "https://example.com/video2.m3u8" },
		{ id: "player-3", src: "https://example.com/video3.m3u8" },
	]

	const players = videos.map((video) => {
		return new WontumPlayer({
			src: video.src,
			container: `#${video.id}`,
			autoplay: false,
			muted: true, // Mute all players
		})
	})

	// Pause all other players when one starts
	players.forEach((player, index) => {
		player.on("play", () => {
			players.forEach((otherPlayer, otherIndex) => {
				if (index !== otherIndex) {
					otherPlayer.pause()
				}
			})
		})
	})

	return players
}

/**
 * Example 9: Custom HLS Configuration
 */
function customHlsConfigExample() {
	const player = new WontumPlayer({
		src: "https://example.com/video.m3u8",
		container: "#player",
		hlsConfig: {
			// Buffer settings
			maxBufferLength: 30,
			maxMaxBufferLength: 600,

			// Quality settings
			startLevel: -1, // Auto quality
			capLevelToPlayerSize: true,

			// Retry settings
			manifestLoadingMaxRetry: 4,
			levelLoadingMaxRetry: 4,

			// Debug
			debug: false,
		},
	})

	return player
}

/**
 * Example 10: Playlist with Auto-advance
 */
function playlistExample() {
	const playlist = ["https://example.com/video1.m3u8", "https://example.com/video2.m3u8", "https://example.com/video3.m3u8"]

	let currentIndex = 0
	let player: WontumPlayer

	function loadVideo(index: number) {
		if (player) {
			player.destroy()
		}

		player = new WontumPlayer({
			src: playlist[index],
			container: "#player",
		})

		player.on("ended", () => {
			if (currentIndex < playlist.length - 1) {
				currentIndex++
				loadVideo(currentIndex)
			}
		})
	}

	loadVideo(currentIndex)

	return {
		next: () => {
			if (currentIndex < playlist.length - 1) {
				currentIndex++
				loadVideo(currentIndex)
			}
		},
		previous: () => {
			if (currentIndex > 0) {
				currentIndex--
				loadVideo(currentIndex)
			}
		},
		goto: (index: number) => {
			if (index >= 0 && index < playlist.length) {
				currentIndex = index
				loadVideo(currentIndex)
			}
		},
	}
}

/**
 * Example 11: Save and Resume Playback Position
 */
function saveResumeExample() {
	const videoId = "video_123"

	const player = new WontumPlayer({
		src: "https://example.com/video.m3u8",
		container: "#player",
	})

	// Load saved position
	player.on("loadedmetadata", () => {
		const savedPosition = localStorage.getItem(`video_${videoId}_position`)
		if (savedPosition) {
			player.seek(parseFloat(savedPosition))
		}
	})

	// Save position periodically
	player.on("timeupdate", (event: PlayerEvent) => {
		const { currentTime } = event.data
		localStorage.setItem(`video_${videoId}_position`, currentTime.toString())
	})

	// Clear position when video ends
	player.on("ended", () => {
		localStorage.removeItem(`video_${videoId}_position`)
	})

	return player
}

/**
 * Example 12: Picture-in-Picture
 */
async function pictureInPictureExample() {
	const player = new WontumPlayer({
		src: "https://example.com/video.m3u8",
		container: "#player",
	})

	const pipButton = document.getElementById("pip-button")
	pipButton?.addEventListener("click", async () => {
		const videoElement = document.querySelector(".wontum-player-video") as HTMLVideoElement

		if (document.pictureInPictureElement) {
			await document.exitPictureInPicture()
		} else {
			await videoElement.requestPictureInPicture()
		}
	})

	return player
}

// Export all examples
export {
	basicPlayerExample,
	playerWithEventsExample,
	programmaticControlExample,
	s3IntegrationExample,
	backendPresignedUrlExample,
	analyticsExample,
	qualitySelectionExample,
	multiplePlayersExample,
	customHlsConfigExample,
	playlistExample,
	saveResumeExample,
	pictureInPictureExample,
}
