/**
 * Public HLS Stream Testing
 *
 * Test Wontum Player with publicly accessible HLS streams
 * (no signing or authentication required)
 */

import { WontumPlayer } from "../src/index"

/**
 * Example 1: Basic public stream
 */
export function basicPublicStream() {
	const player = new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Mux test stream
		container: "#player",
		autoplay: true,
		controls: true,
	})

	return player
}

/**
 * Example 2: With event logging
 */
export function publicStreamWithEvents() {
	const player = new WontumPlayer({
		src: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
		container: "#player",
	})

	// Log important events
	player.on("loadstart", () => console.log("🔄 Loading stream..."))
	player.on("loadedmetadata", (e) => console.log("✅ Metadata loaded:", e.data))
	player.on("canplay", () => console.log("▶️ Ready to play"))
	player.on("playing", () => console.log("🎬 Playing!"))
	player.on("error", (e) => console.error("❌ Error:", e.data))
	player.on("qualitychange", (e) => console.log("📊 Quality:", e.data.quality))

	return player
}

/**
 * Example 3: Multiple quality levels
 */
export function adaptiveStreamTest() {
	const player = new WontumPlayer({
		src: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
		container: "#player",
		autoplay: false,
		controls: true,
	})

	// Monitor quality changes
	player.on("loadedmetadata", (e) => {
		const qualities = e.data?.qualities || []
		console.log(`Available qualities: ${qualities.length}`)
		qualities.forEach((q: any) => {
			console.log(`  - ${q.name} (${q.width}x${q.height}, ${q.bitrate}bps)`)
		})
	})

	return player
}

/**
 * Public HLS Test Streams
 */
export const PUBLIC_TEST_STREAMS = {
	// Apple test streams
	appleBasic: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
	apple4K: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8",

	// Mux test streams
	muxDemo: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",

	// Big Buck Bunny (open source movie)
	bigBuckBunny: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",

	// Tears of Steel (Blender Foundation)
	tearsOfSteel: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",

	// Sintel (Blender Foundation)
	sintel: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",

	// Multi-bitrate test
	multiBitrate: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
}

/**
 * Quick test function - just paste into console
 */
export function quickTest(streamUrl?: string) {
	// Clean up any existing players
	const container = document.getElementById("player") || createTestContainer()

	const player = new WontumPlayer({
		src: streamUrl || PUBLIC_TEST_STREAMS.muxDemo,
		container: container as HTMLElement,
		autoplay: true,
		controls: true,
	})

	// Log to console
	console.log("🎬 Wontum Player Test Started")
	console.log("Stream:", streamUrl || PUBLIC_TEST_STREAMS.muxDemo)

	player.on("loadedmetadata", (e) => {
		console.log("✅ Loaded! Duration:", e.data?.duration, "seconds")
	})

	player.on("error", (e) => {
		console.error("❌ Error:", e.data)
	})

	// Expose player globally for testing
	;(window as any).testPlayer = player

	console.log("Player available as window.testPlayer")

	return player
}

function createTestContainer(): HTMLElement {
	const existing = document.getElementById("player")
	if (existing) return existing

	const container = document.createElement("div")
	container.id = "player"
	container.style.width = "800px"
	container.style.height = "450px"
	container.style.margin = "20px"
	container.style.backgroundColor = "#000"
	document.body.appendChild(container)

	return container
}

/**
 * HTML Example for quick testing
 */
export const htmlExample = `
<!DOCTYPE html>
<html>
<head>
  <title>Wontum Player Test</title>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: Arial, sans-serif; 
      background: #1a1a1a;
      color: white;
    }
    #player { 
      width: 100%; 
      max-width: 1200px; 
      height: 600px; 
      background: #000;
      margin: 20px auto;
    }
    .info {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="info">
    <h1>🎬 Wontum Player Test</h1>
    <p>Testing with public HLS stream (no authentication required)</p>
  </div>
  
  <div id="player"></div>

  <script type="module">
    import { WontumPlayer } from './dist/index.js';
    
    const player = new WontumPlayer({
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      container: '#player',
      autoplay: true,
      controls: true,
      analytics: {
        enabled: true
      }
    });

    // Log events
    player.on('loadedmetadata', (e) => {
      console.log('Duration:', e.data.duration);
    });
    
    player.on('play', () => console.log('Playing!'));
    player.on('pause', () => console.log('Paused'));
    player.on('error', (e) => console.error('Error:', e.data));
    
    // Make player available in console
    window.player = player;
  </script>
</body>
</html>
`

/**
 * React example with public stream
 */
export const reactPublicStreamExample = `
import React from 'react';
import { WontumPlayerReact } from '@wontum/player';

function App() {
  return (
    <div style={{ width: '100%', height: '600px', background: '#000' }}>
      <WontumPlayerReact
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        autoplay
        onLoadedmetadata={(e) => console.log('Duration:', e.data.duration)}
        onPlay={() => console.log('Playing!')}
        onError={(e) => console.error('Error:', e.data)}
      />
    </div>
  );
}

export default App;
`
