/**
 * Custom Design Examples for Wontum Player
 *
 * Demonstrates various theme customizations
 */

import { WontumPlayer } from "../src/index"

/**
 * Example 1: Netflix-style Dark Theme
 */
export function netflixTheme() {
	return new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
		theme: {
			primaryColor: "#e50914", // Netflix red
			accentColor: "#b20710",
			fontFamily: "Netflix Sans, Helvetica, Arial, sans-serif",
			controlsBackground: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
			buttonHoverBg: "rgba(229, 9, 20, 0.2)",
			progressHeight: "4px",
			borderRadius: "2px",
		},
	})
}

/**
 * Example 2: YouTube-style Theme
 */
export function youtubeTheme() {
	return new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
		theme: {
			primaryColor: "#ff0000", // YouTube red
			accentColor: "#cc0000",
			fontFamily: "Roboto, Arial, sans-serif",
			controlsBackground: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
			buttonHoverBg: "rgba(255, 0, 0, 0.15)",
			progressHeight: "5px",
			borderRadius: "0px",
		},
	})
}

/**
 * Example 3: Modern Purple/Pink Theme
 */
export function modernTheme() {
	return new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
		theme: {
			primaryColor: "#a855f7", // Purple
			accentColor: "#ec4899", // Pink
			fontFamily: "Inter, system-ui, sans-serif",
			controlsBackground: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
			buttonHoverBg: "rgba(168, 85, 247, 0.3)",
			progressHeight: "8px",
			borderRadius: "8px",
		},
	})
}

/**
 * Example 4: Minimal Green Theme
 */
export function minimalGreenTheme() {
	return new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
		theme: {
			primaryColor: "#10b981", // Green
			accentColor: "#059669",
			fontFamily: "SF Pro Display, -apple-system, sans-serif",
			controlsBackground: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
			buttonHoverBg: "rgba(16, 185, 129, 0.2)",
			progressHeight: "3px",
			borderRadius: "12px",
		},
	})
}

/**
 * Example 5: Bold Cyberpunk Theme
 */
export function cyberpunkTheme() {
	return new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
		theme: {
			primaryColor: "#00ffff", // Cyan
			accentColor: "#ff00ff", // Magenta
			fontFamily: "Orbitron, monospace",
			controlsBackground: "linear-gradient(to top, rgba(0, 255, 255, 0.1), transparent)",
			buttonHoverBg: "rgba(0, 255, 255, 0.3)",
			progressHeight: "6px",
			borderRadius: "0px",
		},
	})
}

/**
 * Example 6: Soft Pastel Theme
 */
export function pastelTheme() {
	return new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
		theme: {
			primaryColor: "#fbbf24", // Amber
			accentColor: "#f59e0b",
			fontFamily: "Poppins, sans-serif",
			controlsBackground: "linear-gradient(to top, rgba(251, 191, 36, 0.15), transparent)",
			buttonHoverBg: "rgba(251, 191, 36, 0.2)",
			progressHeight: "7px",
			borderRadius: "20px",
		},
	})
}

/**
 * Example 7: Education Platform Theme
 */
export function educationTheme() {
	return new WontumPlayer({
		src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		container: "#player",
		theme: {
			primaryColor: "#3b82f6", // Blue (default)
			accentColor: "#2563eb",
			fontFamily: "Open Sans, sans-serif",
			controlsBackground: "linear-gradient(to top, rgba(59, 130, 246, 0.1), transparent)",
			buttonHoverBg: "rgba(59, 130, 246, 0.2)",
			progressHeight: "6px",
			borderRadius: "6px",
		},
	})
}

/**
 * React Example with Custom Theme
 */
export const ReactCustomThemeExample = `
import React from 'react';
import { WontumPlayerReact } from '@obipascal/player';

function CustomStyledPlayer() {
  return (
    <WontumPlayerReact
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      theme={{
        primaryColor: '#ff6b6b',        // Coral red
        accentColor: '#ee5a6f',
        fontFamily: 'Helvetica, Arial, sans-serif',
        controlsBackground: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
        buttonHoverBg: 'rgba(255, 107, 107, 0.25)',
        progressHeight: '5px',
        borderRadius: '8px'
      }}
    />
  );
}
`

/**
 * All Available Theme Options
 */
export const ThemeOptions = {
	/**
	 * Primary color for progress bar, sliders, etc.
	 * Default: '#3b82f6' (blue)
	 */
	primaryColor: "#3b82f6",

	/**
	 * Accent color for hover states
	 * Default: '#2563eb' (darker blue)
	 */
	accentColor: "#2563eb",

	/**
	 * Font family for all text
	 * Default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
	 */
	fontFamily: "Inter, sans-serif",

	/**
	 * Background for controls overlay
	 * Can be solid color or gradient
	 * Default: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
	 */
	controlsBackground: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",

	/**
	 * Button hover background color
	 * Default: 'rgba(255, 255, 255, 0.1)'
	 */
	buttonHoverBg: "rgba(255, 255, 255, 0.1)",

	/**
	 * Height of progress bar
	 * Default: '6px'
	 */
	progressHeight: "6px",

	/**
	 * Border radius for buttons and progress bar
	 * Default: '4px'
	 */
	borderRadius: "4px",
}

/**
 * Brand Color Presets
 */
export const BrandPresets = {
	netflix: { primary: "#e50914", accent: "#b20710" },
	youtube: { primary: "#ff0000", accent: "#cc0000" },
	vimeo: { primary: "#1ab7ea", accent: "#0e8fc5" },
	spotify: { primary: "#1db954", accent: "#1ed760" },
	twitch: { primary: "#9146ff", accent: "#772ce8" },
	disney: { primary: "#0063e5", accent: "#0483ee" },
	hulu: { primary: "#1ce783", accent: "#00ed82" },
	amazon: { primary: "#00a8e1", accent: "#0089ba" },
	apple: { primary: "#fa2d48", accent: "#e02042" },
	hbo: { primary: "#6d3f95", accent: "#5a2f7e" },
}

/**
 * Quick Setup Helper
 */
export function createThemedPlayer(containerId: string, streamUrl: string, brandName: keyof typeof BrandPresets) {
	const colors = BrandPresets[brandName]

	return new WontumPlayer({
		src: streamUrl,
		container: containerId,
		theme: {
			primaryColor: colors.primary,
			accentColor: colors.accent,
		},
	})
}

// Usage:
// createThemedPlayer('#player', 'video.m3u8', 'netflix')
