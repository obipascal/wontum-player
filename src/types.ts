import { Socket } from "socket.io-client"

/**
 * Player configuration options
 */
export interface WontumPlayerConfig {
	/** The S3 URL or HLS manifest URL */
	src: string

	/** Container element or selector */
	container: HTMLElement | string

	/** Autoplay video (subject to browser policies) */
	autoplay?: boolean

	/** Start muted */
	muted?: boolean

	/** Show player controls */
	controls?: boolean

	/** Video poster image URL */
	poster?: string

	/** Preload strategy: 'none' | 'metadata' | 'auto' */
	preload?: "none" | "metadata" | "auto"

	/** Custom player theme */
	theme?: PlayerTheme

	/** S3 configuration for presigned URLs */
	s3Config?: S3Config

	/** Analytics configuration */
	analytics?: AnalyticsConfig

	/** HLS.js configuration override */
	hlsConfig?: Partial<any>

	/** Subtitle tracks */
	subtitles?: SubtitleTrack[]

	/** Keep controls always visible (sticky) */
	stickyControls?: boolean
}

export interface PlayerTheme {
	primaryColor?: string
	accentColor?: string
	fontFamily?: string
	controlsBackground?: string
	buttonHoverBg?: string
	progressHeight?: string
	borderRadius?: string
}

export interface S3Config {
	/** Function to sign URL and set CloudFront cookies (returns the original URL after setting cookies) */
	signUrl?: (url: string) => Promise<string>

	/** Legacy: Function to generate presigned URL (for S3 direct access) */
	getPresignedUrl?: (key: string) => Promise<string>

	/** CloudFront domain patterns to match (e.g., ['media.domain.com']) */
	cloudFrontDomains?: string[]

	/** Enable credentials (cookies) for HLS requests - required for CloudFront signed cookies */
	withCredentials?: boolean

	/** S3 bucket region */
	region?: string

	/** Custom S3 endpoint */
	endpoint?: string
}

export interface AnalyticsConfig {
	/** Enable analytics */
	enabled?: boolean

	/** Custom analytics endpoint (HTTP/HTTPS) */
	endpoint?: string

	/** WebSocket handler for real-time analytics streaming (supports both native WebSocket and Socket.IO) */
	webSocket?: WebSocketAnalyticsHandler | SocketIOAnalyticsHandler

	/** Session identifier */
	sessionId?: string

	/** User identifier */
	userId?: string

	/** Video identifier */
	videoId?: string
}

/**
 * Native WebSocket handler for real-time analytics
 */
export interface WebSocketAnalyticsHandler {
	/** Type identifier for native WebSocket */
	type: "websocket"

	/** WebSocket connection instance or URL to connect to */
	connection: WebSocket | string

	/** Optional: Transform event before sending (allows filtering, formatting, etc.) */
	transform?: (event: AnalyticsEvent) => any

	/** Optional: Error handler for WebSocket errors */
	onError?: (error: Event) => void

	/** Optional: Handler for when WebSocket connection opens */
	onOpen?: (event: Event) => void

	/** Optional: Handler for when WebSocket connection closes */
	onClose?: (event: CloseEvent) => void

	/** Optional: Reconnect automatically on disconnect (default: true) */
	autoReconnect?: boolean

	/** Optional: Reconnect delay in milliseconds (default: 3000) */
	reconnectDelay?: number
}

/**
 * Socket.IO handler for real-time analytics
 */
export interface SocketIOAnalyticsHandler {
	/** Type identifier for Socket.IO */
	type: "socket.io"

	/** Socket.IO client instance or URL to connect to */
	connection: typeof Socket | string

	/** Optional: Socket.IO connection options (used when connection is a URL) */
	options?: Record<string, any>

	/** Optional: Event name to emit (default: "analytics") */
	eventName?: string

	/** Optional: Transform event before sending (allows filtering, formatting, etc.) */
	transform?: (event: AnalyticsEvent) => any

	/** Optional: Error handler */
	onError?: (error: Error) => void

	/** Optional: Handler for when connection is established */
	onConnect?: () => void

	/** Optional: Handler for when connection is lost */
	onDisconnect?: (reason: string) => void
}

/**
 * Player state
 */
export interface PlayerState {
	playing: boolean
	paused: boolean
	ended: boolean
	buffering: boolean
	currentTime: number
	duration: number
	volume: number
	muted: boolean
	playbackRate: number
	quality: string
	availableQualities: string[]
	fullscreen: boolean
}

/**
 * Player events (compatible with Mux Player and HTML5 MediaElement events)
 */
export type PlayerEventType =
	// Playback events
	| "play"
	| "pause"
	| "playing"
	| "ended"
	| "timeupdate"
	| "volumechange"
	| "ratechange"
	| "seeked"
	| "seeking"
	| "waiting"
	// Loading events
	| "loadstart"
	| "loadeddata"
	| "loadedmetadata"
	| "canplay"
	| "canplaythrough"
	| "durationchange"
	| "progress"
	// Error and state events
	| "error"
	| "abort"
	| "emptied"
	| "stalled"
	| "suspend"
	// Custom player events
	| "qualitychange"
	| "fullscreenchange"
	| "pictureinpictureenter"
	| "pictureinpictureexit"
	| "resize"

export interface PlayerEvent {
	type: PlayerEventType
	data?: any
	timestamp: number
}

/**
 * Analytics event types
 */
export interface AnalyticsEvent {
	eventType: string
	timestamp: number
	sessionId: string
	videoId?: string
	userId?: string
	data: Record<string, any>
}

export interface QualityLevel {
	height: number
	width: number
	bitrate: number
	name: string
}

export interface SubtitleTrack {
	label: string
	src: string
	srclang: string
	default?: boolean
}
