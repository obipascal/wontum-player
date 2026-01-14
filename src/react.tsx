import * as React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { WontumPlayer } from "./player"
import { WontumPlayerConfig, PlayerState, AnalyticsConfig, AnalyticsEvent } from "./types"
import { WontumFileInfo, VideoFileInfo } from "./file-info"
import { Analytics } from "./analytics"

export interface WontumPlayerReactProps extends Omit<WontumPlayerConfig, "container"> {
	/** Callback when player is ready */
	onReady?: (player: WontumPlayer) => void

	/** Callback for player events */
	onPlay?: () => void
	onPause?: () => void
	onEnded?: () => void
	onTimeUpdate?: (currentTime: number) => void
	onVolumeChange?: (volume: number, muted: boolean) => void
	onError?: (error: any) => void
	onLoadedMetadata?: () => void
	onQualityChange?: (level: number) => void

	/** Container style */
	style?: React.CSSProperties

	/** Container className */
	className?: string

	/** Width of player */
	width?: string | number

	/** Height of player */
	height?: string | number
}

/**
 * WontumPlayerReact - React component wrapper for WontumPlayer
 */
export const WontumPlayerReact: React.FC<WontumPlayerReactProps> = (props) => {
	const {
		src,
		autoplay,
		muted,
		controls = true,
		poster,
		preload,
		theme,
		s3Config,
		analytics,
		hlsConfig,
		subtitles,
		stickyControls,
		onReady,
		onPlay,
		onPause,
		onEnded,
		onTimeUpdate,
		onVolumeChange,
		onError,
		onLoadedMetadata,
		onQualityChange,
		style,
		className,
		width = "100%",
		height = "500px",
	} = props
	const containerRef = useRef<HTMLDivElement>(null)
	const playerRef = useRef<WontumPlayer | null>(null)

	// Initialize player
	useEffect(() => {
		if (!containerRef.current) return

		const config: WontumPlayerConfig = {
			src,
			container: containerRef.current,
			autoplay,
			muted,
			controls,
			poster,
			preload,
			theme,
			s3Config,
			analytics,
			hlsConfig,
			subtitles,
			stickyControls,
		}

		const player = new WontumPlayer(config)
		playerRef.current = player

		// Setup event listeners
		if (onPlay) player.on("play", onPlay)
		if (onPause) player.on("pause", onPause)
		if (onEnded) player.on("ended", onEnded)
		if (onError) player.on("error", (e) => onError(e.data?.error))
		if (onLoadedMetadata) player.on("loadedmetadata", onLoadedMetadata)
		if (onQualityChange) player.on("qualitychange", (e) => onQualityChange(e.data.level))

		if (onTimeUpdate) {
			player.on("timeupdate", (e) => onTimeUpdate(e.data.currentTime))
		}

		if (onVolumeChange) {
			player.on("volumechange", (e) => onVolumeChange(e.data.volume, e.data.muted))
		}

		if (onReady) {
			onReady(player)
		}

		// Cleanup
		return () => {
			player.destroy()
			playerRef.current = null
		}
	}, [src]) // Re-initialize only when src changes

	return (
		<div
			ref={containerRef}
			className={className}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
				...style,
			}}
		/>
	)
}

/**
 * useWontumPlayer - React hook for imperative player control
 */
export const useWontumPlayer = (config: Omit<WontumPlayerConfig, "container">) => {
	const [player, setPlayer] = useState<WontumPlayer | null>(null)
	const [state, setState] = useState<PlayerState | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		const playerInstance = new WontumPlayer({
			...config,
			container: containerRef.current,
		})

		setPlayer(playerInstance)

		// Subscribe to state changes
		const updateState = () => {
			setState(playerInstance.getState())
		}

		playerInstance.on("play", updateState)
		playerInstance.on("pause", updateState)
		playerInstance.on("timeupdate", updateState)
		playerInstance.on("volumechange", updateState)
		playerInstance.on("loadedmetadata", updateState)

		return () => {
			playerInstance.destroy()
		}
	}, [config.src])

	return {
		containerRef,
		player,
		state,
	}
}

/**
 * WontumPlayerProvider - Context provider for player instance
 */
interface WontumPlayerContextValue {
	player: WontumPlayer | null
	state: PlayerState | null
}

const WontumPlayerContext = React.createContext<WontumPlayerContextValue>({
	player: null,
	state: null,
})

export const WontumPlayerProvider: React.FC<{
	player: WontumPlayer
	children: React.ReactNode
}> = (props) => {
	const { player, children } = props
	const [state, setState] = useState<PlayerState>(player.getState())

	useEffect(() => {
		const updateState = () => {
			setState(player.getState())
		}

		player.on("play", updateState)
		player.on("pause", updateState)
		player.on("timeupdate", updateState)
		player.on("volumechange", updateState)
		player.on("loadedmetadata", updateState)

		return () => {
			// Event listeners will be cleaned up when player is destroyed
		}
	}, [player])

	return <WontumPlayerContext.Provider value={{ player, state }}>{children}</WontumPlayerContext.Provider>
}

export const useWontumPlayerContext = () => {
	const context = React.useContext(WontumPlayerContext)
	if (!context.player) {
		throw new Error("useWontumPlayerContext must be used within WontumPlayerProvider")
	}
	return context
}

/**
 * Hook for extracting video file information
 * @param file - The video file to analyze (File object or null)
 * @returns Object containing loading state, error, and video info
 */
export interface UseVideoFileInfoResult {
	/** Video file information (null if not loaded or error occurred) */
	info: VideoFileInfo | null
	/** Whether extraction is in progress */
	loading: boolean
	/** Error message if extraction failed */
	error: string | null
	/** Re-extract file info (useful for retry after error) */
	refetch: () => Promise<void>
}

export const useVideoFileInfo = (file: File | null | undefined): UseVideoFileInfoResult => {
	const [info, setInfo] = useState<VideoFileInfo | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const fileInfoRef = useRef<WontumFileInfo | null>(null)

	const extractInfo = useCallback(async () => {
		if (!file) {
			setInfo(null)
			setError(null)
			setLoading(false)
			return
		}

		setLoading(true)
		setError(null)

		try {
			// Clean up previous instance
			if (fileInfoRef.current) {
				fileInfoRef.current.destroy()
				fileInfoRef.current = null
			}

			// Create new instance and extract info
			const fileInfo = new WontumFileInfo(file)
			fileInfoRef.current = fileInfo

			const extractedInfo = await fileInfo.extract()
			setInfo(extractedInfo)
			setError(null)
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to extract video information"
			setError(errorMessage)
			setInfo(null)
		} finally {
			setLoading(false)
		}
	}, [file])

	// Extract info when file changes
	useEffect(() => {
		extractInfo()

		// Cleanup on unmount or file change
		return () => {
			if (fileInfoRef.current) {
				fileInfoRef.current.destroy()
				fileInfoRef.current = null
			}
		}
	}, [extractInfo])

	return { info, loading, error, refetch: extractInfo }
}

/**
 * Result type for useAnalytics hook
 */
export interface UseAnalyticsResult {
	/** Track a custom event */
	trackEvent: (eventType: string, data?: Record<string, any>) => void

	/** Get all tracked events */
	getEvents: () => AnalyticsEvent[]

	/** Get analytics metrics (session duration, buffer time, etc.) */
	getMetrics: () => Record<string, any>

	/** WebSocket connection status (for websocket/socket.io analytics) */
	connected: boolean

	/** Session ID for this analytics instance */
	sessionId: string
}

/**
 * React hook for analytics tracking
 * Automatically handles lifecycle management and cleanup
 *
 * @example
 * ```tsx
 * const { trackEvent, getMetrics, connected } = useAnalytics({
 *   enabled: true,
 *   endpoint: "https://api.example.com/analytics",
 *   videoId: "video-123",
 *   userId: "user-456",
 *   webSocket: {
 *     type: "socket.io",
 *     url: "https://analytics.example.com",
 *     auth: { token: "your-token" }
 *   }
 * })
 *
 * // Track custom events
 * trackEvent("button_clicked", { buttonName: "share" })
 * ```
 */
export const useAnalytics = (config?: AnalyticsConfig): UseAnalyticsResult => {
	const analyticsRef = useRef<Analytics | null>(null)
	const [connected, setConnected] = useState(false)
	const [sessionId, setSessionId] = useState("")

	// Initialize analytics instance
	useEffect(() => {
		// Create analytics instance
		const analytics = new Analytics(config)
		analyticsRef.current = analytics
		setSessionId(analytics.getMetrics().sessionId)

		// Monitor WebSocket connection status if websocket is configured
		if (config?.webSocket) {
			const checkConnection = setInterval(() => {
				if (!analyticsRef.current) {
					setConnected(false)
					return
				}

				// Check native WebSocket connection
				const wsConfig = config.webSocket
				if (wsConfig && "type" in wsConfig && wsConfig.type === "websocket") {
					const ws = (analyticsRef.current as any).webSocket as WebSocket | null
					setConnected(ws?.readyState === WebSocket.OPEN)
				}
				// Check Socket.IO connection
				else if (wsConfig && "type" in wsConfig && wsConfig.type === "socket.io") {
					const socket = (analyticsRef.current as any).socketIO
					setConnected(socket?.connected ?? false)
				} else if (wsConfig) {
					// Backward compatibility: assume native WebSocket
					const ws = (analyticsRef.current as any).webSocket as WebSocket | null
					setConnected(ws?.readyState === WebSocket.OPEN)
				}
			}, 1000)

			return () => {
				clearInterval(checkConnection)
				if (analyticsRef.current) {
					analyticsRef.current.destroy()
					analyticsRef.current = null
				}
			}
		}

		// Cleanup on unmount
		return () => {
			if (analyticsRef.current) {
				analyticsRef.current.destroy()
				analyticsRef.current = null
			}
		}
	}, [config])

	// Memoized track event function
	const trackEvent = useCallback((eventType: string, data?: Record<string, any>) => {
		analyticsRef.current?.trackEvent(eventType, data)
	}, [])

	// Memoized get events function
	const getEvents = useCallback((): AnalyticsEvent[] => {
		return analyticsRef.current?.getEvents() ?? []
	}, [])

	// Memoized get metrics function
	const getMetrics = useCallback((): Record<string, any> => {
		return analyticsRef.current?.getMetrics() ?? {}
	}, [])

	return {
		trackEvent,
		getEvents,
		getMetrics,
		connected,
		sessionId,
	}
}
