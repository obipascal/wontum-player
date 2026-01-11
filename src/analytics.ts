import { AnalyticsConfig, AnalyticsEvent } from "./types"

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

	constructor(config?: AnalyticsConfig) {
		this.config = config
		this.sessionId = config?.sessionId || this.generateSessionId()
		this.sessionStartTime = Date.now()

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
		if (this.config?.enabled) {
			this.trackEvent("session_end", this.getSessionData())
		}
		this.events = []
	}
}
