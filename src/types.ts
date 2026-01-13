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

	/** Custom analytics endpoint */
	endpoint?: string

	/** Session identifier */
	sessionId?: string

	/** User identifier */
	userId?: string

	/** Video identifier */
	videoId?: string
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
