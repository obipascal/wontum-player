# Backend Integration Guide

This guide shows how to integrate Wontum Player with various backend technologies for S3 video hosting and analytics.

## Table of Contents

1. [S3 Setup](#s3-setup)
2. [Presigned URL Generation](#presigned-url-generation)
3. [Analytics Backend](#analytics-backend)
4. [Video Upload Pipeline](#video-upload-pipeline)
5. [Authentication & Authorization](#authentication--authorization)

---

## S3 Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://your-video-bucket --region us-east-1
```

### 2. Enable CORS

Create a `cors.json` file:

```json
[
	{
		"AllowedHeaders": ["*"],
		"AllowedMethods": ["GET", "HEAD"],
		"AllowedOrigins": ["https://yourdomain.com"],
		"ExposeHeaders": ["ETag"],
		"MaxAgeSeconds": 3000
	}
]
```

Apply CORS configuration:

```bash
aws s3api put-bucket-cors --bucket your-video-bucket --cors-configuration file://cors.json
```

### 3. Bucket Policy for Private Videos

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "AllowPresignedURLAccess",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::your-video-bucket/*",
			"Condition": {
				"StringLike": {
					"aws:userid": "AIDAI*"
				}
			}
		}
	]
}
```

---

## Presigned URL Generation

### Node.js/Express

```javascript
// backend/routes/video.js
const express = require("express")
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

const router = express.Router()

const s3Client = new S3Client({
	region: process.env.AWS_REGION || "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
})

// Middleware to verify user has access to video
async function authorizeVideoAccess(req, res, next) {
	const { videoId } = req.params
	const userId = req.user.id // From authentication middleware

	// Check if user has access to this video
	const hasAccess = await checkUserVideoAccess(userId, videoId)

	if (!hasAccess) {
		return res.status(403).json({ error: "Access denied" })
	}

	next()
}

// Generate presigned URL endpoint
router.get("/videos/:videoId/url", authorizeVideoAccess, async (req, res) => {
	try {
		const { videoId } = req.params

		// Get video metadata from database
		const video = await getVideoMetadata(videoId)

		if (!video) {
			return res.status(404).json({ error: "Video not found" })
		}

		// Generate presigned URL
		const command = new GetObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: video.s3Key, // e.g., 'videos/course-1/lesson-1/playlist.m3u8'
		})

		const presignedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: 3600, // 1 hour
		})

		res.json({
			url: presignedUrl,
			expiresIn: 3600,
			videoId: video.id,
			title: video.title,
		})
	} catch (error) {
		console.error("Error generating presigned URL:", error)
		res.status(500).json({ error: "Failed to generate video URL" })
	}
})

module.exports = router
```

### Python/Django

```python
# backend/videos/views.py
import boto3
from botocore.config import Config
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Video

s3_client = boto3.client(
    's3',
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    config=Config(signature_version='s3v4')
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_url(request, video_id):
    try:
        # Get video from database
        video = Video.objects.get(id=video_id)

        # Check if user has access
        if not video.user_has_access(request.user):
            return Response({'error': 'Access denied'}, status=403)

        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.S3_BUCKET,
                'Key': video.s3_key,
            },
            ExpiresIn=3600  # 1 hour
        )

        return Response({
            'url': presigned_url,
            'expires_in': 3600,
            'video_id': str(video.id),
            'title': video.title,
        })
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
```

### Frontend Integration

```typescript
// frontend/src/services/videoService.ts
export async function getVideoUrl(videoId: string): Promise<string> {
	const response = await fetch(`/api/videos/${videoId}/url`, {
		headers: {
			Authorization: `Bearer ${getAuthToken()}`,
		},
	})

	if (!response.ok) {
		throw new Error("Failed to get video URL")
	}

	const data = await response.json()
	return data.url
}

// Usage with Wontum Player
import { WontumPlayer } from "@obipascal/player"

async function loadVideo(videoId: string) {
	const videoUrl = await getVideoUrl(videoId)

	const player = new WontumPlayer({
		src: videoUrl,
		container: "#player",
	})
}
```

---

## Analytics Backend

### Node.js/Express Analytics Endpoint

```javascript
// backend/routes/analytics.js
const express = require("express")
const router = express.Router()

// Store analytics event
router.post("/analytics/events", async (req, res) => {
	try {
		const event = req.body

		// Validate event
		if (!event.eventType || !event.sessionId) {
			return res.status(400).json({ error: "Invalid event data" })
		}

		// Store in database
		await storeAnalyticsEvent({
			eventType: event.eventType,
			sessionId: event.sessionId,
			videoId: event.videoId,
			userId: event.userId,
			timestamp: new Date(event.timestamp),
			data: event.data,
		})

		// Process QoE metrics
		if (event.data.bufferingRatio !== undefined) {
			await updateQoEMetrics(event.videoId, event.data)
		}

		res.json({ success: true })
	} catch (error) {
		console.error("Error storing analytics event:", error)
		res.status(500).json({ error: "Failed to store event" })
	}
})

// Get video analytics
router.get("/analytics/videos/:videoId", async (req, res) => {
	try {
		const { videoId } = req.params

		const analytics = await getVideoAnalytics(videoId)

		res.json(analytics)
	} catch (error) {
		console.error("Error fetching analytics:", error)
		res.status(500).json({ error: "Failed to fetch analytics" })
	}
})

module.exports = router
```

### Database Schema (PostgreSQL)

```sql
-- Analytics events table
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  video_id VARCHAR(100),
  user_id VARCHAR(100),
  timestamp TIMESTAMP NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_video_id ON analytics_events(video_id);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);

-- Video QoE metrics table
CREATE TABLE video_qoe_metrics (
  id SERIAL PRIMARY KEY,
  video_id VARCHAR(100) UNIQUE NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_play_time BIGINT DEFAULT 0,
  total_buffer_time BIGINT DEFAULT 0,
  avg_buffering_ratio DECIMAL(5, 4),
  avg_rebuffer_count DECIMAL(5, 2),
  completion_rate DECIMAL(5, 4),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Video Upload Pipeline

### HLS Transcoding with FFmpeg

```javascript
// backend/services/videoTranscoder.js
const ffmpeg = require("fluent-ffmpeg")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const fs = require("fs")
const path = require("path")

async function transcodeToHLS(inputPath, outputDir, s3Key) {
	return new Promise((resolve, reject) => {
		// Create output directory
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}

		// Transcode to HLS with multiple quality levels
		ffmpeg(inputPath)
			// 1080p
			.outputOptions([
				"-vf",
				"scale=1920:1080",
				"-c:v",
				"libx264",
				"-b:v",
				"5000k",
				"-c:a",
				"aac",
				"-b:a",
				"128k",
				"-f",
				"hls",
				"-hls_time",
				"6",
				"-hls_list_size",
				"0",
				"-hls_segment_filename",
				path.join(outputDir, "1080p_%03d.ts"),
			])
			.output(path.join(outputDir, "1080p.m3u8"))

			// 720p
			.outputOptions([
				"-vf",
				"scale=1280:720",
				"-c:v",
				"libx264",
				"-b:v",
				"3000k",
				"-c:a",
				"aac",
				"-b:a",
				"128k",
				"-f",
				"hls",
				"-hls_time",
				"6",
				"-hls_list_size",
				"0",
				"-hls_segment_filename",
				path.join(outputDir, "720p_%03d.ts"),
			])
			.output(path.join(outputDir, "720p.m3u8"))

			// 480p
			.outputOptions([
				"-vf",
				"scale=854:480",
				"-c:v",
				"libx264",
				"-b:v",
				"1500k",
				"-c:a",
				"aac",
				"-b:a",
				"128k",
				"-f",
				"hls",
				"-hls_time",
				"6",
				"-hls_list_size",
				"0",
				"-hls_segment_filename",
				path.join(outputDir, "480p_%03d.ts"),
			])
			.output(path.join(outputDir, "480p.m3u8"))

			.on("end", async () => {
				// Create master playlist
				await createMasterPlaylist(outputDir)

				// Upload to S3
				await uploadToS3(outputDir, s3Key)

				resolve()
			})
			.on("error", (err) => {
				reject(err)
			})
			.run()
	})
}

async function createMasterPlaylist(outputDir) {
	const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
720p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480
480p.m3u8
`

	fs.writeFileSync(path.join(outputDir, "playlist.m3u8"), masterPlaylist)
}

async function uploadToS3(localDir, s3Key) {
	const s3Client = new S3Client({ region: process.env.AWS_REGION })
	const files = fs.readdirSync(localDir)

	for (const file of files) {
		const filePath = path.join(localDir, file)
		const fileContent = fs.readFileSync(filePath)

		await s3Client.send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: `${s3Key}/${file}`,
				Body: fileContent,
				ContentType: getContentType(file),
			}),
		)
	}
}

function getContentType(filename) {
	if (filename.endsWith(".m3u8")) return "application/x-mpegURL"
	if (filename.endsWith(".ts")) return "video/MP2T"
	return "application/octet-stream"
}

module.exports = { transcodeToHLS }
```

---

## Authentication & Authorization

### JWT-based Authentication

```javascript
// backend/middleware/auth.js
const jwt = require("jsonwebtoken")

function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"]
	const token = authHeader && authHeader.split(" ")[1]

	if (!token) {
		return res.status(401).json({ error: "Authentication required" })
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ error: "Invalid token" })
		}

		req.user = user
		next()
	})
}

module.exports = { authenticateToken }
```

### Usage

```javascript
const { authenticateToken } = require("./middleware/auth")

app.use("/api/videos", authenticateToken, videoRoutes)
app.use("/api/analytics", analyticsRoutes) // Public for analytics
```

---

## Complete Integration Example

### Frontend

```typescript
import { WontumPlayerReact } from "@obipascal/player"
import { useEffect, useState } from "react"

function VideoPlayer({ videoId, userId }: { videoId: string; userId: string }) {
	const [videoUrl, setVideoUrl] = useState<string>("")

	useEffect(() => {
		async function loadVideo() {
			const response = await fetch(`/api/videos/${videoId}/url`, {
				headers: {
					Authorization: `Bearer ${getAuthToken()}`,
				},
			})

			const data = await response.json()
			setVideoUrl(data.url)
		}

		loadVideo()
	}, [videoId])

	if (!videoUrl) return <div>Loading...</div>

	return (
		<WontumPlayerReact
			src={videoUrl}
			width="100%"
			height="500px"
			analytics={{
				enabled: true,
				endpoint: "/api/analytics/events",
				videoId,
				userId,
			}}
		/>
	)
}
```

This guide provides a complete backend integration solution for production use with Wontum Player!
