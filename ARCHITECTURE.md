# Wontum Player - Technical Architecture

## Overview

Wontum Player is a comprehensive HLS video player SDK designed specifically for educational platforms. It provides enterprise-grade features similar to Mux Player, including:

- HLS adaptive bitrate streaming
- S3 integration with presigned URL support
- Analytics and Quality of Experience (QoE) metrics
- Customizable UI and theming
- Framework integrations (React, Vue, etc.)

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────┐
│                 WontumPlayer                    │
│  (Main player class - orchestrates everything)  │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────┐
│   HLS.js    │  │ HTML5 Video  │
│  (Streaming)│  │   Element    │
└─────────────┘  └──────────────┘
       │
       └──────┬──────────────────┬──────────────┬─────────────┐
              │                  │              │             │
              ▼                  ▼              ▼             ▼
      ┌──────────────┐  ┌──────────────┐  ┌─────────┐  ┌─────────┐
      │ UIController │  │  Analytics   │  │S3Handler│  │  React  │
      │  (Controls)  │  │  (Tracking)  │  │(S3 URLs)│  │ Wrapper │
      └──────────────┘  └──────────────┘  └─────────┘  └─────────┘
```

### 1. WontumPlayer (player.ts)

**Responsibility**: Main player class that orchestrates all components.

**Key Features**:

- Video element creation and management
- HLS.js integration for adaptive streaming
- Event management and propagation
- Playback control (play, pause, seek)
- Quality level management
- Volume and playback rate control
- Fullscreen API integration

**Technology Stack**:

- HLS.js for HLS streaming
- Native HTML5 Video API
- Custom event system

### 2. UIController (ui-controller.ts)

**Responsibility**: Manages player UI and controls.

**Key Features**:

- Custom video controls (play, pause, progress, volume)
- Quality selector menu
- Fullscreen toggle
- Time display
- Auto-hide controls on inactivity
- Responsive design
- Custom SVG icons

**Design Pattern**: Controller pattern with DOM manipulation

### 3. Analytics (analytics.ts)

**Responsibility**: Tracks player events and QoE metrics.

**Key Metrics**:

- Total play time
- Total buffer time
- Buffering ratio
- Rebuffer count
- Seek count
- Session tracking
- Network information

**Features**:

- Event batching
- Custom analytics endpoints
- Session management
- Connection quality tracking

### 4. S3Handler (s3-handler.ts)

**Responsibility**: Handles S3 URLs and presigned URL generation.

**Key Features**:

- S3 URL detection
- Presigned URL caching
- Multiple S3 URL format support
- Automatic URL refresh before expiration

**Supported Formats**:

- `s3://bucket/key`
- `https://bucket.s3.region.amazonaws.com/key`
- `https://bucket-name.s3.amazonaws.com/key`

### 5. React Integration (react.tsx)

**Responsibility**: React wrapper components and hooks.

**Components**:

- `WontumPlayerReact`: Main React component
- `useWontumPlayer`: Hook for imperative control
- `WontumPlayerProvider`: Context provider
- `useWontumPlayerContext`: Context consumer hook

## Data Flow

### 1. Video Loading Flow

```
User Request
    │
    ▼
WontumPlayer.loadSource()
    │
    ├─── Is S3 URL? ──▶ S3Handler.processUrl()
    │                        │
    │                        ▼
    │                   getPresignedUrl()
    │                        │
    ▼                        ▼
HLS.js.loadSource(url) ◀─────┘
    │
    ▼
HLS.js.attachMedia(videoElement)
    │
    ▼
Video Ready
```

### 2. Event Flow

```
Video Event (e.g., 'play')
    │
    ▼
VideoElement Event Listener
    │
    ├─── Update Player State
    │
    ├─── Emit Player Event ──▶ Event Listeners
    │
    ├─── Update UI ──▶ UIController
    │
    └─── Track Analytics ──▶ Analytics.trackEvent()
                                    │
                                    ▼
                             Analytics Endpoint
```

### 3. Analytics Flow

```
Player Event
    │
    ▼
Analytics.trackEvent()
    │
    ├─── Update Metrics
    │       │
    │       ├─── Play time
    │       ├─── Buffer time
    │       └─── Event counts
    │
    ├─── Create Analytics Event
    │       │
    │       └─── Add session data
    │
    └─── Send to Endpoint
            │
            └─── POST to analytics API
```

## Key Design Patterns

### 1. Observer Pattern

- Event system for player state changes
- React hooks for state updates
- Analytics event tracking

### 2. Strategy Pattern

- S3 URL handling (different strategies for different formats)
- Quality selection (auto vs manual)

### 3. Facade Pattern

- WontumPlayer acts as a facade for HLS.js, video element, UI, and analytics

### 4. Singleton Pattern

- Analytics session management
- S3 URL cache

## Performance Considerations

### 1. Buffering

- Configurable buffer sizes via HLS.js config
- Buffer event tracking for QoE
- Automatic recovery on buffer errors

### 2. Quality Adaptation

- Automatic quality switching based on bandwidth
- Manual quality override support
- Cap quality to player size option

### 3. Memory Management

- Proper cleanup in destroy() method
- Event listener removal
- HLS.js instance destruction
- URL cache clearing

### 4. S3 Presigned URLs

- URL caching to reduce API calls
- Automatic refresh before expiration
- Cache invalidation on errors

## Security Considerations

### 1. S3 Access

- Presigned URLs with time-limited access
- Support for custom authentication
- Backend URL generation recommended

### 2. Analytics

- Optional user/session ID tracking
- Configurable analytics endpoints
- No PII in default tracking

### 3. Content Protection

- Support for DRM (via HLS.js configuration)
- Encrypted HLS streams
- Token-based authentication

## Extensibility

### Adding New Features

1. **Custom Controls**:

   - Extend UIController
   - Add new DOM elements
   - Wire up event handlers

2. **New Analytics Metrics**:

   - Add metric tracking in Analytics class
   - Update getQoEMetrics() method
   - Emit new events

3. **Custom Storage Backends**:

   - Extend S3Handler
   - Implement new URL processing logic
   - Add custom presigned URL generation

4. **Framework Integrations**:
   - Follow React wrapper pattern
   - Create framework-specific components
   - Use player instance as core

## Browser Compatibility

### HLS Support

- **Native HLS**: Safari (iOS/macOS)
- **HLS.js**: Chrome, Firefox, Edge
- **Fallback**: Progressive download for older browsers

### Required APIs

- HTML5 Video
- Fullscreen API
- Fetch API (for analytics)
- MediaSource Extensions (for HLS.js)

## Testing Strategy

### Unit Tests

- Player state management
- Event emission
- Analytics calculations
- S3 URL parsing

### Integration Tests

- HLS stream loading
- UI interactions
- Analytics tracking
- S3 presigned URLs

### E2E Tests

- Full playback flow
- Quality switching
- Error recovery
- Multi-browser testing

## Deployment

### As NPM Package

```bash
npm install @obipascal/player
```

### As CDN

```html
<script src="https://cdn.example.com/wontum-player.js"></script>
```

### Self-Hosted

Build and host on your own CDN:

```bash
npm run build
# Upload dist/ to CDN
```

## Future Enhancements

### Planned Features

1. **DRM Support**: Widevine, FairPlay, PlayReady
2. **Live Streaming**: Low-latency HLS, WebRTC
3. **Thumbnails**: Preview thumbnails on hover
4. **Captions/Subtitles**: VTT/SRT support
5. **Playlists**: Built-in playlist management
6. **Chromecast**: Cast support
7. **Offline**: Download and offline playback
8. **A/B Testing**: Built-in A/B testing framework

### Performance Improvements

1. Lazy loading of UI components
2. Web Worker for analytics
3. Service Worker for offline support
4. WebAssembly for performance-critical operations

## Comparison with Mux Player

| Feature        | Wontum Player | Mux Player |
| -------------- | ------------- | ---------- |
| HLS Streaming  | ✅            | ✅         |
| S3 Integration | ✅            | ❌         |
| Analytics      | ✅            | ✅         |
| React Support  | ✅            | ✅         |
| Open Source    | ✅            | ✅         |
| Self-Hosted    | ✅            | ❌         |
| Custom Themes  | ✅            | ✅         |
| DRM            | 🔄 Planned    | ✅         |
| Live Streaming | 🔄 Planned    | ✅         |

## Contributing

To contribute to Wontum Player:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details
