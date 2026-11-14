<div align="center">
  <img width="1200" height="475" alt="Quantum Dots in Projection" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Quantum Dots in Projection

An interactive 3D optical spectroscopy simulation that connects quantum-dot confinement physics with Doppler-shifted exoplanet atmospheric transmission spectra.

This project explores the idea of using tunable colloidal quantum dots as compact, wavelength-adjustable optical components for space-based spectroscopy, remote sensing, and next-generation optical projection systems.

## Overview

Quantum Dots in Projection demonstrates how semiconductor nanocrystals can be engineered to:

- tune absorption and emission across the visible and near-infrared bands
- reduce dependence on bulky fixed filter wheels and dichroic stacks in space instruments
- improve calibration for atmospheric spectroscopy and exoplanet detection
- model resonance between quantum-dot emission and atmospheric absorption features
- visualize the science through an interactive 3D simulation environment

## Key Features

- 3D interactive laboratory visualization of quantum-dot behavior
- Real-time tunable core radius and spectral response controls
- Doppler-shifted exoplanet transmission analysis
- Research-informed equations for quantum confinement and resonance matching
- Responsive presentation-style UI for technical storytelling
- Built with React, Vite, TypeScript, Tailwind CSS, and Three.js

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Three.js
- Google GenAI SDK
- Lucide React

## Project Structure

```text
.
├── public/
├── scripts/
├── src/
│   ├── assets/
│   ├── components/
│   ├── presentation/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── README.md
├── bun.lock
└── .env.local.example
```

## Local Development

### Prerequisites

- Node.js 18+
- npm
- A Gemini API key from Google AI Studio

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env.local` file in the project root and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

### Run the App

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, typically:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Research Concept

The system models the relationship between:

- nanocrystal core radius and bandgap energy
- exciton confinement and quantum yield
- emission wavelength and atmospheric absorption overlap
- radial Doppler shift and exoplanet spectral signatures

This creates a visually rich educational and technical prototype to demonstrate how quantum-dot-based optical systems could support next-generation space instrumentation.

## Credits

- Researcher: Abid Ali Leghari
- Web Developers: Gulfaraz Ahmed and Niaz Hussain

## Related Links

- AI Studio app: https://ai.studio/apps/cf791551-e01d-4f06-8fcb-b717473f3dde
- Project name: Quantum Dots in Projection
