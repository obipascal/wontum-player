# Event Compatibility: Wontum Player vs Mux Player

## Summary

✅ **Wontum Player now supports ALL Mux Player events** (25 total events)

## Complete Event List

### Playback Events (5)

| Event        | Description                                    | Mux Compatible |
| ------------ | ---------------------------------------------- | -------------- |
| `play`       | Playback has started                           | ✅             |
| `pause`      | Playback has been paused                       | ✅             |
| `playing`    | Playback is actually playing (after buffering) | ✅             |
| `ended`      | Playback has reached the end                   | ✅             |
| `timeupdate` | Current playback position changed              | ✅             |

### Seeking Events (2)

| Event     | Description                 | Mux Compatible |
| --------- | --------------------------- | -------------- |
| `seeking` | Seeking operation started   | ✅             |
| `seeked`  | Seeking operation completed | ✅             |

### Loading/Buffering Events (8)

| Event            | Description                                | Mux Compatible |
| ---------------- | ------------------------------------------ | -------------- |
| `loadstart`      | Browser started looking for media          | ✅             |
| `loadeddata`     | First frame of media loaded                | ✅             |
| `loadedmetadata` | Metadata (duration, dimensions) loaded     | ✅             |
| `canplay`        | Browser can start playing                  | ✅             |
| `canplaythrough` | Browser can play through without buffering | ✅             |
| `progress`       | Browser is downloading media               | ✅             |
| `waiting`        | Playback stopped for buffering             | ✅             |
| `durationchange` | Duration attribute changed                 | ✅             |

### Media State Events (3)

| Event          | Description                  | Mux Compatible |
| -------------- | ---------------------------- | -------------- |
| `volumechange` | Volume or mute state changed | ✅             |
| `ratechange`   | Playback rate changed        | ✅             |
| `resize`       | Video dimensions changed     | ✅             |

### Network/Error Events (5)

| Event     | Description                              | Mux Compatible |
| --------- | ---------------------------------------- | -------------- |
| `abort`   | Media loading aborted                    | ✅             |
| `emptied` | Media element became empty               | ✅             |
| `stalled` | Media data loading stalled               | ✅             |
| `suspend` | Browser intentionally not fetching media | ✅             |
| `error`   | An error occurred                        | ✅             |

### Custom Player Events (2)

| Event              | Description                   | Wontum Extension |
| ------------------ | ----------------------------- | ---------------- |
| `qualitychange`    | Video quality/bitrate changed | ⭐               |
| `fullscreenchange` | Fullscreen state changed      | ⭐               |

## Usage Examples

### Vanilla JavaScript

```javascript
import { WontumPlayer } from "@wontum/player"

const player = new WontumPlayer({
	src: "https://media.domain.com/video.m3u8",
	container: "#player",
})

// Listen to any event
player.on("play", (event) => {
	console.log("Playing!", event)
})

player.on("error", (event) => {
	console.error("Error:", event.data.error)
})

player.on("qualitychange", (event) => {
	console.log("Quality changed to:", event.data.quality)
})
```

### React

```tsx
import { WontumPlayerReact } from "@wontum/player"

;<WontumPlayerReact
	src="https://media.domain.com/video.m3u8"
	onPlay={(e) => console.log("Play")}
	onPause={(e) => console.log("Pause")}
	onError={(e) => console.error("Error", e)}
	onQualitychange={(e) => console.log("Quality:", e.data.quality)}
/>
```

## Migration from Mux Player

If you're migrating from Mux Player, **all your existing event listeners will work without changes**. Just replace:

```javascript
// Mux Player
const player = document.querySelector('mux-player');
player.addEventListener('play', (e) => { ... });
```

With:

```javascript
// Wontum Player
import { WontumPlayer } from '@wontum/player';
const player = new WontumPlayer({ ... });
player.on('play', (e) => { ... });
```

## Complete Compatibility Matrix

| Feature                   | Mux Player       | Wontum Player                      |
| ------------------------- | ---------------- | ---------------------------------- |
| HTML5 MediaElement Events | ✅ 23 events     | ✅ 23 events                       |
| Custom Events             | ✅ (various)     | ✅ qualitychange, fullscreenchange |
| Event Data Format         | ✅ Standard      | ✅ Standard (compatible)           |
| React Props               | ✅ on[EventName] | ✅ on[EventName]                   |
| TypeScript Types          | ✅               | ✅ Fully typed                     |

## Event Reference

For complete event documentation with detailed examples, see:

- [events-demo.ts](./events-demo.ts) - All events with console logging examples
- [react-examples.tsx](./react-examples.tsx) - React event handler examples
- [vanilla-js-examples.ts](./vanilla-js-examples.ts) - Vanilla JS event examples

## Additional Features

Wontum Player also includes:

- ✅ HLS.js adaptive streaming
- ✅ CloudFront signed cookie support
- ✅ Built-in analytics tracking
- ✅ Custom UI controls
- ✅ Quality of Experience (QoE) metrics
- ✅ Full TypeScript support
- ✅ React components and hooks
