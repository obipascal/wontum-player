import { useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom/client"
import { WontumPlayerReact } from "./react"
import { WontumPlayer } from "./player"

// Inject global styles
const styles = `
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	background: #1a1a1a;
	color: white;
	padding: 20px;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
}

h1 {
	color: #3b82f6;
	margin-bottom: 10px;
}

.description {
	color: #999;
	margin-bottom: 30px;
	line-height: 1.6;
}

.player-section {
	background: #000;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 30px;
}

.controls-section {
	background: #2a2a2a;
	padding: 20px;
	border-radius: 12px;
	margin-bottom: 20px;
}

.button-group {
	display: flex;
	gap: 10px;
	margin-bottom: 15px;
}

button {
	padding: 12px 24px;
	background: #3b82f6;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}

button:hover {
	background: #2563eb;
	transform: translateY(-2px);
}

button:active {
	transform: translateY(0);
}

button:disabled {
	background: #444;
	cursor: not-allowed;
	transform: none;
}

.current-video {
	margin-top: 15px;
	padding: 15px;
	background: #1a1a1a;
	border-radius: 8px;
}

.current-video h3 {
	color: #3b82f6;
	font-size: 14px;
	margin-bottom: 8px;
}

.current-video p {
	color: #999;
	font-size: 14px;
}

.debug-section {
	background: #2a2a2a;
	padding: 20px;
	border-radius: 12px;
}

.debug-section h3 {
	color: #3b82f6;
	margin-bottom: 15px;
}

.debug-log {
	background: #1a1a1a;
	padding: 15px;
	border-radius: 8px;
	max-height: 300px;
	overflow-y: auto;
	font-family: "Courier New", monospace;
	font-size: 13px;
}

.log-entry {
	margin-bottom: 5px;
	padding: 5px;
	border-left: 3px solid #3b82f6;
	padding-left: 10px;
}

.log-entry.error {
	border-left-color: #ef4444;
	color: #fca5a5;
}

.log-entry.success {
	border-left-color: #10b981;
	color: #86efac;
}

.log-entry.warning {
	border-left-color: #f59e0b;
	color: #fcd34d;
}

.log-entry .timestamp {
	color: #666;
	font-size: 11px;
}

.player-container {
	width: 100%;
	height: 600px;
	background: #000;
}
`

// Inject styles into document
const styleSheet = document.createElement("style")
styleSheet.textContent = styles
document.head.appendChild(styleSheet)

// Debug logging
function log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
	const logContainer = document.getElementById("debug-log")
	if (!logContainer) return

	const timestamp = new Date().toLocaleTimeString()
	const entry = document.createElement("div")
	entry.className = `log-entry ${type}`
	entry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`
	logContainer.appendChild(entry)
	logContainer.scrollTop = logContainer.scrollHeight
	console.log(`[${timestamp}] ${message}`)
}

// Test videos
const videos = [
	{
		url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		title: "Video 1 - Big Buck Bunny",
	},
	{
		url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		title: "Video 2 - Same Stream (testing source swap)",
	},
	{
		url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		title: "Video 3 - Same Stream (testing source swap)",
	},
]

function VideoPlayerTest() {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [playerReady, setPlayerReady] = useState(false)
	const playerRef = useRef<WontumPlayer | null>(null)

	useEffect(() => {
		log(`🎬 Component mounted with video: ${videos[currentIndex].title}`, "success")
	}, [])

	useEffect(() => {
		log(`🔄 Video source changed to: ${videos[currentIndex].title}`, "warning")

		// Use updateSource() method when changing videos
		if (playerRef.current && currentIndex > 0) {
			log(`📝 Calling updateSource() with: ${videos[currentIndex].url}`, "info")
			playerRef.current.updateSource(videos[currentIndex].url)
		}
	}, [currentIndex])

	const handlePrevious = () => {
		if (currentIndex > 0) {
			log(`⏮️ Switching to previous video (index ${currentIndex - 1})`, "info")
			setCurrentIndex((prev) => prev - 1)
			setPlayerReady(false)
		}
	}

	const handleNext = () => {
		if (currentIndex < videos.length - 1) {
			log(`⏭️ Switching to next video (index ${currentIndex + 1})`, "info")
			setCurrentIndex((prev) => prev + 1)
			setPlayerReady(false)
		}
	}

	const handleReady = (player: WontumPlayer) => {
		log(`✅ Player ready for: ${videos[currentIndex].title}`, "success")
		playerRef.current = player
		setPlayerReady(true)
	}

	const handlePlay = () => {
		log(`▶️ Play event fired`, "success")
	}

	const handlePause = () => {
		log(`⏸️ Pause event fired`, "info")
	}

	const handleTimeUpdate = (time: number) => {
		// Only log every 5 seconds to avoid spam
		if (Math.floor(time) % 5 === 0 && time > 0) {
			const timeStr = time.toFixed(2)
			log(`⏱️ Time update: ${timeStr}s`, "info")
		}
	}

	const handleError = (error: any) => {
		log(`❌ Error: ${error?.message || "Unknown error"}`, "error")
	}

	return (
		<div>
			<div className="player-container">
				<WontumPlayerReact
					ref={playerRef}
					src={videos[0].url}
					width="100%"
					height="100%"
					controls
					stickyControls
					autoplay={false}
					theme={{
						primaryColor: "#3b82f6",
						accentColor: "#60a5fa",
					}}
					onReady={handleReady}
					onPlay={handlePlay}
					onPause={handlePause}
					onTimeUpdate={handleTimeUpdate}
					onError={handleError}
				/>
			</div>

			<div className="controls-section">
				<h3>Video Navigation</h3>
				<div className="button-group">
					<button onClick={handlePrevious} disabled={currentIndex === 0}>
						⏮️ Previous Video
					</button>
					<button onClick={handleNext} disabled={currentIndex === videos.length - 1}>
						⏭️ Next Video
					</button>
				</div>

				<div className="current-video">
					<h3>Current Video:</h3>
					<p>
						{videos[currentIndex].title} ({currentIndex + 1} of {videos.length})
					</p>
					<p style={{ marginTop: "5px", fontSize: "12px", color: playerReady ? "#10b981" : "#f59e0b" }}>{playerReady ? "✅ Player Ready" : "⏳ Loading..."}</p>
				</div>
			</div>
		</div>
	)
}

function App() {
	return (
		<div className="container">
			<h1>⚛️ React Video Source Swap Test</h1>
			<p className="description">
				This page tests the <code>WontumPlayerReact</code> component with dynamic source changes. Click Previous/Next to switch between videos and verify that controls (play, skip buttons) and
				progress bar work correctly on each swap. This mimics real-world React usage.
			</p>

			<div className="player-section">
				<VideoPlayerTest />
			</div>

			<div className="debug-section">
				<h3>Debug Log</h3>
				<div className="debug-log" id="debug-log"></div>
			</div>
		</div>
	)
}

// Mount React app
log("🚀 Initializing React test environment...", "success")
const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(<App />)
