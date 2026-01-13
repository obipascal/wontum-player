import { Socket } from "socket.io-client"
import { AnalyticsConfig, AnalyticsEvent, SocketIOAnalyticsHandler, WebSocketAnalyticsHandler } from "./types"

/**
 * Analytics - Tracks player events and quality metrics
 */
export class Analytics {
	private config: AnalyticsConfig | undefined
	private sessionId: string
	private events: AnalyticsEvent[] = []
	private sessionStartTime: number
	private playbackStartTime: number | null = null
	private totalPlayTime = 0
	private totalBufferTime = 0
	private bufferStartTime: number | null = null
	private rebufferCount = 0
	private seekCount = 0
	private webSocket: WebSocket | null = null
	private socketIO: typeof Socket | null = null
	private wsReconnectTimeout: number | null = null
	private isDestroyed = false

	constructor(config?: AnalyticsConfig) {
		this.config = config
		this.sessionId = config?.sessionId || this.generateSessionId()
		this.sessionStartTime = Date.now()

		// Initialize WebSocket or Socket.IO if configured
		if (this.config?.webSocket) {
			const wsConfig = this.config.webSocket
			if ("type" in wsConfig) {
				if (wsConfig.type === "socket.io") {
					this.initializeSocketIO()
				} else {
					this.initializeWebSocket()
				}
			} else {
				// Backward compatibility: assume native WebSocket if no type specified
				this.initializeWebSocket()
			}
		}

		if (this.config?.enabled) {
			this.trackEvent("session_start", this.getSessionData())
		}
	}

	public trackEvent(eventType: string, data: Record<string, any> = {}): void {
		if (!this.config?.enabled) return

		const event: AnalyticsEvent = {
			eventType,
			timestamp: Date.now(),
			sessionId: this.sessionId,
			videoId: this.config.videoId,
			userId: this.config.userId,
			data: {
				...data,
				...this.getQoEMetrics(),
			},
		}

		this.events.push(event)
		this.updateMetrics(eventType, data)

		// Send to WebSocket if connected
		if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			this.sendToWebSocket(event)
		}

		// Send to Socket.IO if connected
		if (this.socketIO && this.socketIO.connected) {
			this.sendToSocketIO(event)
		}

		// Send to analytics endpoint if configured
		if (this.config.endpoint) {
			this.sendEvent(event)
		}

		// Log to console in development
		if (process.env.NODE_ENV === "development") {
			console.log("[Analytics]", eventType, event.data)
		}
	}

	private updateMetrics(eventType: string, data: Record<string, any>): void {
		switch (eventType) {
			case "play":
				this.playbackStartTime = Date.now()
				break

			case "pause":
			case "ended":
				if (this.playbackStartTime) {
					this.totalPlayTime += Date.now() - this.playbackStartTime
					this.playbackStartTime = null
				}
				break

			case "buffering_start":
				this.bufferStartTime = Date.now()
				this.rebufferCount++
				break

			case "buffering_end":
				if (this.bufferStartTime) {
					this.totalBufferTime += Date.now() - this.bufferStartTime
					this.bufferStartTime = null
				}
				break

			case "seeked":
				this.seekCount++
				break
		}
	}

	private getQoEMetrics(): Record<string, any> {
		const sessionDuration = Date.now() - this.sessionStartTime
		const bufferingRatio = this.totalPlayTime > 0 ? this.totalBufferTime / this.totalPlayTime : 0

		return {
			sessionDuration,
			totalPlayTime: this.totalPlayTime,
			totalBufferTime: this.totalBufferTime,
			bufferingRatio: Math.round(bufferingRatio * 1000) / 1000,
			rebufferCount: this.rebufferCount,
			seekCount: this.seekCount,
		}
	}

	private getSessionData(): Record<string, any> {
		return {
			userAgent: navigator.userAgent,
			platform: navigator.platform,
			language: navigator.language,
			screenResolution: `${screen.width}x${screen.height}`,
			viewport: `${window.innerWidth}x${window.innerHeight}`,
			connection: this.getConnectionInfo(),
		}
	}

	private getConnectionInfo(): any {
		const nav = navigator as any
		const connection = nav.connection || nav.mozConnection || nav.webkitConnection

		if (connection) {
			return {
				effectiveType: connection.effectiveType,
				downlink: connection.downlink,
				rtt: connection.rtt,
				saveData: connection.saveData,
			}
		}

		return null
	}

	private async sendEvent(event: AnalyticsEvent): Promise<void> {
		if (!this.config?.endpoint) return

		try {
			await fetch(this.config.endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(event),
			})
		} catch (error) {
			console.error("Failed to send analytics event:", error)
		}
	}

	private generateSessionId(): string {
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	}

	private async initializeSocketIO(): Promise<void> {
		if (!this.config?.webSocket || !("type" in this.config.webSocket)) return

		const socketConfig = this.config.webSocket as SocketIOAnalyticsHandler
		if (socketConfig.type !== "socket.io") return

		try {
			// Create or use existing Socket.IO connection
			if (typeof socketConfig.connection === "string") {
				// Dynamically import socket.io-client
				const socketIOClient = await import("socket.io-client")
				const io = socketIOClient.default
				this.socketIO = io(socketConfig.connection, socketConfig.options || {})
			} else {
				this.socketIO = socketConfig.connection
			}

			if (!this.socketIO) return

			// Setup event handlers
			this.socketIO.on("connect", () => {
				if (process.env.NODE_ENV === "development") {
					console.log("[Analytics Socket.IO] Connected")
				}
				if (socketConfig.onConnect) {
					socketConfig.onConnect()
				}
			})

			this.socketIO.on("connect_error", (error: Error) => {
				console.error("[Analytics Socket.IO] Connection error:", error)
				if (socketConfig.onError) {
					socketConfig.onError(error)
				}
			})

			this.socketIO.on("disconnect", (reason: string) => {
				if (process.env.NODE_ENV === "development") {
					console.log("[Analytics Socket.IO] Disconnected:", reason)
				}
				if (socketConfig.onDisconnect) {
					socketConfig.onDisconnect(reason)
				}
			})

			this.socketIO.on("error", (error: Error) => {
				console.error("[Analytics Socket.IO] Error:", error)
				if (socketConfig.onError) {
					socketConfig.onError(error)
				}
			})
		} catch (error) {
			console.error("[Analytics Socket.IO] Failed to initialize:", error)
		}
	}

	private sendToSocketIO(event: AnalyticsEvent): void {
		if (!this.socketIO || !this.socketIO.connected) return

		try {
			const socketConfig = this.config?.webSocket as SocketIOAnalyticsHandler
			// Allow transformation before sending
			const payload = socketConfig?.transform ? socketConfig.transform(event) : event
			const eventName = socketConfig?.eventName || "analytics"

			this.socketIO.emit(eventName, payload)

			if (process.env.NODE_ENV === "development") {
				console.log(`[Analytics Socket.IO] Emitted (${eventName}):`, event.eventType)
			}
		} catch (error) {
			console.error("[Analytics Socket.IO] Failed to emit event:", error)
		}
	}

	private initializeWebSocket(): void {
		if (!this.config?.webSocket) return

		const wsConfig = this.config.webSocket as WebSocketAnalyticsHandler

		try {
			// Create or use existing WebSocket connection
			if (typeof wsConfig.connection === "string") {
				this.webSocket = new WebSocket(wsConfig.connection)
			} else {
				this.webSocket = wsConfig.connection
			}

			// Setup event handlers
			this.webSocket.onopen = (event) => {
				if (process.env.NODE_ENV === "development") {
					console.log("[Analytics WebSocket] Connected")
				}
				if (wsConfig.onOpen) {
					wsConfig.onOpen(event)
				}
			}

			this.webSocket.onerror = (event) => {
				console.error("[Analytics WebSocket] Error:", event)
				if (wsConfig.onError) {
					wsConfig.onError(event)
				}
			}

			this.webSocket.onclose = (event) => {
				if (process.env.NODE_ENV === "development") {
					console.log("[Analytics WebSocket] Disconnected")
				}
				if (wsConfig.onClose) {
					wsConfig.onClose(event)
				}

				// Auto-reconnect if enabled and not destroyed
				const autoReconnect = wsConfig.autoReconnect !== false // default true
				if (autoReconnect && !this.isDestroyed) {
					const delay = wsConfig.reconnectDelay || 3000
					if (process.env.NODE_ENV === "development") {
						console.log(`[Analytics WebSocket] Reconnecting in ${delay}ms...`)
					}
					this.wsReconnectTimeout = window.setTimeout(() => {
						this.initializeWebSocket()
					}, delay)
				}
			}
		} catch (error) {
			console.error("[Analytics WebSocket] Failed to initialize:", error)
		}
	}

	private sendToWebSocket(event: AnalyticsEvent): void {
		if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) return

		try {
			const wsConfig = this.config?.webSocket as WebSocketAnalyticsHandler
			// Allow transformation before sending
			const payload = wsConfig?.transform ? wsConfig.transform(event) : event

			this.webSocket.send(JSON.stringify(payload))

			if (process.env.NODE_ENV === "development") {
				console.log("[Analytics WebSocket] Sent:", event.eventType)
			}
		} catch (error) {
			console.error("[Analytics WebSocket] Failed to send event:", error)
		}
	}

	public getEvents(): AnalyticsEvent[] {
		return [...this.events]
	}

	public getMetrics(): Record<string, any> {
		return {
			sessionId: this.sessionId,
			...this.getQoEMetrics(),
			eventCount: this.events.length,
		}
	}

	public destroy(): void {
		this.isDestroyed = true

		if (this.config?.enabled) {
			this.trackEvent("session_end", this.getSessionData())
		}

		// Clean up WebSocket
		if (this.wsReconnectTimeout) {
			clearTimeout(this.wsReconnectTimeout)
			this.wsReconnectTimeout = null
		}

		if (this.webSocket) {
			this.webSocket.close()
			this.webSocket = null
		}

		if (this.socketIO) {
			this.socketIO.removeAllListeners()
			this.socketIO.disconnect()
			this.socketIO = null
		}

		this.events = []
	}
}
