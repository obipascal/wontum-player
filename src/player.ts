import Hls from "hls.js"
import { WontumPlayerConfig, PlayerState, PlayerEvent, PlayerEventType, QualityLevel } from "./types"
import { Analytics } from "./analytics"
import { UIController } from "./ui-controller"
import { S3Handler } from "./s3-handler"

/**
 * WontumPlayer - A modern HLS video player for educational platforms
 */
export class WontumPlayer {
	private container: HTMLElement
	private videoElement: HTMLVideoElement
	private hls: Hls | null = null
	private config: WontumPlayerConfig
	private eventListeners: Map<PlayerEventType, Set<(event: PlayerEvent) => void>> = new Map()
	public analytics: Analytics
	private s3Handler: S3Handler
	private uiController: UIController

	private state: PlayerState = {
		playing: false,
		paused: true,
		ended: false,
		buffering: false,
		currentTime: 0,
		duration: 0,
		volume: 1,
		muted: false,
		playbackRate: 1,
		quality: "auto",
		availableQualities: [],
		fullscreen: false,
	}

	constructor(config: WontumPlayerConfig) {
		this.config = config

		// Get container element
		this.container = typeof config.container === "string" ? (document.querySelector(config.container) as HTMLElement) : config.container

		if (!this.container) {
			throw new Error("Container element not found")
		}

		// Initialize components
		this.analytics = new Analytics(config.analytics)
		this.s3Handler = new S3Handler(config.s3Config)

		// Create video element
		this.videoElement = this.createVideoElement()
		this.container.appendChild(this.videoElement)

		// Initialize UI
		this.uiController = new UIController(this.container, this)

		// Setup player
		this.setupVideoListeners()
		this.loadSource(config.src)

		// Apply initial config
		if (config.autoplay) this.videoElement.autoplay = true
		if (config.muted) this.mute()
		if (config.poster) this.videoElement.poster = config.poster
		if (config.preload) this.videoElement.preload = config.preload

		// Add subtitle tracks
		if (config.subtitles) {
			this.addSubtitleTracks(config.subtitles)
		}
	}

	private addSubtitleTracks(subtitles: any[]): void {
		subtitles.forEach((subtitle) => {
			const track = document.createElement("track")
			track.kind = "subtitles"
			track.label = subtitle.label
			track.src = subtitle.src
			track.srclang = subtitle.srclang
			if (subtitle.default) {
				track.default = true
			}
			this.videoElement.appendChild(track)
		})
	}

	private createVideoElement(): HTMLVideoElement {
		const video = document.createElement("video")
		video.className = "wontum-player-video"
		video.style.width = "100%"
		video.style.height = "100%"
		video.playsInline = true
		return video
	}

	private setupVideoListeners(): void {
		// Playback events
		this.videoElement.addEventListener("play", () => {
			this.state.playing = true
			this.state.paused = false
			this.emit("play")
			this.analytics.trackEvent("play", this.getAnalyticsData())
		})

		this.videoElement.addEventListener("pause", () => {
			this.state.playing = false
			this.state.paused = true
			this.emit("pause")
			this.analytics.trackEvent("pause", this.getAnalyticsData())
		})

		this.videoElement.addEventListener("ended", () => {
			this.state.ended = true
			this.state.playing = false
			this.emit("ended")
			this.analytics.trackEvent("ended", this.getAnalyticsData())
		})

		this.videoElement.addEventListener("timeupdate", () => {
			this.state.currentTime = this.videoElement.currentTime
			this.emit("timeupdate", { currentTime: this.state.currentTime })
		})

		this.videoElement.addEventListener("loadedmetadata", () => {
			this.state.duration = this.videoElement.duration
			this.emit("loadedmetadata", { duration: this.state.duration })
			this.analytics.trackEvent("loadedmetadata", this.getAnalyticsData())
		})

		this.videoElement.addEventListener("volumechange", () => {
			this.state.volume = this.videoElement.volume
			this.state.muted = this.videoElement.muted
			this.emit("volumechange", { volume: this.state.volume, muted: this.state.muted })
		})

		this.videoElement.addEventListener("ratechange", () => {
			this.state.playbackRate = this.videoElement.playbackRate
			this.emit("ratechange", { playbackRate: this.state.playbackRate })
		})

		this.videoElement.addEventListener("waiting", () => {
			this.state.buffering = true
			this.emit("waiting")
			this.analytics.trackEvent("buffering_start", this.getAnalyticsData())
		})

		this.videoElement.addEventListener("canplay", () => {
			this.state.buffering = false
			this.emit("canplay")
			this.analytics.trackEvent("buffering_end", this.getAnalyticsData())
		})

		this.videoElement.addEventListener("seeking", () => {
			this.emit("seeking")
		})

		this.videoElement.addEventListener("seeked", () => {
			this.emit("seeked", { currentTime: this.state.currentTime })
			this.analytics.trackEvent("seeked", this.getAnalyticsData())
		})

		this.videoElement.addEventListener("error", (e) => {
			const error = this.videoElement.error
			this.emit("error", { error })
			this.analytics.trackEvent("error", { ...this.getAnalyticsData(), error: error?.message })
		})

		// Additional HTML5 MediaElement events (Mux Player compatible)
		this.videoElement.addEventListener("loadstart", () => {
			this.emit("loadstart")
		})

		this.videoElement.addEventListener("loadeddata", () => {
			this.emit("loadeddata")
		})

		this.videoElement.addEventListener("canplaythrough", () => {
			this.emit("canplaythrough")
		})

		this.videoElement.addEventListener("playing", () => {
			this.state.playing = true
			this.state.buffering = false
			this.emit("playing")
		})

		this.videoElement.addEventListener("durationchange", () => {
			this.state.duration = this.videoElement.duration
			this.emit("durationchange", { duration: this.state.duration })
		})

		this.videoElement.addEventListener("progress", () => {
			this.emit("progress", { buffered: this.videoElement.buffered })
		})

		this.videoElement.addEventListener("stalled", () => {
			this.emit("stalled")
		})

		this.videoElement.addEventListener("suspend", () => {
			this.emit("suspend")
		})

		this.videoElement.addEventListener("abort", () => {
			this.emit("abort")
		})

		this.videoElement.addEventListener("emptied", () => {
			this.emit("emptied")
		})

		this.videoElement.addEventListener("resize", () => {
			this.emit("resize", {
				videoWidth: this.videoElement.videoWidth,
				videoHeight: this.videoElement.videoHeight,
			})
		})
	}

	private async loadSource(src: string): Promise<void> {
		try {
			// Check if URL needs S3 presigning
			const videoUrl = await this.s3Handler.processUrl(src)

			// Check if HLS is supported
			if (Hls.isSupported()) {
				this.hls = new Hls(this.config.hlsConfig)

				this.hls.loadSource(videoUrl)
				this.hls.attachMedia(this.videoElement)

				this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
					const qualities = this.extractQualities(data.levels)
					this.state.availableQualities = qualities.map((q) => q.name)
					this.emit("loadedmetadata", { qualities })
				})

				this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
					const level = this.hls?.levels[data.level]
					if (level) {
						this.state.quality = `${level.height}p`
						this.emit("qualitychange", { quality: this.state.quality })
					}
				})

				this.hls.on(Hls.Events.ERROR, (event, data) => {
					if (data.fatal) {
						this.handleHlsError(data)
					}
				})
			} else if (this.videoElement.canPlayType("application/vnd.apple.mpegurl")) {
				// Native HLS support (Safari)
				this.videoElement.src = videoUrl
			} else {
				throw new Error("HLS is not supported in this browser")
			}
		} catch (error) {
			console.error("Failed to load video source:", error)
			this.emit("error", { error })
		}
	}

	private extractQualities(levels: any[]): QualityLevel[] {
		return levels.map((level) => ({
			height: level.height,
			width: level.width,
			bitrate: level.bitrate,
			name: `${level.height}p`,
		}))
	}

	private handleHlsError(data: any): void {
		switch (data.type) {
			case Hls.ErrorTypes.NETWORK_ERROR:
				console.error("Network error occurred")
				this.hls?.startLoad()
				break
			case Hls.ErrorTypes.MEDIA_ERROR:
				console.error("Media error occurred")
				this.hls?.recoverMediaError()
				break
			default:
				console.error("Fatal error occurred:", data)
				this.destroy()
				break
		}
	}

	private getAnalyticsData(): Record<string, any> {
		return {
			currentTime: this.state.currentTime,
			duration: this.state.duration,
			quality: this.state.quality,
			playbackRate: this.state.playbackRate,
			volume: this.state.volume,
			muted: this.state.muted,
		}
	}

	// Public API
	public play(): Promise<void> {
		return this.videoElement.play()
	}

	public pause(): void {
		this.videoElement.pause()
	}

	public seek(time: number): void {
		this.videoElement.currentTime = time
	}

	public skipForward(seconds: number = 10): void {
		const newTime = Math.min(this.state.currentTime + seconds, this.state.duration)
		this.seek(newTime)
	}

	public skipBackward(seconds: number = 10): void {
		const newTime = Math.max(this.state.currentTime - seconds, 0)
		this.seek(newTime)
	}

	public setVolume(volume: number): void {
		this.videoElement.volume = Math.max(0, Math.min(1, volume))
	}

	public mute(): void {
		this.videoElement.muted = true
	}

	public unmute(): void {
		this.videoElement.muted = false
	}

	public setPlaybackRate(rate: number): void {
		this.videoElement.playbackRate = rate
	}

	public setQuality(qualityIndex: number): void {
		if (this.hls) {
			this.hls.currentLevel = qualityIndex
		}
	}

	public enterFullscreen(): void {
		if (this.container.requestFullscreen) {
			this.container.requestFullscreen()
			this.state.fullscreen = true
			this.emit("fullscreenchange", { fullscreen: true })
		}
	}

	public exitFullscreen(): void {
		if (document.exitFullscreen) {
			document.exitFullscreen()
			this.state.fullscreen = false
			this.emit("fullscreenchange", { fullscreen: false })
		}
	}

	public getState(): PlayerState {
		return { ...this.state }
	}

	public getVideoElement(): HTMLVideoElement {
		return this.videoElement
	}

	/**
	 * Enable subtitles for a specific track
	 */
	public enableSubtitles(trackIndex: number): void {
		const tracks = this.videoElement.textTracks
		for (let i = 0; i < tracks.length; i++) {
			tracks[i].mode = i === trackIndex ? "showing" : "hidden"
		}
	}

	/**
	 * Disable all subtitles
	 */
	public disableSubtitles(): void {
		const tracks = this.videoElement.textTracks
		for (let i = 0; i < tracks.length; i++) {
			tracks[i].mode = "hidden"
		}
	}

	/**
	 * Toggle subtitles on/off
	 */
	public toggleSubtitles(): boolean {
		const tracks = this.videoElement.textTracks
		const hasVisibleTrack = Array.from(tracks).some((track) => track.mode === "showing")

		if (hasVisibleTrack) {
			this.disableSubtitles()
			return false
		} else {
			// Enable the first track if available
			if (tracks.length > 0) {
				this.enableSubtitles(0)
				return true
			}
			return false
		}
	}

	/**
	 * Get available subtitle tracks
	 */
	public getSubtitleTracks(): TextTrack[] {
		return Array.from(this.videoElement.textTracks)
	}

	/**
	 * Check if subtitles are currently enabled
	 */
	public areSubtitlesEnabled(): boolean {
		const tracks = this.videoElement.textTracks
		return Array.from(tracks).some((track) => track.mode === "showing")
	}

	public on(eventType: PlayerEventType, callback: (event: PlayerEvent) => void): void {
		if (!this.eventListeners.has(eventType)) {
			this.eventListeners.set(eventType, new Set())
		}
		this.eventListeners.get(eventType)!.add(callback)
	}

	public off(eventType: PlayerEventType, callback: (event: PlayerEvent) => void): void {
		this.eventListeners.get(eventType)?.delete(callback)
	}

	private emit(type: PlayerEventType, data?: any): void {
		const event: PlayerEvent = {
			type,
			data,
			timestamp: Date.now(),
		}

		this.eventListeners.get(type)?.forEach((callback) => {
			callback(event)
		})
	}

	public destroy(): void {
		if (this.hls) {
			this.hls.destroy()
			this.hls = null
		}

		this.uiController.destroy()
		this.videoElement.remove()
		this.eventListeners.clear()
		this.analytics.destroy()
	}
}
