import React from "react"
import { WontumPlayerReact, useWontumPlayer } from "../src/index"
import type { WontumPlayer } from "../src/player"

/**
 * Example 1: Basic React Player
 */
export function BasicPlayer() {
	return (
		<WontumPlayerReact
			src="https://your-bucket.s3.amazonaws.com/video/playlist.m3u8"
			width="100%"
			height="500px"
			autoplay={false}
			muted={false}
			controls={true}
			poster="https://example.com/poster.jpg"
		/>
	)
}

/**
 * Example 2: Player with Event Handlers
 */
export function PlayerWithEvents() {
	const [isPlaying, setIsPlaying] = React.useState(false)
	const [currentTime, setCurrentTime] = React.useState(0)
	const [duration, setDuration] = React.useState(0)

	return (
		<div>
			<WontumPlayerReact
				src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
				width="100%"
				height="500px"
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
				onTimeUpdate={(time: number) => setCurrentTime(time)}
				onReady={(player: WontumPlayer) => {
					console.log("Player ready!")
					const state = player.getState()
					setDuration(state.duration)
				}}
			/>

			<div style={{ marginTop: "20px" }}>
				<p>Status: {isPlaying ? "Playing" : "Paused"}</p>
				<p>
					Time: {Math.round(currentTime)}s / {Math.round(duration)}s
				</p>
			</div>
		</div>
	)
}

/**
 * Example 3: Custom Controls with useWontumPlayer Hook
 */
export function CustomControls() {
	const { containerRef, player, state } = useWontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		controls: false, // Disable built-in controls
	})

	const handlePlayPause = () => {
		if (state?.playing) {
			player?.pause()
		} else {
			player?.play()
		}
	}

	const handleSeek = (offset: number) => {
		if (state) {
			player?.seek(state.currentTime + offset)
		}
	}

	return (
		<div>
			<div
				ref={containerRef}
				style={{
					width: "100%",
					height: "500px",
					background: "#000",
					marginBottom: "20px",
				}}
			/>

			{state && (
				<div
					style={{
						display: "flex",
						gap: "10px",
						alignItems: "center",
						padding: "20px",
						background: "#f5f5f5",
						borderRadius: "8px",
					}}
				>
					<button onClick={handlePlayPause}>{state.playing ? "Pause" : "Play"}</button>
					<button onClick={() => handleSeek(-10)}>-10s</button>
					<button onClick={() => handleSeek(10)}>+10s</button>
					<button onClick={() => player?.setPlaybackRate(0.5)}>0.5x</button>
					<button onClick={() => player?.setPlaybackRate(1)}>1x</button>
					<button onClick={() => player?.setPlaybackRate(2)}>2x</button>

					<div style={{ flex: 1, textAlign: "right" }}>
						<span>
							{Math.round(state.currentTime)}s / {Math.round(state.duration)}s
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

/**
 * Example 4: S3 Integration with Presigned URLs
 * Note: Install AWS SDK with: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */
// Commented out to avoid dependency errors - uncomment when AWS SDK is installed
/*
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({ region: "us-east-1" })

async function getPresignedUrl(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: "your-bucket-name",
		Key: key,
	})

	return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}
*/

// Example implementation with backend API
async function getPresignedUrl(key: string): Promise<string> {
	const response = await fetch(`/api/presigned-url?key=${encodeURIComponent(key)}`)
	const data = await response.json()
	return data.url
}

export function S3Player() {
	return (
		<WontumPlayerReact
			src="s3://your-bucket/videos/lesson-1/playlist.m3u8"
			width="100%"
			height="500px"
			s3Config={{
				getPresignedUrl,
				region: "us-east-1",
			}}
		/>
	)
}

/**
 * Example 5: Player with Analytics
 */
export function AnalyticsPlayer({ videoId, userId }: { videoId: string; userId: string }) {
	const handleReady = (player: any) => {
		console.log("Player ready, tracking analytics")

		// Access analytics
		player.on("play", () => {
			console.log("User started watching video")
		})

		player.on("ended", () => {
			const metrics = player.analytics.getMetrics()
			console.log("Video completed. Metrics:", metrics)

			// Send to your backend
			fetch("/api/video-analytics", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(metrics),
			})
		})
	}

	return (
		<WontumPlayerReact
			src="https://example.com/video.m3u8"
			width="100%"
			height="500px"
			analytics={{
				enabled: true,
				endpoint: "https://your-analytics-api.com/events",
				videoId,
				userId,
			}}
			onReady={handleReady}
		/>
	)
}

/**
 * Example 6: Playlist Player
 */
export function PlaylistPlayer() {
	const [currentVideo, setCurrentVideo] = React.useState(0)
	const [playerInstance, setPlayerInstance] = React.useState<any>(null)

	const playlist = [
		{
			id: 1,
			title: "Introduction to React",
			src: "https://example.com/video1.m3u8",
			poster: "https://example.com/poster1.jpg",
		},
		{
			id: 2,
			title: "React Hooks",
			src: "https://example.com/video2.m3u8",
			poster: "https://example.com/poster2.jpg",
		},
		{
			id: 3,
			title: "Advanced Patterns",
			src: "https://example.com/video3.m3u8",
			poster: "https://example.com/poster3.jpg",
		},
	]

	const handleEnded = () => {
		if (currentVideo < playlist.length - 1) {
			setCurrentVideo(currentVideo + 1)
		}
	}

	const handleVideoSelect = (index: number) => {
		setCurrentVideo(index)
		playerInstance?.seek(0)
	}

	return (
		<div>
			<WontumPlayerReact
				key={playlist[currentVideo].id}
				src={playlist[currentVideo].src}
				poster={playlist[currentVideo].poster}
				width="100%"
				height="500px"
				onEnded={handleEnded}
				onReady={setPlayerInstance}
			/>

			<div style={{ marginTop: "20px" }}>
				<h3>Playlist</h3>
				<ul style={{ listStyle: "none", padding: 0 }}>
					{playlist.map((video, index) => (
						<li
							key={video.id}
							style={{
								padding: "10px",
								cursor: "pointer",
								background: index === currentVideo ? "#3b82f6" : "#f5f5f5",
								color: index === currentVideo ? "white" : "black",
								marginBottom: "5px",
								borderRadius: "4px",
							}}
							onClick={() => handleVideoSelect(index)}
						>
							{index + 1}. {video.title}
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

/**
 * Example 7: Player with Custom Theme
 */
export function ThemedPlayer() {
	return (
		<WontumPlayerReact
			src="https://example.com/video.m3u8"
			width="100%"
			height="500px"
			theme={{
				primaryColor: "#8b5cf6",
				accentColor: "#a78bfa",
				fontFamily: "Inter, sans-serif",
			}}
		/>
	)
}

/**
 * Example 8: Responsive Player
 */
export function ResponsivePlayer() {
	return (
		<div
			style={{
				position: "relative",
				paddingBottom: "56.25%", // 16:9 aspect ratio
				height: 0,
				overflow: "hidden",
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
	)
}
