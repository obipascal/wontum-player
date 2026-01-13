/**
 * Video file information extractor
 * Extracts metadata from video files (width, height, duration, size, etc.)
 */

export interface VideoFileInfo {
	width: number
	height: number
	aspectRatio: string
	size: number // bytes (raw value for computation)
	sizeInBytes: number // alias for size (raw value)
	sizeFormatted: string // e.g., "10.5 MB"
	duration: number // seconds (raw value for computation)
	durationInSeconds: number // alias for duration (raw value)
	durationFormatted: string // e.g., "01:23:45"
	mimeType: string
	fileName: string
	fileExtension: string
	bitrate?: number // kbps (estimated)
	frameRate?: number
	videoCodec?: string
	audioCodec?: string
}

export class WontumFileInfo {
	private file: File
	private videoElement: HTMLVideoElement | null = null
	private info: VideoFileInfo | null = null

	constructor(file: File) {
		// Validate that it's a video file
		if (!this.isVideoFile(file)) {
			throw new Error(`Invalid file type: ${file.type}. Expected a video file.`)
		}
		this.file = file
	}

	/**
	 * Check if the file is a valid video file
	 */
	private isVideoFile(file: File): boolean {
		// Check MIME type
		if (file.type.startsWith("video/")) {
			return true
		}

		// Fallback: check file extension
		const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".m4v", ".3gp", ".ts", ".m3u8"]
		const fileName = file.name.toLowerCase()
		return videoExtensions.some((ext) => fileName.endsWith(ext))
	}

	/**
	 * Extract video metadata
	 */
	public async extract(): Promise<VideoFileInfo> {
		return new Promise((resolve, reject) => {
			try {
				// Create video element
				this.videoElement = document.createElement("video")
				this.videoElement.preload = "metadata"
				this.videoElement.muted = true // Mute to avoid autoplay issues

				// Create object URL for the file
				const objectUrl = URL.createObjectURL(this.file)

				// Handle metadata loaded
				this.videoElement.onloadedmetadata = () => {
					try {
						if (!this.videoElement) {
							reject(new Error("Video element not initialized"))
							return
						}

						const width = this.videoElement.videoWidth
						const height = this.videoElement.videoHeight
						const duration = this.videoElement.duration

						// Calculate aspect ratio
						const aspectRatio = this.calculateAspectRatio(width, height)

						// Get file size
						const size = this.file.size
						const sizeFormatted = this.formatBytes(size)

						// Format duration
						const durationFormatted = this.formatDuration(duration)

						// Get file extension
						const fileExtension = this.getFileExtension(this.file.name)

						// Estimate bitrate (file size / duration)
						const bitrate = duration > 0 ? Math.round((size * 8) / duration / 1000) : undefined

						this.info = {
							width,
							height,
							aspectRatio,
							size,
							sizeInBytes: size, // raw value alias
							sizeFormatted,
							duration,
							durationInSeconds: duration, // raw value alias
							durationFormatted,
							mimeType: this.file.type || "video/unknown",
							fileName: this.file.name,
							fileExtension,
							bitrate,
						}

						// Clean up
						URL.revokeObjectURL(objectUrl)
						this.videoElement.remove()

						resolve(this.info)
					} catch (error) {
						URL.revokeObjectURL(objectUrl)
						reject(error)
					}
				}

				// Handle errors
				this.videoElement.onerror = () => {
					URL.revokeObjectURL(objectUrl)
					reject(new Error(`Failed to load video file: ${this.file.name}`))
				}

				// Load the video
				this.videoElement.src = objectUrl
			} catch (error) {
				reject(error)
			}
		})
	}

	/**
	 * Calculate aspect ratio (e.g., "16:9", "4:3")
	 */
	private calculateAspectRatio(width: number, height: number): string {
		const gcd = this.getGCD(width, height)
		const ratioWidth = width / gcd
		const ratioHeight = height / gcd

		// Common aspect ratios
		const ratio = ratioWidth / ratioHeight
		if (Math.abs(ratio - 16 / 9) < 0.01) return "16:9"
		if (Math.abs(ratio - 4 / 3) < 0.01) return "4:3"
		if (Math.abs(ratio - 21 / 9) < 0.01) return "21:9"
		if (Math.abs(ratio - 1) < 0.01) return "1:1"

		// Return calculated ratio
		return `${ratioWidth}:${ratioHeight}`
	}

	/**
	 * Get Greatest Common Divisor
	 */
	private getGCD(a: number, b: number): number {
		return b === 0 ? a : this.getGCD(b, a % b)
	}

	/**
	 * Format bytes to human-readable size
	 */
	private formatBytes(bytes: number): string {
		if (bytes === 0) return "0 Bytes"

		const k = 1024
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
		const i = Math.floor(Math.log(bytes) / Math.log(k))

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
	}

	/**
	 * Format duration to HH:MM:SS
	 */
	private formatDuration(seconds: number): string {
		if (!isFinite(seconds) || seconds < 0) return "00:00"

		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const secs = Math.floor(seconds % 60)

		if (hours > 0) {
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
		}

		return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
	}

	/**
	 * Get file extension
	 */
	private getFileExtension(fileName: string): string {
		const parts = fileName.split(".")
		return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : ""
	}

	// Getter properties for convenience
	public get width(): number {
		return this.info?.width || 0
	}

	public get height(): number {
		return this.info?.height || 0
	}

	public get aspectRatio(): string {
		return this.info?.aspectRatio || "unknown"
	}

	public get size(): number {
		return this.info?.size || 0
	}

	public get sizeInBytes(): number {
		return this.info?.sizeInBytes || 0
	}

	public get sizeFormatted(): string {
		return this.info?.sizeFormatted || "0 Bytes"
	}

	public get duration(): number {
		return this.info?.duration || 0
	}

	public get durationInSeconds(): number {
		return this.info?.durationInSeconds || 0
	}

	public get durationFormatted(): string {
		return this.info?.durationFormatted || "00:00"
	}

	public get mimeType(): string {
		return this.info?.mimeType || this.file.type || "video/unknown"
	}

	public get fileName(): string {
		return this.file.name
	}

	public get fileExtension(): string {
		return this.info?.fileExtension || ""
	}

	public get bitrate(): number | undefined {
		return this.info?.bitrate
	}

	public get quality(): string {
		if (!this.info) return "unknown"

		const height = this.info.height
		if (height >= 2160) return "4K (2160p)"
		if (height >= 1440) return "2K (1440p)"
		if (height >= 1080) return "Full HD (1080p)"
		if (height >= 720) return "HD (720p)"
		if (height >= 480) return "SD (480p)"
		if (height >= 360) return "360p"
		return "Low Quality"
	}

	/**
	 * Get all information as object
	 */
	public getInfo(): VideoFileInfo | null {
		return this.info
	}

	/**
	 * Clean up resources
	 */
	public destroy(): void {
		if (this.videoElement) {
			this.videoElement.remove()
			this.videoElement = null
		}
		this.info = null
	}
}
