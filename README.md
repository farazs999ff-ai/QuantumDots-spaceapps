<div align="center">
  <img width="1200" height="475" alt="Quantum Dots in Projection" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Quantum Dots in Projection

Interactive 3D optical spectroscopy simulation that couples quantum-dot confinement physics with Doppler-shifted exoplanet atmospheric transmission spectra.

This project presents a research-driven concept for using tunable colloidal quantum dots as compact, wavelength-adjustable optical components for space-based spectroscopy, remote sensing, and high-efficiency optical projection.

## Overview

Quantum Dots in Projection explores how semiconductor nanocrystals can be engineered to:

- tune emission and absorption bands by changing nanocrystal radius and shell composition
- reduce bulky fixed filter-wheel hardware in space instruments
- improve spectral calibration for exoplanet atmospheric detection
- model resonance between quantum-dot emission and atmospheric absorption features
- visualize the physics in an interactive 3D lab interface

## Key features

- Interactive 3D laboratory visualization of quantum-dot confinement behavior
- Tunable spectral range from visible to near-infrared regions
- Doppler-shifted exoplanet atmospheric transmission modeling
- Research-backed equations for Brus confinement and spectral resonance
- Responsive presentation-style landing page and research narrative
- Built with React, Vite, TypeScript, Tailwind CSS, and Three.js

## Tech stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Three.js
- Google GenAI SDK
- Lucide React

## Project structure

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
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── README.md
└── package-lock.json
```

## Local development

### Prerequisites

- Node.js 18+
- npm
- A Gemini API key from Google AI Studio

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env.local` file in the project root and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

### Run the app

```bash
npm run dev
```

Then open the local URL shown by Vite, typically:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Research concept

The project models the relationship between:

- nanocrystal core radius and bandgap energy
- exciton confinement and quantum yield
- emission wavelength and atmospheric absorption overlap
- radial Doppler shift and detected exoplanet spectral signatures

This enables a visually rich educational and technical prototype for demonstrating how quantum-dot-based optical systems could support next-generation space instrumentation.

## Credits

- Researcher: Abid Ali Leghari
- Web Developers: Gulfaraz Ahmed and Niaz Hussain

## License

This project is for research and demonstration purposes.

## Related links

- AI Studio app: https://ai.studio/apps/cf791551-e01d-4f06-8fcb-b717473f3dde
- Project title: Quantum Dots in Projection
