# CCMS Presentation Website

Interactive single-page presentation for the **Centralized Control and Monitoring System (CCMS)** for Outdoor Electrical Distribution.

## Overview

This Next.js-based presentation website showcases the CCMS project with animated 3D visualizations, live data flow animations, and scroll-based interactions optimized for 12.4-inch tablet displays.

## Features

- 🎨 **Stunning Animations**: Framer Motion scroll animations and smooth transitions
- 🌟 **3D Background**: Three.js animated particle background
- 📊 **Live Data Flow**: Canvas-based animated visualization of data packets
- 🏗️ **Interactive Architecture**: Animated three-layer system architecture
- 📱 **Single Page**: All content on one scrollable page
- ✨ **Highly Engaging**: Parallax effects, hover animations, and visual feedback
- 🎯 **Tablet Optimized**: Touch-friendly and optimized for 12.4" displays

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion + GSAP
- **Canvas**: HTML5 Canvas for data visualizations

## Sections

### 1. Hero Section

Dramatic title reveal with animated gradient text and floating scroll indicator.

### 2. Project Overview

Six feature cards with staggered animations and hover effects, plus technical highlights.

### 3. System Architecture

Interactive canvas visualization showing three layers (Edge, Cloud, UI) with particle effects and animated connections.

### 4. Communication System

Live data flow animation showing GPRS and LoRa paths with animated packets, plus dual-channel comparison.

### 5. Key Benefits

Four major benefits with statistics, impact summary, and automatic failover visualization.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your tablet browser.

### Production

```bash
npm run build
npm start
```

## Animations

The presentation includes:

- **Scroll-triggered animations** using Intersection Observer
- **Parallax effects** with Framer Motion
- **3D particle system** with Three.js
- **Canvas animations** for data flow and architecture
- **Hover interactions** with scale and glow effects
- **Gradient animations** on text and backgrounds

## Tablet Optimization

Optimized for 12.4-inch tablets with:

- Touch-friendly hit areas
- Smooth 60fps animations
- Optimized canvas rendering
- Gesture-friendly interactions
- Responsive font scaling
- Hardware-accelerated transforms

## Customization

### Colors

Edit gradients and colors in `app/globals.css` and Tailwind config.

### Content

Update text and data in `app/page.tsx`.

### Animations

Adjust timing and effects in component files.

### Canvas Visualizations

Modify `DataFlowVisualization.tsx` and `SystemArchitecture.tsx` for custom graphics.

## Performance

- Canvas animations use requestAnimationFrame
- Components lazy load with Intersection Observer
- Three.js optimized for mobile performance
- CSS animations use GPU acceleration

## Browser Support

Tested on:

- Chrome/Edge (Chromium)
- Safari (iOS/macOS)
- Firefox

## License

Created for presentation purposes.

## CCMS Project

This presentation showcases a comprehensive IoT-based system for managing 20KW three-phase electrical panels with:

- Dual GPRS/LoRa communication
- Real-time monitoring and control
- Cloud-based analytics
- Predictive maintenance capabilities
