# WontumPlayer Usage Examples

## React Component with updateSource()

### Example 1: Video Playlist with Navigation

```tsx
import { WontumPlayerReact } from "@obipascal/player"
import { useRef, useState } from "react"
import { WontumPlayer } from "@obipascal/player"

const videos = [
	{ id: 1, url: "https://media.example.com/video1.m3u8", title: "Lesson 1" },
	{ id: 2, url: "https://media.example.com/video2.m3u8", title: "Lesson 2" },
	{ id: 3, url: "https://media.example.com/video3.m3u8", title: "Lesson 3" },
]

function VideoPlaylist() {
	const playerRef = useRef<WontumPlayer | null>(null)
	const [currentIndex, setCurrentIndex] = useState(0)

	const handleReady = (player: WontumPlayer) => {
		playerRef.current = player
		console.log("Player ready!")
	}

	const handlePrevious = () => {
		if (currentIndex > 0) {
			const newIndex = currentIndex - 1
			setCurrentIndex(newIndex)
			playerRef.current?.updateSource(videos[newIndex].url)
		}
	}

	const handleNext = () => {
		if (currentIndex < videos.length - 1) {
			const newIndex = currentIndex + 1
			setCurrentIndex(newIndex)
			playerRef.current?.updateSource(videos[newIndex].url)
		}
	}

	return (
		<div>
			<h2>{videos[currentIndex].title}</h2>

			<WontumPlayerReact ref={playerRef} src={videos[0].url} width="100%" height="500px" controls={true} onReady={handleReady} />

			<div>
				<button onClick={handlePrevious} disabled={currentIndex === 0}>
					Previous
				</button>
				<span>
					Video {currentIndex + 1} of {videos.length}
				</span>
				<button onClick={handleNext} disabled={currentIndex === videos.length - 1}>
					Next
				</button>
			</div>
		</div>
	)
}
```

### Example 2: Load Video On Demand (No Initial Source)

```tsx
import { WontumPlayerReact } from "@obipascal/player"
import { useRef, useState } from "react"
import { WontumPlayer } from "@obipascal/player"

function OnDemandPlayer() {
	const playerRef = useRef<WontumPlayer | null>(null)
	const [isLoaded, setIsLoaded] = useState(false)

	const handleReady = (player: WontumPlayer) => {
		playerRef.current = player
	}

	const loadCourse = (courseId: string) => {
		const url = `https://media.example.com/courses/${courseId}/playlist.m3u8`

		if (playerRef.current) {
			playerRef.current.updateSource(url)
			setIsLoaded(true)
		}
	}

	return (
		<div>
			{/* Player initializes without source */}
			<WontumPlayerReact
				ref={playerRef}
				width="100%"
				height="500px"
				controls={true}
				onReady={handleReady}
				theme={{
					primaryColor: "#3b82f6",
					accentColor: "#60a5fa",
				}}
			/>

			{!isLoaded && (
				<div className="course-selection">
					<h3>Select a Course</h3>
					<button onClick={() => loadCourse("react-basics")}>React Basics</button>
					<button onClick={() => loadCourse("typescript-101")}>TypeScript 101</button>
					<button onClick={() => loadCourse("advanced-nodejs")}>Advanced Node.js</button>
				</div>
			)}
		</div>
	)
}
```

### Example 3: Using useRef Pattern (Recommended)

```tsx
import { WontumPlayerReact } from "@obipascal/player"
import { useRef, useEffect } from "react"
import { WontumPlayer } from "@obipascal/player"

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
	const playerRef = useRef<WontumPlayer | null>(null)

	const handleReady = (player: WontumPlayer) => {
		// Store player reference
		playerRef.current = player

		// You can now call any player method
		player.on("ended", () => {
			console.log("Video ended!")
		})
	}

	// Update source when videoUrl prop changes
	useEffect(() => {
		if (playerRef.current && videoUrl) {
			playerRef.current.updateSource(videoUrl)
		}
	}, [videoUrl])

	return <WontumPlayerReact ref={playerRef} src={videoUrl} width="100%" height="500px" controls={true} onReady={handleReady} />
}

// Usage
function App() {
	const [currentVideo, setCurrentVideo] = useState("https://media.example.com/video1.m3u8")

	return (
		<div>
			<VideoPlayer videoUrl={currentVideo} />

			<button onClick={() => setCurrentVideo("https://media.example.com/video2.m3u8")}>Switch Video</button>
		</div>
	)
}
```

## Vanilla JavaScript Examples

### Example 1: Dynamic Source Updates

```javascript
import { WontumPlayer } from "@obipascal/player"

const player = new WontumPlayer({
	container: "#player-container",
	controls: true,
	autoplay: false,
})

// Load video later
player.updateSource("https://media.example.com/video1.m3u8")

// Switch to different video
document.getElementById("next-btn").addEventListener("click", () => {
	player.updateSource("https://media.example.com/video2.m3u8")
})
```

### Example 2: Initialize Without Source

```javascript
import { WontumPlayer } from "@obipascal/player"

// Player can be created without a source
const player = new WontumPlayer({
	container: "#player-container",
	controls: true,
	theme: {
		primaryColor: "#3b82f6",
	},
})

// Load source when user selects a video
function loadVideo(videoUrl) {
	player.updateSource(videoUrl)
}

// Example: Load video after API call
async function loadCourseVideo(courseId) {
	const response = await fetch(`/api/courses/${courseId}/video`)
	const data = await response.json()
	player.updateSource(data.videoUrl)
}
```

## Key Points

### updateSource() Method

- **Purpose**: Efficiently change video source without recreating the player
- **Parameters**: `src` (string) - The new video URL
- **Returns**: Promise<void>
- **Events**: Emits `sourcechange` event
- **Behavior**:
  - Pauses current playback
  - Destroys HLS instance
  - Resets player state
  - Loads new source
  - Preserves UI controls and settings

### When to Use updateSource()

✅ **Use updateSource() when:**

- Switching between videos in a playlist
- Loading videos on-demand
- Implementing video navigation (next/previous)
- Changing video based on user selection

❌ **Don't use updateSource() when:**

- You need to change other config options (theme, controls, etc.)
- You need to destroy and recreate the player
- Initial player setup

### React Component Patterns

#### Pattern 1: useRef + onReady (Recommended)

```tsx
const playerRef = useRef<WontumPlayer | null>(null)

<WontumPlayerReact
	ref={playerRef}
	onReady={(player) => playerRef.current = player}
	src={videoUrl}
/>
```

#### Pattern 2: No Initial Source

```tsx
<WontumPlayerReact
	ref={playerRef}
	// No src prop - load later with updateSource()
	controls={true}
/>
```

#### Pattern 3: Dynamic Source Updates

```tsx
useEffect(() => {
	if (playerRef.current && newVideoUrl) {
		playerRef.current.updateSource(newVideoUrl)
	}
}, [newVideoUrl])
```

## Error Handling

```tsx
function VideoPlayer() {
	const playerRef = useRef<WontumPlayer | null>(null)

	const loadVideo = async (url: string) => {
		if (!playerRef.current) {
			console.error("Player not ready")
			return
		}

		try {
			await playerRef.current.updateSource(url)
			console.log("Video loaded successfully")
		} catch (error) {
			console.error("Failed to load video:", error)
		}
	}

	return <WontumPlayerReact ref={playerRef} controls={true} onReady={(player) => (playerRef.current = player)} onError={(error) => console.error("Player error:", error)} />
}
```
