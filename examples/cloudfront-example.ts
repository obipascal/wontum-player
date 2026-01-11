/**
 * CloudFront Signed Cookies Example
 *
 * This example shows how to use Wontum Player with CloudFront signed cookies
 * for secure video streaming.
 */

import { WontumPlayer } from "../src/index"

/**
 * Example 1: Basic CloudFront Setup
 */
export function basicCloudFrontExample() {
	// Function to sign URL via backend endpoint
	async function signUrl(url: string): Promise<string> {
		const response = await fetch("/api/cloudfront/sign", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getAuthToken()}`, // Your auth token
			},
			body: JSON.stringify({ url }),
			credentials: "include", // IMPORTANT: Include cookies
		})

		if (!response.ok) {
			throw new Error("Failed to sign CloudFront URL")
		}

		const data = await response.json()
		// Backend sets signed cookies and returns the URL
		return data.url
	}

	const player = new WontumPlayer({
		src: "https://media.domain.com/path/to/stream/video/index.m3u8",
		container: "#player",
		s3Config: {
			signUrl,
			cloudFrontDomains: ["media.domain.com"],
		},
	})

	return player
}

/**
 * Example 2: With Error Handling and Retry
 */
export function cloudFrontWithRetryExample() {
	async function signUrl(url: string): Promise<string> {
		const maxRetries = 3
		let lastError: Error | null = null

		for (let i = 0; i < maxRetries; i++) {
			try {
				const response = await fetch("/api/cloudfront/sign", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${getAuthToken()}`,
					},
					body: JSON.stringify({ url }),
					credentials: "include",
				})

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`)
				}

				const data = await response.json()
				console.log("✅ CloudFront URL signed successfully")
				return data.url
			} catch (error) {
				lastError = error as Error
				console.warn(`Retry ${i + 1}/${maxRetries} failed:`, error)
				// Wait before retry (exponential backoff)
				await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
			}
		}

		throw new Error(`Failed to sign URL after ${maxRetries} attempts: ${lastError?.message}`)
	}

	const player = new WontumPlayer({
		src: "https://media.domain.com/videos/course-1/lesson-1/index.m3u8",
		container: "#player",
		s3Config: {
			signUrl,
			cloudFrontDomains: ["media.domain.com"],
		},
		analytics: {
			enabled: true,
			endpoint: "/api/analytics",
		},
	})

	return player
}

/**
 * Example 3: React Component with CloudFront
 *
 * Note: This is a code example as a string. For actual React usage,
 * copy this to a .tsx file in your project.
 */
export const ReactCloudFrontPlayerExample = `
import React from "react"
import { WontumPlayerReact } from "@wontum/player"

export function CloudFrontPlayer({ videoUrl, userId }: { videoUrl: string; userId: string }) {
	// Sign URL function
	async function signUrl(url: string): Promise<string> {
		const response = await fetch("/api/cloudfront/sign", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url, userId }),
			credentials: "include",
		})

		const data = await response.json()
		return data.url
	}

	return (
		<WontumPlayerReact
			src={videoUrl}
			width="100%"
			height="500px"
			s3Config={{
				signUrl,
				cloudFrontDomains: ["media.domain.com", "cdn.domain.com"], // Multiple domains
			}}
			analytics={{
				enabled: true,
				userId,
				videoId: videoUrl,
			}}
			onError={(error) => {
				console.error("Player error:", error)
				// Handle signing errors
				if (error?.message?.includes("sign")) {
					alert("Failed to authenticate video. Please refresh and try again.")
				}
			}}
		/>
	)
}
`

/**
 * Example 4: Backend Implementation (Node.js/Express)
 */
export const backendExample = `
// backend/routes/cloudfront.js
const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

// Initialize CloudFront signer
const cloudFront = new AWS.CloudFront.Signer(
  process.env.CLOUDFRONT_KEY_PAIR_ID,
  process.env.CLOUDFRONT_PRIVATE_KEY
);

// Middleware to verify user authentication
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Middleware to verify user has access to video
async function verifyVideoAccess(req, res, next) {
  const { url } = req.body;
  const userId = req.user.id;
  
  // Extract video ID from URL
  const videoId = extractVideoIdFromUrl(url);
  
  // Check database if user has access
  const hasAccess = await checkUserVideoAccess(userId, videoId);
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied to this video' });
  }
  
  next();
}

// Sign CloudFront URL endpoint
router.post('/cloudfront/sign', requireAuth, verifyVideoAccess, (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Parse URL to get domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Create signed cookies
    const policy = JSON.stringify({
      Statement: [{
        Resource: \`https://\${domain}/*\`,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': Math.floor(Date.now() / 1000) + 3600 // 1 hour
          }
        }
      }]
    });
    
    const signedCookies = cloudFront.getSignedCookie({
      policy
    });
    
    // Set signed cookies
    const cookieOptions = {
      domain: domain,
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 3600000 // 1 hour
    };
    
    res.cookie('CloudFront-Policy', signedCookies['CloudFront-Policy'], cookieOptions);
    res.cookie('CloudFront-Signature', signedCookies['CloudFront-Signature'], cookieOptions);
    res.cookie('CloudFront-Key-Pair-Id', signedCookies['CloudFront-Key-Pair-Id'], cookieOptions);
    
    // Return the original URL
    // The cookies will authenticate subsequent requests
    res.json({ url });
    
  } catch (error) {
    console.error('Error signing CloudFront URL:', error);
    res.status(500).json({ error: 'Failed to sign URL' });
  }
});

module.exports = router;
`

/**
 * Example 5: Python/Django Backend
 */
export const pythonBackendExample = `
# backend/videos/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import base64

@csrf_exempt
@login_required
def sign_cloudfront_url(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        url = data.get('url')
        
        if not url:
            return JsonResponse({'error': 'URL is required'}, status=400)
        
        # Verify user has access to video
        video_id = extract_video_id_from_url(url)
        if not user_has_video_access(request.user, video_id):
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        # Create CloudFront signed cookies
        expiration = datetime.utcnow() + timedelta(hours=1)
        
        policy = {
            "Statement": [{
                "Resource": f"https://media.domain.com/*",
                "Condition": {
                    "DateLessThan": {
                        "AWS:EpochTime": int(expiration.timestamp())
                    }
                }
            }]
        }
        
        # Sign the policy
        signed_cookies = create_signed_cookies(policy)
        
        # Set cookies
        response = JsonResponse({'url': url})
        response.set_cookie(
            'CloudFront-Policy',
            signed_cookies['CloudFront-Policy'],
            domain='media.domain.com',
            secure=True,
            httponly=True,
            samesite='None',
            max_age=3600
        )
        response.set_cookie(
            'CloudFront-Signature',
            signed_cookies['CloudFront-Signature'],
            domain='media.domain.com',
            secure=True,
            httponly=True,
            samesite='None',
            max_age=3600
        )
        response.set_cookie(
            'CloudFront-Key-Pair-Id',
            signed_cookies['CloudFront-Key-Pair-Id'],
            domain='media.domain.com',
            secure=True,
            httponly=True,
            samesite='None',
            max_age=3600
        )
        
        return response
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
`

// Helper function (client-side)
function getAuthToken(): string {
	// Get from localStorage, cookie, or your auth system
	return localStorage.getItem("authToken") || ""
}
