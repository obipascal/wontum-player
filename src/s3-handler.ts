import { S3Config } from "./types"

/**
 * S3Handler - Manages S3/CloudFront URLs and signed cookie authentication
 */
export class S3Handler {
	private config: S3Config | undefined
	private urlCache: Map<string, { url: string; expiresAt: number }> = new Map()
	private signedUrls: Set<string> = new Set()

	constructor(config?: S3Config) {
		this.config = config
	}

	/**
	 * Process a URL - sign with CloudFront cookies or generate presigned URL for S3
	 */
	public async processUrl(url: string): Promise<string> {
		// Check if it's a CloudFront URL that needs signing
		if (this.isCloudFrontUrl(url)) {
			return this.signCloudFrontUrl(url)
		}

		// Check if it's an S3 URL
		if (this.isS3Url(url)) {
			return this.getPresignedUrl(url)
		}

		return url
	}

	/**
	 * Check if URL is a CloudFront URL that needs signing
	 */
	private isCloudFrontUrl(url: string): boolean {
		if (!this.config?.cloudFrontDomains || this.config.cloudFrontDomains.length === 0) {
			return false
		}

		try {
			const urlObj = new URL(url)
			return this.config.cloudFrontDomains.some((domain) => urlObj.hostname.includes(domain))
		} catch {
			return false
		}
	}

	/**
	 * Check if URL is an S3 URL
	 */
	private isS3Url(url: string): boolean {
		return url.includes(".s3.") || url.includes("s3.amazonaws.com") || url.startsWith("s3://")
	}

	/**
	 * Sign CloudFront URL by calling the signing endpoint
	 * The endpoint should set signed cookies and return the URL
	 */
	private async signCloudFrontUrl(url: string): Promise<string> {
		// Check if already signed in this session
		if (this.signedUrls.has(url)) {
			return url
		}

		// Use custom signing function if provided
		if (this.config?.signUrl) {
			try {
				const signedUrl = await this.config.signUrl(url)
				// Mark as signed to avoid re-signing
				this.signedUrls.add(url)
				return signedUrl
			} catch (error) {
				console.error("Failed to sign CloudFront URL:", error)
				throw new Error("Failed to sign CloudFront URL")
			}
		}

		// If no signing function provided, return URL as-is
		// (assumes cookies are already set or content is public)
		console.warn("No signUrl function provided. CloudFront cookies may not be set.")
		return url
	}

	/**
	 * Extract S3 key from URL
	 */
	private extractS3Key(url: string): string {
		// Handle s3:// protocol
		if (url.startsWith("s3://")) {
			const parts = url.replace("s3://", "").split("/")
			return parts.slice(1).join("/")
		}

		// Handle https://bucket.s3.region.amazonaws.com/key
		const match = url.match(/s3[.-]([^.]+)\.amazonaws\.com\/(.+)/)
		if (match) {
			return match[2]
		}

		// Handle https://bucket-name.s3.amazonaws.com/key
		const match2 = url.match(/([^.]+)\.s3\.amazonaws\.com\/(.+)/)
		if (match2) {
			return match2[2]
		}

		return url
	}

	/**
	 * Get presigned URL from cache or generate new one
	 */
	private async getPresignedUrl(url: string): Promise<string> {
		const key = this.extractS3Key(url)

		// Check cache
		const cached = this.urlCache.get(key)
		if (cached && cached.expiresAt > Date.now()) {
			return cached.url
		}

		// Generate new presigned URL
		if (this.config?.getPresignedUrl) {
			try {
				const presignedUrl = await this.config.getPresignedUrl(key)

				// Cache for 50 minutes (presigned URLs typically expire in 1 hour)
				this.urlCache.set(key, {
					url: presignedUrl,
					expiresAt: Date.now() + 50 * 60 * 1000,
				})

				return presignedUrl
			} catch (error) {
				console.error("Failed to generate presigned URL:", error)
				throw new Error("Failed to generate presigned URL for S3 object")
			}
		}

		// If no presigned URL function provided, return original URL
		// This assumes the S3 bucket is publicly accessible
		console.warn("No getPresignedUrl function provided. Using direct S3 URL (requires public bucket)")
		return url
	}

	/**
	 * Helper to construct S3 URL from bucket and key
	 */
	public static constructS3Url(bucket: string, key: string, region = "us-east-1"): string {
		return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
	}

	/**
	 * Helper to parse S3 URI (s3://bucket/key)
	 */
	public static parseS3Uri(uri: string): { bucket: string; key: string } | null {
		if (!uri.startsWith("s3://")) {
			return null
		}

		const parts = uri.replace("s3://", "").split("/")
		const bucket = parts[0]
		const key = parts.slice(1).join("/")

		return { bucket, key }
	}

	/**
	 * Clear URL cache and signed URLs
	 */
	public clearCache(): void {
		this.urlCache.clear()
		this.signedUrls.clear()
	}
}

/**
 * Example CloudFront signed cookie implementation:
 *
 * async function signUrl(url: string): Promise<string> {
 *   const response = await fetch('/api/cloudfront/sign', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ url }),
 *     credentials: 'include' // Important: include cookies in request
 *   });
 *
 *   const data = await response.json();
 *   // Backend sets CloudFront signed cookies in response
 *   // and returns the original URL
 *   return data.url;
 * }
 *
 * const player = new WontumPlayer({
 *   src: 'https://media.domain.com/path/to/video/index.m3u8',
 *   container: '#player',
 *   s3Config: {
 *     signUrl,
 *     cloudFrontDomains: ['media.domain.com']
 *   }
 * });
 *
 * ---
 *
 * Legacy S3 presigned URL example:
 *
 * import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
 * import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
 *
 * const s3Client = new S3Client({ region: 'us-east-1' });
 *
 * async function getPresignedUrl(key: string): Promise<string> {
 *   const command = new GetObjectCommand({
 *     Bucket: 'your-bucket-name',
 *     Key: key,
 *   });
 *
 *   return getSignedUrl(s3Client, command, { expiresIn: 3600 });
 * }
 */
