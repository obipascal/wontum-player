/**
 * Complete Event Demo - All Mux Player Compatible Events
 *
 * This demonstrates all available events in Wontum Player,
 * which are compatible with Mux Player and HTML5 MediaElement events.
 */

import { WontumPlayer } from "../src/index"

/**
 * All available events in Wontum Player (Mux Player compatible)
 */
export function allEventsDemo() {
	const player = new WontumPlayer({
		src: "https://media.domain.com/path/to/video/index.m3u8",
		container: "#player",
	})

	// ========== PLAYBACK EVENTS ==========

	// Fires when playback starts
	player.on("play", (event) => {
		console.log("▶️ Play", event)
	})

	// Fires when playback is paused
	player.on("pause", (event) => {
		console.log("⏸️ Pause", event)
	})

	// Fires when playback actually starts (after buffering)
	player.on("playing", (event) => {
		console.log("▶️ Playing (actually playing now)", event)
	})

	// Fires when playback reaches the end
	player.on("ended", (event) => {
		console.log("🏁 Ended", event)
	})

	// Fires continuously during playback (current time updates)
	player.on("timeupdate", (event) => {
		console.log("⏱️ Time Update", event.data?.currentTime)
	})

	// ========== SEEKING EVENTS ==========

	// Fires when seeking starts
	player.on("seeking", (event) => {
		console.log("🔍 Seeking...", event)
	})

	// Fires when seeking completes
	player.on("seeked", (event) => {
		console.log("✅ Seeked to", event.data?.currentTime)
	})

	// ========== LOADING/BUFFERING EVENTS ==========

	// Fires when browser starts looking for media
	player.on("loadstart", (event) => {
		console.log("🔄 Load Start", event)
	})

	// Fires when first frame of media has been loaded
	player.on("loadeddata", (event) => {
		console.log("📦 Loaded Data (first frame)", event)
	})

	// Fires when metadata (duration, dimensions, etc.) is loaded
	player.on("loadedmetadata", (event) => {
		console.log("📋 Loaded Metadata", event.data)
	})

	// Fires when browser can start playing media
	player.on("canplay", (event) => {
		console.log("✅ Can Play", event)
	})

	// Fires when browser estimates it can play through without stopping
	player.on("canplaythrough", (event) => {
		console.log("✅ Can Play Through (no buffering expected)", event)
	})

	// Fires when browser is downloading media
	player.on("progress", (event) => {
		console.log("⬇️ Download Progress", event.data?.buffered)
	})

	// Fires when playback stops to buffer more data
	player.on("waiting", (event) => {
		console.log("⏳ Waiting (buffering)...", event)
	})

	// ========== MEDIA STATE EVENTS ==========

	// Fires when duration changes (e.g., live stream)
	player.on("durationchange", (event) => {
		console.log("⏱️ Duration Changed", event.data?.duration)
	})

	// Fires when volume or mute state changes
	player.on("volumechange", (event) => {
		console.log("🔊 Volume Changed", event.data)
	})

	// Fires when playback rate changes
	player.on("ratechange", (event) => {
		console.log("⚡ Playback Rate Changed", event.data?.playbackRate)
	})

	// Fires when video dimensions change
	player.on("resize", (event) => {
		console.log("📐 Resize", event.data)
	})

	// ========== NETWORK/ERROR EVENTS ==========

	// Fires when media loading has been aborted
	player.on("abort", (event) => {
		console.log("🚫 Abort (loading aborted)", event)
	})

	// Fires when media element becomes empty
	player.on("emptied", (event) => {
		console.log("📭 Emptied", event)
	})

	// Fires when media data loading has stalled
	player.on("stalled", (event) => {
		console.log("🐌 Stalled (network issue)", event)
	})

	// Fires when browser intentionally isn't fetching media
	player.on("suspend", (event) => {
		console.log("⏸️ Suspend (intentionally not loading)", event)
	})

	// Fires when an error occurs
	player.on("error", (event) => {
		console.error("❌ Error", event.data?.error)
	})

	// ========== CUSTOM PLAYER EVENTS ==========

	// Fires when video quality changes
	player.on("qualitychange", (event) => {
		console.log("🎬 Quality Changed", event.data?.quality)
	})

	// Fires when fullscreen state changes
	player.on("fullscreenchange", (event) => {
		console.log("🖥️ Fullscreen Changed", event.data)
	})

	return player
}

/**
 * Event categories breakdown
 */
export const EventCategories = {
	/**
	 * Playback Events - Control and playback state
	 */
	playback: ["play", "pause", "playing", "ended", "timeupdate"],

	/**
	 * Seeking Events - User navigation
	 */
	seeking: ["seeking", "seeked"],

	/**
	 * Loading Events - Media loading and buffering
	 */
	loading: ["loadstart", "loadeddata", "loadedmetadata", "canplay", "canplaythrough", "progress", "waiting", "durationchange"],

	/**
	 * Media State Events - Volume, rate, dimensions
	 */
	mediaState: ["volumechange", "ratechange", "resize"],

	/**
	 * Network/Error Events - Network issues and errors
	 */
	network: ["abort", "emptied", "stalled", "suspend", "error"],

	/**
	 * Custom Player Events - Wontum Player specific
	 */
	custom: ["qualitychange", "fullscreenchange"],
} as const

/**
 * Minimal event listener example
 */
export function minimalEventExample() {
	const player = new WontumPlayer({
		src: "https://media.domain.com/video.m3u8",
		container: "#player",
	})

	// Listen to most common events
	player.on("play", () => console.log("Started playing"))
	player.on("pause", () => console.log("Paused"))
	player.on("ended", () => console.log("Video finished"))
	player.on("error", (e) => console.error("Error:", e.data))
}

/**
 * React example with all events
 */
export const ReactAllEventsExample = `
import React from 'react';
import { WontumPlayerReact } from '@wontum/player';

function VideoPlayerWithEvents() {
  return (
    <WontumPlayerReact
      src="https://media.domain.com/video.m3u8"
      
      {/* Playback Events */}
      onPlay={(e) => console.log('Play', e)}
      onPause={(e) => console.log('Pause', e)}
      onPlaying={(e) => console.log('Playing', e)}
      onEnded={(e) => console.log('Ended', e)}
      onTimeupdate={(e) => console.log('Time:', e.data.currentTime)}
      
      {/* Seeking */}
      onSeeking={(e) => console.log('Seeking', e)}
      onSeeked={(e) => console.log('Seeked', e)}
      
      {/* Loading Events */}
      onLoadstart={(e) => console.log('Load Start', e)}
      onLoadeddata={(e) => console.log('Loaded Data', e)}
      onLoadedmetadata={(e) => console.log('Metadata', e)}
      onCanplay={(e) => console.log('Can Play', e)}
      onCanplaythrough={(e) => console.log('Can Play Through', e)}
      onProgress={(e) => console.log('Progress', e)}
      onWaiting={(e) => console.log('Buffering', e)}
      onDurationchange={(e) => console.log('Duration', e)}
      
      {/* Media State */}
      onVolumechange={(e) => console.log('Volume', e)}
      onRatechange={(e) => console.log('Rate', e)}
      onResize={(e) => console.log('Resize', e)}
      
      {/* Network/Error */}
      onAbort={(e) => console.log('Abort', e)}
      onEmptied={(e) => console.log('Emptied', e)}
      onStalled={(e) => console.log('Stalled', e)}
      onSuspend={(e) => console.log('Suspend', e)}
      onError={(e) => console.error('Error', e)}
      
      {/* Custom Events */}
      onQualitychange={(e) => console.log('Quality', e)}
      onFullscreenchange={(e) => console.log('Fullscreen', e)}
    />
  );
}
`

/**
 * Compare with Mux Player events
 */
export const MuxPlayerCompatibility = {
	// All Mux Player standard events are supported ✅
	muxPlayerEvents: [
		"abort",
		"canplay",
		"canplaythrough",
		"durationchange",
		"emptied",
		"ended",
		"error",
		"loadeddata",
		"loadedmetadata",
		"loadstart",
		"pause",
		"play",
		"playing",
		"progress",
		"ratechange",
		"resize",
		"seeked",
		"seeking",
		"stalled",
		"suspend",
		"timeupdate",
		"volumechange",
		"waiting",
	],

	// Additional Wontum Player events
	wontumExtensions: [
		"qualitychange", // Quality/bitrate changes
		"fullscreenchange", // Fullscreen state changes
	],

	// All supported
	allSupported: true,
	totalEvents: 25, // 23 Mux compatible + 2 extensions
}
