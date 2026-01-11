# Wontum Player

A modern HLS video player SDK for educational platforms with S3 integration.

## Quick Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run development server:**

   ```bash
   npm run dev
   ```

   Then open `http://localhost:5173/demo.html` in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```
   Output will be in the `dist/` folder.

## Project Structure

```
wontum-player/
├── src/
│   ├── index.ts           # Main entry point
│   ├── player.ts          # Core player class
│   ├── ui-controller.ts   # UI and controls
│   ├── analytics.ts       # Analytics & QoE tracking
│   ├── s3-handler.ts      # S3 URL handling
│   ├── react.tsx          # React components
│   └── types.ts           # TypeScript types
├── examples/
│   ├── react-examples.tsx      # React usage examples
│   └── vanilla-js-examples.ts  # Vanilla JS examples
├── demo.html              # Live demo page
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features

- ✨ HLS streaming with adaptive bitrate
- 🎯 S3 integration with presigned URLs
- 📊 Built-in analytics and QoE metrics
- 🎨 Customizable UI with theming
- ⚛️ React components and hooks
- 🔧 Full TypeScript support
- 📱 Mobile-friendly

## Development

### Adding Features

1. Update the relevant file in `src/`
2. Export from `src/index.ts`
3. Update type definitions in `src/types.ts`
4. Test with `npm run dev`

### Testing

Open `demo.html` in development mode to test changes:

```bash
npm run dev
# Navigate to http://localhost:5173/demo.html
```

### Building

```bash
npm run build
```

This creates:

- `dist/wontum-player.esm.js` - ES module
- `dist/wontum-player.cjs.js` - CommonJS module
- `dist/index.d.ts` - TypeScript definitions

## Backend Integration for S3

### Node.js/Express Example

```javascript
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

const s3Client = new S3Client({ region: "us-east-1" })

app.get("/api/presigned-url", async (req, res) => {
	const { key } = req.query

	const command = new GetObjectCommand({
		Bucket: "your-bucket-name",
		Key: key,
	})

	const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

	res.json({ url })
})
```

## Publishing

1. Update version in `package.json`
2. Build: `npm run build`
3. Publish: `npm publish`

## Support

For issues and questions, please open an issue on GitHub.
