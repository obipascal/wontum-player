import { WontumPlayer } from "./player"

/**
 * UI Controller - Manages player controls and interface
 */
export class UIController {
	private container: HTMLElement
	private player: WontumPlayer
	private controlsContainer: HTMLElement
	private progressContainer!: HTMLElement
	private progressBar: HTMLElement
	private playButton: HTMLElement
	private skipBackwardButton: HTMLElement
	private skipForwardButton: HTMLElement
	private volumeButton: HTMLElement
	private volumeContainer: HTMLElement
	private fullscreenButton: HTMLElement
	private pipButton: HTMLElement
	private settingsButton: HTMLElement
	// private timeDisplay: HTMLElement
	private volumeSlider: HTMLInputElement
	private progressInput: HTMLInputElement
	// private controlsVisible = true
	private hideControlsTimeout: number | null = null
	private stickyControls = false
	private isVolumeSliderActive = false

	constructor(container: HTMLElement, player: WontumPlayer) {
		this.container = container
		this.player = player

		this.injectStyles()

		// Create progress bar separately
		this.createProgressBar()

		this.controlsContainer = this.createControls()
		this.container.appendChild(this.controlsContainer)

		this.playButton = this.controlsContainer.querySelector(".wontum-play-btn")!
		this.skipBackwardButton = this.controlsContainer.querySelector(".wontum-skip-backward-btn")!
		this.skipForwardButton = this.controlsContainer.querySelector(".wontum-skip-forward-btn")!
		this.volumeButton = this.controlsContainer.querySelector(".wontum-volume-btn")!
		this.volumeContainer = this.controlsContainer.querySelector(".wontum-volume-container")!
		this.fullscreenButton = this.controlsContainer.querySelector(".wontum-fullscreen-btn")!
		this.pipButton = this.controlsContainer.querySelector(".wontum-pip-btn")!
		this.settingsButton = this.controlsContainer.querySelector(".wontum-settings-btn")!
		// this.timeDisplay = this.controlsContainer.querySelector(".wontum-time-display")!
		this.volumeSlider = this.controlsContainer.querySelector(".wontum-volume-slider")! as HTMLInputElement
		this.progressInput = this.container.querySelector(".wontum-progress-input")! as HTMLInputElement
		this.progressBar = this.container.querySelector(".wontum-progress-filled")!

		// Check for sticky controls config
		this.stickyControls = this.player["config"].stickyControls || false
		if (this.stickyControls) {
			this.controlsContainer.classList.add("sticky")
		}

		this.setupEventListeners()
		this.setupPlayerEventListeners()
	}

	private injectStyles(): void {
		const styleId = "wontum-player-styles"
		if (document.getElementById(styleId)) return

		const theme = this.player["config"].theme || {}
		const primaryColor = theme.primaryColor || "#3b82f6"
		const accentColor = theme.accentColor || "#2563eb"
		const fontFamily = theme.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
		const controlsBackground = theme.controlsBackground || "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
		const buttonHoverBg = theme.buttonHoverBg || "rgba(255, 255, 255, 0.1)"
		const progressHeight = theme.progressHeight || "6px"
		const borderRadius = theme.borderRadius || "4px"

		const style = document.createElement("style")
		style.id = styleId
		style.textContent = `
      .wontum-player-container {
        position: relative;
        background: #000;
        font-family: ${fontFamily};
        overflow: hidden;
        --primary-color: ${primaryColor};
        --accent-color: ${accentColor};
        --controls-bg: ${controlsBackground};
        --button-hover: ${buttonHoverBg};
        --progress-height: ${progressHeight};
        --border-radius: ${borderRadius};
      }
      
      .wontum-player-video {
        display: block;
        width: 100%;
        height: 100%;
      }
      
      .wontum-controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, transparent 100%);
        padding: 15px 20px 12px;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 10;
      }
      
      .wontum-controls.hidden {
        opacity: 0;
        transform: translateY(100%);
        pointer-events: none;
      }
      
      .wontum-center-controls {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 120px;
        z-index: 15;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .wontum-player-container:hover .wontum-center-controls {
        opacity: 1;
      }
      
      .wontum-center-btn {
        background: rgba(0, 0, 0, 0.75);
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      
      .wontum-center-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.08);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
      }
      
      .wontum-center-btn:active {
        transform: scale(0.95);
      }
      
      .wontum-center-btn.play {
        width: 80px;
        height: 80px;
      }
      
      .wontum-center-btn.play svg {
        width: 40px;
        height: 40px;
      }
      
      .wontum-center-btn.skip {
        width: 70px;
        height: 70px;
      }
      
      .wontum-center-btn.skip svg {
        width: 70px;
        height: 70px;
      }
      
      .wontum-progress-container {
        position: absolute;
        bottom: 58px;
        left: 50%;
        transform: translateX(-50%);
        width: 70%;
        max-width: 600px;
        height: 5px;
        cursor: pointer;
        z-index: 12;
        padding: 0;
        transition: height 0.2s ease, opacity 0.3s ease, transform 0.3s ease;
      }
      
      .wontum-progress-container.hidden {
        opacity: 0;
        transform: translateX(-50%) translateY(100%);
        pointer-events: none;
      }
      
      .wontum-progress-container:hover {
        height: 7px;
      }
      
      .wontum-progress-track {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.25);
        border-radius: 3px;
      }
      
      .wontum-progress-filled {
        position: absolute;
        height: 100%;
        background: var(--primary-color);
        border-radius: 3px;
        width: 0%;
        transition: width 0.1s linear;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      }
      
      .wontum-progress-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        margin: 0;
      }
      
      .wontum-controls-row {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        height: 36px;
      }
      
      .wontum-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
        opacity: 0.9;
      }
      
      .wontum-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        opacity: 1;
        transform: scale(1.05);
      }
      
      .wontum-btn:active {
        transform: scale(0.95);
      }
      
      .wontum-btn svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      
      .wontum-time-display {
        font-size: 13px;
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        min-width: 100px;
        opacity: 0.95;
        letter-spacing: 0.3px;
      }
      
      .wontum-volume-container {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0;
      }
      
      .wontum-volume-slider-wrapper {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(20, 20, 20, 0.95);
        backdrop-filter: blur(10px);
        padding: 12px 8px;
        border-radius: 6px;
        margin-bottom: 5px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 20;
      }
      
      .wontum-volume-container:hover .wontum-volume-slider-wrapper,
      .wontum-volume-slider-wrapper:hover {
        opacity: 1;
        pointer-events: all;
      }
      
      /* Add a bridge area between button and slider to prevent gap */
      .wontum-volume-container::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        height: 10px;
        background: transparent;
      }
      
      .wontum-volume-slider {
        -webkit-appearance: slider-vertical;
        appearance: slider-vertical;
        width: 4px;
        height: 80px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        outline: none;
        writing-mode: bt-lr;
        cursor: pointer;
      }
      
      .wontum-volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
      }
      
      .wontum-volume-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }
      
      .wontum-spacer {
        flex: 1;
      }
      
      .wontum-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 5;
      }
      
      .wontum-spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: wontum-spin 1s linear infinite;
      }
      
      @keyframes wontum-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .wontum-quality-menu {
        padding: 6px 0;
      }
      
      .wontum-quality-option {
        padding: 10px 16px;
        cursor: pointer;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        transition: all 0.15s ease;
      }
      
      .wontum-quality-option:hover {
        background: rgba(255, 255, 255, 0.12);
        color: white;
      }
      
      .wontum-quality-option.active {
        color: var(--primary-color);
        background: rgba(255, 255, 255, 0.05);
      }
      
      .wontum-speed-menu {
        padding: 6px 0;
      }
      
      .wontum-speed-option {
        padding: 10px 16px;
        cursor: pointer;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        transition: all 0.15s ease;
      }
      
      .wontum-speed-option:hover {
        background: rgba(255, 255, 255, 0.12);
        color: white;
      }
      
      .wontum-speed-option.active {
        color: var(--primary-color);
        background: rgba(255, 255, 255, 0.05);
      }
      
      .wontum-settings-panel {
        position: absolute;
        bottom: 100%;
        right: 0;
        background: rgba(20, 20, 20, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        margin-bottom: 8px;
        min-width: 320px;
        display: none;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        overflow: hidden;
      }
      
      .wontum-settings-panel.active {
        display: flex;
        flex-direction: column;
      }
      
      .wontum-settings-tabs {
        display: flex;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .wontum-tab {
        flex: 1;
        padding: 10px 12px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 2px solid transparent;
        font-family: inherit;
      }
      
      .wontum-tab:hover {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
      }
      
      .wontum-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        background: rgba(59, 130, 246, 0.1);
      }
      
      .wontum-settings-content {
        min-height: 120px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .wontum-tab-panel {
        display: none;
      }
      
      .wontum-tab-panel.active {
        display: block;
      }
      
      .wontum-settings-menu {
        padding: 6px 0;
      }
      
      .wontum-settings-option {
        padding: 12px 16px;
        cursor: pointer;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.15s ease;
      }
      
      .wontum-settings-option:hover {
        background: rgba(255, 255, 255, 0.12);
        color: white;
      }
      
      .wontum-toggle-switch {
        width: 40px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        position: relative;
        transition: background 0.3s;
      }
      
      .wontum-toggle-switch.active {
        background: var(--primary-color);
      }
      
      .wontum-toggle-switch::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: left 0.3s;
      }
      
      .wontum-toggle-switch.active::after {
        left: 22px;
      }
      
      .wontum-subtitle-menu {
        padding: 6px 0;
      }
      
      .wontum-subtitle-option {
        padding: 10px 16px;
        cursor: pointer;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        transition: all 0.15s ease;
      }
      
      .wontum-subtitle-option:hover {
        background: rgba(255, 255, 255, 0.12);
        color: white;
      }
      
      .wontum-subtitle-option.active {
        color: var(--primary-color);
        background: rgba(255, 255, 255, 0.05);
      }
      
      .wontum-controls.sticky {
        opacity: 1 !important;
        transform: translateY(0) !important;
        pointer-events: all !important;
      }
      
      .wontum-progress-container.sticky {
        opacity: 1 !important;
        transform: translateY(0) !important;
        pointer-events: all !important;
      }
    `

		document.head.appendChild(style)
		this.container.classList.add("wontum-player-container")
	}

	private createProgressBar(): void {
		const progressContainer = document.createElement("div")
		progressContainer.className = "wontum-progress-container"
		progressContainer.innerHTML = `
      <div class="wontum-progress-track"></div>
      <div class="wontum-progress-filled"></div>
      <input type="range" class="wontum-progress-input" min="0" max="100" value="0" step="0.1">
    `
		this.container.appendChild(progressContainer)
		this.progressContainer = progressContainer
	}

	private createControls(): HTMLElement {
		const controls = document.createElement("div")
		controls.className = "wontum-controls"
		controls.innerHTML = `
      <div class="wontum-center-controls">
        <button class="wontum-center-btn skip wontum-skip-backward-btn" aria-label="Skip backward 10s">
          ${this.getSkipBackwardIcon()}
        </button>
        
        <button class="wontum-center-btn play wontum-play-btn" aria-label="Play">
          ${this.getPlayIcon()}
        </button>
        
        <button class="wontum-center-btn skip wontum-skip-forward-btn" aria-label="Skip forward 10s">
          ${this.getSkipForwardIcon()}
        </button>
      </div>
      
      <div class="wontum-controls-row">
        
        <div class="wontum-volume-container">
          <button class="wontum-btn wontum-volume-btn" aria-label="Mute">
            ${this.getVolumeIcon()}
          </button>
          <div class="wontum-volume-slider-wrapper">
            <input type="range" class="wontum-volume-slider" min="0" max="100" value="100" step="1" orient="vertical">
          </div>
        </div>
        
        <div class="wontum-time-display">
          <span class="wontum-current-time">0:00</span> / <span class="wontum-duration">0:00</span>
        </div>
        
        <div class="wontum-spacer"></div>
        
        <div class="wontum-settings-container" style="position: relative;">
          <button class="wontum-btn wontum-settings-btn" aria-label="Settings">
            ${this.getSettingsIcon()}
          </button>
          <div class="wontum-settings-panel">
            <div class="wontum-settings-tabs">
              <button class="wontum-tab active" data-tab="general">General</button>
              <button class="wontum-tab" data-tab="quality">Quality</button>
              <button class="wontum-tab" data-tab="speed">Speed</button>
              <button class="wontum-tab" data-tab="subtitles">Subtitles</button>
            </div>
            <div class="wontum-settings-content">
              <div class="wontum-tab-panel active" data-panel="general">
                <div class="wontum-settings-menu"></div>
              </div>
              <div class="wontum-tab-panel" data-panel="quality">
                <div class="wontum-quality-menu"></div>
              </div>
              <div class="wontum-tab-panel" data-panel="speed">
                <div class="wontum-speed-menu"></div>
              </div>
              <div class="wontum-tab-panel" data-panel="subtitles">
                <div class="wontum-subtitle-menu"></div>
              </div>
            </div>
          </div>
        </div>
        
        <button class="wontum-btn wontum-pip-btn" aria-label="Picture-in-Picture">
          ${this.getPipIcon()}
        </button>
        
        <button class="wontum-btn wontum-fullscreen-btn" aria-label="Fullscreen">
          ${this.getFullscreenIcon()}
        </button>
      </div>
      
      <div class="wontum-loading" style="display: none;">
        <div class="wontum-spinner"></div>
      </div>
    `

		return controls
	}

	private setupEventListeners(): void {
		// Play/Pause
		this.playButton.addEventListener("click", () => {
			const state = this.player.getState()
			if (state.playing) {
				this.player.pause()
			} else {
				this.player.play()
			}
		})

		// Skip backward
		this.skipBackwardButton.addEventListener("click", () => {
			this.player.skipBackward(10)
		})

		// Skip forward
		this.skipForwardButton.addEventListener("click", () => {
			this.player.skipForward(10)
		})

		// Progress bar
		this.progressInput.addEventListener("input", (e) => {
			const target = e.target as HTMLInputElement
			const percent = parseFloat(target.value)
			const state = this.player.getState()
			const time = (percent / 100) * state.duration
			this.player.seek(time)
		})

		// Volume
		this.volumeSlider.addEventListener("input", (e) => {
			const target = e.target as HTMLInputElement
			const volume = parseFloat(target.value) / 100
			this.player.setVolume(volume)
		})

		this.volumeButton.addEventListener("click", () => {
			const state = this.player.getState()
			if (state.muted) {
				this.player.unmute()
			} else {
				this.player.mute()
			}
		})

		// Keep volume slider visible while hovering/using it
		this.volumeContainer.addEventListener("mouseenter", () => {
			this.isVolumeSliderActive = true
		})

		this.volumeContainer.addEventListener("mouseleave", () => {
			this.isVolumeSliderActive = false
		})

		// Prevent hiding controls while adjusting volume
		this.volumeSlider.addEventListener("input", () => {
			this.isVolumeSliderActive = true
			this.resetHideControlsTimeout()
		})

		this.volumeSlider.addEventListener("change", () => {
			setTimeout(() => {
				this.isVolumeSliderActive = false
			}, 500)
		})

		// Fullscreen
		this.fullscreenButton.addEventListener("click", () => {
			const state = this.player.getState()
			if (state.fullscreen) {
				this.player.exitFullscreen()
			} else {
				this.player.enterFullscreen()
			}
		})

		// Picture-in-Picture
		this.pipButton.addEventListener("click", async () => {
			try {
				await this.player.togglePictureInPicture()
			} catch (error) {
				console.error("PiP error:", error)
			}
		})

		// Settings panel with tabs
		this.settingsButton.addEventListener("click", () => {
			const panel = this.controlsContainer.querySelector(".wontum-settings-panel")!
			panel.classList.toggle("active")
			// Update all menus when opening
			if (panel.classList.contains("active")) {
				this.updateSettingsMenu()
				this.updateQualityMenu()
				this.updateSpeedMenu()
				this.updateSubtitleMenu()
			}
		})

		// Tab switching
		const tabs = this.controlsContainer.querySelectorAll(".wontum-tab")
		tabs.forEach((tab) => {
			tab.addEventListener("click", (e) => {
				const target = e.currentTarget as HTMLElement
				const tabName = target.getAttribute("data-tab")!

				// Update active tab
				tabs.forEach((t) => t.classList.remove("active"))
				target.classList.add("active")

				// Update active panel
				const panels = this.controlsContainer.querySelectorAll(".wontum-tab-panel")
				panels.forEach((p) => p.classList.remove("active"))
				const activePanel = this.controlsContainer.querySelector(`[data-panel="${tabName}"]`)
				activePanel?.classList.add("active")
			})
		})

		// Click on video to play/pause
		const videoElement = this.player.getVideoElement()
		videoElement.addEventListener("click", () => {
			const state = this.player.getState()
			if (state.playing) {
				this.player.pause()
			} else {
				this.player.play()
			}
		})

		// Auto-hide controls
		this.container.addEventListener("mousemove", () => {
			this.showControls()
			this.resetHideControlsTimeout()
		})

		this.container.addEventListener("mouseleave", () => {
			this.hideControls()
		})
	}

	private setupPlayerEventListeners(): void {
		this.player.on("play", () => {
			this.playButton.innerHTML = this.getPauseIcon()
		})

		this.player.on("pause", () => {
			this.playButton.innerHTML = this.getPlayIcon()
		})

		this.player.on("timeupdate", (event) => {
			const { currentTime } = event.data
			const state = this.player.getState()

			if (state.duration > 0) {
				const percent = (currentTime / state.duration) * 100
				this.progressBar.style.width = `${percent}%`
				this.progressInput.value = percent.toString()
			}

			const currentEl = this.controlsContainer.querySelector(".wontum-current-time")!
			currentEl.textContent = this.formatTime(currentTime)
		})

		this.player.on("loadedmetadata", (event) => {
			const { duration } = event.data
			const durationEl = this.controlsContainer.querySelector(".wontum-duration")!
			durationEl.textContent = this.formatTime(duration)

			// Update quality menu
			if (event.data.qualities) {
				this.updateQualityMenu(event.data.qualities)
			}
		})

		this.player.on("volumechange", (event) => {
			const { volume, muted } = event.data
			this.volumeSlider.value = (volume * 100).toString()
			this.volumeButton.innerHTML = muted ? this.getMutedIcon() : this.getVolumeIcon()
		})

		this.player.on("waiting", () => {
			const loading = this.controlsContainer.querySelector(".wontum-loading") as HTMLElement
			loading.style.display = "block"
		})

		this.player.on("canplay", () => {
			const loading = this.controlsContainer.querySelector(".wontum-loading") as HTMLElement
			loading.style.display = "none"
		})
	}

	private updateSubtitleMenu(): void {
		const menu = this.controlsContainer.querySelector(".wontum-subtitle-menu")!
		const tracks = this.player.getSubtitleTracks()

		if (tracks.length === 0) {
			menu.innerHTML = `<div class="wontum-subtitle-option">No subtitles available</div>`
			return
		}

		const activeTrack = tracks.findIndex((track) => track.mode === "showing")

		menu.innerHTML = `
      <div class="wontum-subtitle-option ${activeTrack === -1 ? "active" : ""}" data-track="-1">Off</div>
      ${tracks
				.map(
					(track, i) => `
        <div class="wontum-subtitle-option ${i === activeTrack ? "active" : ""}" data-track="${i}">
          ${track.label || track.language || `Track ${i + 1}`}
        </div>
      `,
				)
				.join("")}
    `

		menu.querySelectorAll(".wontum-subtitle-option").forEach((option) => {
			option.addEventListener("click", (e) => {
				const target = e.target as HTMLElement
				const trackIndex = parseInt(target.dataset.track || "-1")

				if (trackIndex === -1) {
					this.player.disableSubtitles()
				} else {
					this.player.enableSubtitles(trackIndex)
				}

				menu.querySelectorAll(".wontum-subtitle-option").forEach((opt) => opt.classList.remove("active"))
				target.classList.add("active")
			})
		})
	}

	private updateSpeedMenu(): void {
		const menu = this.controlsContainer.querySelector(".wontum-speed-menu")!
		const state = this.player.getState()
		const currentRate = state.playbackRate || 1

		const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

		menu.innerHTML = speeds
			.map(
				(speed) => `
        <div class="wontum-speed-option ${currentRate === speed ? "active" : ""}" data-speed="${speed}">
          ${speed === 1 ? "Normal" : speed + "x"}
        </div>
      `,
			)
			.join("")

		menu.querySelectorAll(".wontum-speed-option").forEach((option) => {
			option.addEventListener("click", (e) => {
				const target = e.target as HTMLElement
				const speed = parseFloat(target.dataset.speed || "1")

				this.player.setPlaybackRate(speed)

				menu.querySelectorAll(".wontum-speed-option").forEach((opt) => opt.classList.remove("active"))
				target.classList.add("active")
			})
		})
	}

	private updateSettingsMenu(): void {
		const menu = this.controlsContainer.querySelector(".wontum-settings-menu")!
		menu.innerHTML = `
      <div class="wontum-settings-option" data-setting="sticky-controls">
        <span>Sticky Controls</span>
        <div class="wontum-toggle-switch ${this.stickyControls ? "active" : ""}"></div>
      </div>
    `

		const stickyOption = menu.querySelector('[data-setting="sticky-controls"]')!
		stickyOption.addEventListener("click", () => {
			this.stickyControls = !this.stickyControls

			const toggle = stickyOption.querySelector(".wontum-toggle-switch")!
			toggle.classList.toggle("active")

			if (this.stickyControls) {
				this.controlsContainer.classList.add("sticky")
				this.progressContainer.classList.add("sticky")
			} else {
				this.controlsContainer.classList.remove("sticky")
				this.progressContainer.classList.remove("sticky")
			}
		})
	}

	private updateQualityMenu(qualities?: any[]): void {
		const menu = this.controlsContainer.querySelector(".wontum-quality-menu")!

		// If no qualities provided, get from player
		const qualityList = qualities || this.player.getQualities()

		// If still no qualities available, show message
		if (!qualityList || qualityList.length === 0) {
			menu.innerHTML = '<div class="wontum-quality-option">No qualities available</div>'
			return
		}

		menu.innerHTML = `
      <div class="wontum-quality-option active" data-quality="-1">Auto</div>
      ${qualityList
				.map(
					(q, i) => `
        <div class="wontum-quality-option" data-quality="${i}">${q.name}</div>
      `,
				)
				.join("")}
    `

		menu.querySelectorAll(".wontum-quality-option").forEach((option) => {
			option.addEventListener("click", (e) => {
				const target = e.target as HTMLElement
				const quality = parseInt(target.dataset.quality || "-1")
				this.player.setQuality(quality)

				menu.querySelectorAll(".wontum-quality-option").forEach((opt) => opt.classList.remove("active"))
				target.classList.add("active")
			})
		})
	}

	private showControls(): void {
		this.controlsContainer.classList.remove("hidden")
		this.progressContainer.classList.remove("hidden")
		// this.controlsVisible = true
	}

	private hideControls(): void {
		// Don't hide if sticky controls is enabled
		if (this.stickyControls) return

		// Don't hide if volume slider is being used
		if (this.isVolumeSliderActive) return

		const state = this.player.getState()
		if (state.playing) {
			this.controlsContainer.classList.add("hidden")
			this.progressContainer.classList.add("hidden")
			// this.controlsVisible = false
		}
	}

	private resetHideControlsTimeout(): void {
		// Don't set timeout if sticky controls is enabled
		if (this.stickyControls) return
		if (this.hideControlsTimeout) {
			clearTimeout(this.hideControlsTimeout)
		}

		this.hideControlsTimeout = window.setTimeout(() => {
			this.hideControls()
		}, 10000)
	}

	private formatTime(seconds: number): string {
		if (isNaN(seconds)) return "0:00"

		const mins = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${mins}:${secs.toString().padStart(2, "0")}`
	}

	// SVG Icons
	private getPlayIcon(): string {
		return `<svg viewBox="0 0 24 24"><path fill="white" d="M8 5v14l11-7z"/></svg>`
	}

	private getPauseIcon(): string {
		return `<svg viewBox="0 0 24 24"><path fill="white" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`
	}

	private getVolumeIcon(): string {
		return `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`
	}

	private getMutedIcon(): string {
		return `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
	}

	private getFullscreenIcon(): string {
		return `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`
	}

	private getPipIcon(): string {
		return `<svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/></svg>`
	}

	private getSkipBackwardIcon(): string {
		return `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="30" cy="30" r="28" stroke="white" stroke-width="2"/>
			<!-- Circular arrow backward -->
			<path d="M30 12 A18 18 0 1 0 30 48" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
			<path d="M25 12 L30 12 L30 17" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
			<text x="30" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">10</text>
		</svg>`
	}

	private getSkipForwardIcon(): string {
		return `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="30" cy="30" r="28" stroke="white" stroke-width="2"/>
			<!-- Circular arrow forward -->
			<path d="M30 12 A18 18 0 1 1 30 48" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
			<path d="M35 12 L30 12 L30 17" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
			<text x="30" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">10</text>
		</svg>`
	}

	private getSettingsIcon(): string {
		return `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`
	}

	public destroy(): void {
		if (this.hideControlsTimeout) {
			clearTimeout(this.hideControlsTimeout)
		}
		this.controlsContainer.remove()
	}
}
