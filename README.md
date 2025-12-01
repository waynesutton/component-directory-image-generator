# Component Directory Image Generator

A gradient image generator for creating component thumbnails for the Convex Components Directory. Built with React, Vite, and Convex.

## Features

- **Simple View**: Quick image generation with default gradient and center overlay upload
- **Advanced View**: Full gradient editor with customizable angles, color stops (2-4 colors), and grain intensity
- **Center Overlay Image**: Upload PNG or SVG logos/artwork to overlay in the center of the gradient
- **Top-Left Overlay Image**: Optional branding overlay in the top-left corner (Advanced view)
- **Image Export**: Export images as PNG at 1536x864 (16:9 aspect ratio)
- **Preset Gallery**: Pre-built gradient presets including Default Image, Rose Garden, Forest Mist, Golden Hour, and more
- **Custom Gradients**: Save and manage your own gradient variations
- **Mobile Responsive**: Fully optimized for phone and tablet viewports

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and serverless functions)
- **Auth**: Convex Auth with Anonymous authentication

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

This starts both the Vite frontend and Convex backend development servers.

## Build for Production

```bash
npm run build
```

## Deployment

This app is configured for Netlify deployment. The `netlify.toml` file includes:
- Build command and publish directory configuration
- SPA routing with fallback to index.html
- Static asset caching headers

## Project Structure

```
src/
  App.tsx              # Main app with Simple/Advanced view toggle
  components/
    SimpleView.tsx     # Simplified view for quick image generation
    GradientGenerator.tsx  # Advanced gradient editing
    GradientEditor.tsx     # Gradient controls and image upload
    GradientPreview.tsx    # Canvas preview and export
    GradientGallery.tsx    # Preset and custom gradient gallery

convex/
  schema.ts           # Database schema
  gradients.ts        # Gradient queries and mutations
```

## Links

- [Convex](https://convex.dev/)
- [Convex Components Directory](https://www.convex.dev/components)
# component-directory-image-generator
