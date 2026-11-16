# NASA Space Apps Challenge 2026 — Project Submission Master Package

> Project Name: Quantum Dots in Projection  
> GitHub Repository: https://github.com/farazs999ff-ai/QuantumDots-spaceapps  
> Project Type: Interactive scientific visualizer and educational mission concept for space spectroscopy  
> Reference Guide: https://www.spaceappschallenge.org/resources/project-submission-guide/

---

# SECTION 1: Space Apps Portal Copy-Paste Fields

### 1. Project Title
`Quantum Dots in Projection: Tunable Nanocrystals for Space Optical Spectroscopy`

### 2. High-Level Summary (Elevator Pitch)
> Quantum Dots in Projection is an interactive scientific simulator that demonstrates how size-tunable semiconductor nanocrystals can be used as adaptive optical emitters and spectral reference filters for exoplanet atmospheric spectroscopy. By varying a quantum dot core radius, we tune the effective bandgap and match the emission peak to Doppler-shifted molecular absorption lines in a transiting exoplanet atmosphere. The project visualizes a complete 3D optical bench—from stellar light, to collimation, to quantum-dot resonance tuning, to spectral readout—making advanced space instrumentation intuitive, discoverable, and mission-ready for the next generation of orbital observatories.

### 3. Detailed Project Description

#### What does it do?
Quantum Dots in Projection is a 3D-driven educational and engineering visualization platform that models how quantum-confined nanocrystals can enable compact, tunable, space-ready optical sensing. The application presents an interactive optical bench, a core-shell quantum dot lattice, a live spectral analyzer, and a simulated exoplanet atmosphere. Users can tune nanocrystal radius, switch among material systems such as CdSe/ZnS, InP/ZnS, CdTe/ZnS, and CsPbBr3, and explore how the electronic bandgap shifts with radius and dielectric confinement.

The system also animates the spectral overlap between quantum-dot emission and Doppler-shifted atmospheric absorption features such as Fe I, H-beta, Na I D, O2 A-band, and K I. This helps explain how a tunable QD-based optical system could act as a fast, lightweight alternative to heavy fixed filter wheels and rigid dichroic stacks in future space spectroscopy missions.

#### Why is this relevant to NASA Space Apps?
This project addresses a core challenge in space science: how to build compact, adaptive, high-sensitivity spectroscopic systems for remote sensing and exoplanet observation without adding large, fragile, and power-intensive hardware. Quantum dots offer a radically different route—allowing continuous spectral tunability via nanocrystal radius rather than mechanical vibration or fixed wavelength filtering.

By visualizing the interplay between quantum confinement, Stokes shifts, and relativistic Doppler shift, the project captures the kind of scientific reasoning needed for next-generation observatories. It translates a complex optical physics concept into an accessible web-based tool that explains, demonstrates, and communicates the mission value of nanocrystal-based spectral engineering.

#### How does it work?
- Core-shell quantum dot geometry is parameterized by radius R and material system.
- The Brus effective-mass approximation is used to model the size-dependent bandgap $E_g(R)$.
- Realistic Stokes shifts, Gaussian linewidths, and pump thresholds are incorporated to represent photoluminescence behavior.
- Spectral absorption features from a simulated planetary atmosphere are stretched by relativistic Doppler redshift and matched against the QD emission profile.
- A live projection screen visualizes absorption dips, resonance overlap, and the resulting signal response in a 3D scientific instrument interface.

#### Mission impact
This project helps make advanced space spectrography more understandable and portable. It demonstrates how nanoscale materials can reduce system complexity, increase wavelength flexibility, and enable compact optical instrumentation for future telescope and CubeSat missions. It is especially useful as a conceptual design and educational platform for mission science teams, aerospace students, and public engagement audiences.

### 4. NASA Open Science Data & Scientific Inspiration
1. NASA Exoplanet Archive — public archive of exoplanet target information, stellar metadata, and atmospheric characterization context.
2. NASA / ESA Hubble and JWST public spectroscopy archives — reference material for transmission spectroscopy lines and atmospheric absorption signatures.
3. NASA mission literature on exoplanet atmospheres — used conceptually to ground the project’s target species and Doppler-shifted transmission features.

The project is a visualization and mission-concept prototype informed by open NASA and astrophysics data conventions rather than a direct sensor deployment platform.

### 5. Technologies Used
- React 19 + TypeScript
- Vite + Tailwind CSS
- Three.js / WebGL 3D rendering
- Interactive scientific UI with live spectral analysis
- Custom GLSL and procedural planetary visualization
- TypeScript-based physical modeling for quantum confinement, spectral overlap, and redshift calculations

---

# SECTION 2: Official 7-Slide Presentation Deck Prompts

Use this as the core prompt for a 7-slide deck in Gamma, Canva, Beautiful.ai, or ChatGPT Slides:

```text
Create a 7-slide NASA Space Apps Challenge presentation deck for 'Quantum Dots in Projection.' Visual style: premium modern scientific, deep slate backgrounds, white/light neutrals, cyan and sky-blue accents, subtle glassmorphism, crisp data charts, and elegant 3D optical bench imagery. Show a connected story from quantum confinement to exoplanet spectroscopy with strong technical credibility and polished lab-like visuals.
```

### Slide 1: Title & Mission
- **Slide Title:** Quantum Dots in Projection
- **Subtitle:** Tunable Nanocrystals for Compact Space Spectroscopy
- **Key Content:**
  - NASA Space Apps Challenge 2026
  - Team: Abid Ali Leghari, Iqra Bhatti, Samreen, Niaz Hussain, Gulfaraz Ahmed, Antisha Zahra
  - Concept: Adaptive quantum-dot optical sensing for exoplanet atmospheric absorption spectroscopy
- **Visuals:** High-end scientific hero image, nanocrystal rendering, orbital/exoplanet-inspired background.
- **AI Slide Generator Prompt:**
  > "Slide 1: clean scientific title slide. Modern space-lab aesthetic with blue and cyan accents. Heading: Quantum Dots in Projection. Subheading: Tunable Nanocrystals for Compact Space Spectroscopy. Add team names and NASA Space Apps branding."

### Slide 2: Why This Matters
- **Slide Title:** The Problem: Rigid Optics in Space
- **Key Content:**
  - Fixed filter wheels and dichroic stacks limit wavelength agility in spacecraft spectrographs.
  - Mission payloads need flexible spectral response, low mass, and strong resilience to radiation and thermal drift.
  - Real mission data requires a spectrum that can adapt to changing atmospheric lines and transit conditions.
- **Visuals:** Side-by-side comparison of bulky mechanical optics vs. tunable nanocrystal assembly.
- **AI Slide Generator Prompt:**
  > "Slide 2: engineering problem statement. Show the limitation of fixed optical filters in space instrumentation and contrast with a compact, tunable nanocrystal system. Clean bento-card layout with calm blue scientific palette."

### Slide 3: Quantum Confinement Physics
- **Slide Title:** Quantum Dots as Tunable Emission Sources
- **Key Content:**
  - Bandgap depends on nanocrystal radius: $E_g(R)$
  - Smaller radii widen the bandgap and shift emission toward blue wavelengths.
  - Core-shell passivation suppresses trap losses while preserving narrow emission lines.
- **Visuals:** Graph of radius vs. emission wavelength with a highlighted core-shell schematic.
- **AI Slide Generator Prompt:**
  > "Slide 3: scientific concept slide showing the Brus equation and nanocrystal size effects. Include schematic of core-shell quantum dot and a wavelength-vs-radius plot. Minimal chemistry notation, polished lab-infographic style."

### Slide 4: Materials & Spectral Range
- **Slide Title:** Realistic Material Systems
- **Key Content:**
  - CdSe/ZnS, InP/ZnS, CdTe/ZnS, and CsPbBr3 presets
  - Tunable range from visible to near-infrared
  - Stokes shifts, linewidths, and quantum yield modeled for realistic performance
- **Visuals:** Table or comparison cards with material systems and spectral windows.
- **AI Slide Generator Prompt:**
  > "Slide 4: materials comparison table. Show four nanocrystal material systems with emission ranges, Stokes shifts, linewidths, and recommended mission use cases. Scientific infographic with clean typography."

### Slide 5: Exoplanet Spectroscopy Use Case
- **Slide Title:** Matching Atmospheric Lines in Transit Spectroscopy
- **Key Content:**
  - Planetary atmosphere imprints narrow absorption lines on stellar light.
  - Doppler shift moves these lines to longer wavelengths during transit and orbital motion.
  - A tunable QD emitter can be matched to the target line to increase spectral sensitivity and line overlap.
- **Visuals:** Exoplanet transit schematic with a spectral absorption profile overlay.
- **AI Slide Generator Prompt:**
  > "Slide 5: exoplanet transit spectrograph concept. Show host star, planet, atmospheric absorption line, and Doppler-shifted line matching to a quantum-dot emission profile. High-clarity scientific diagram."

### Slide 6: Interactive 3D Scientific Platform
- **Slide Title:** The Interactive Lab in the Browser
- **Key Content:**
  - Three-dimensional optical bench and nanocrystal lattice
  - Live spectral analyzer with wavelength and transmittance data
  - Adjustable radius, material, and redshift controls
  - Hands-on simulation of resonance locking and instrument response
- **Visuals:** Screenshot-style mockup of the project interface and 3D viewport.
- **AI Slide Generator Prompt:**
  > "Slide 6: product showcase. Show the 3D web app with optical bench, quantum dot, and spectrum analyzer. Highlight interactive controls, wavelength overlays, and the scientific dashboard."

### Slide 7: Verification, Impact & Future Directions
- **Slide Title:** Verified, Scalable, and Ready for the Next Stage
- **Key Content:**
  - TypeScript check and Vite production build verification
  - Zero per-frame garbage allocation design for stable WebGL performance
  - Pathway to multi-band IR arrays, empirical JWST line matching, and more advanced space payload concepts
- **Visuals:** Roadmap timeline with future scope and technical validation badges.
- **AI Slide Generator Prompt:**
  > "Slide 7: conclusion and roadmap. Show validation status, technical scalability, and future extension to wider wavelength coverage and real mission data integration. Clean and confident finish."

---

# SECTION 3: 30-Second & 2-Minute Video Pitch Scripts

### A. 30-Second Elevator Video Pitch
> **[0:00 - 0:08]** *(Visual: quantum dot lattice rotating in 3D, optical bench lit in cyan)*  
> "Space spectrographs are often limited by heavy, fixed optical components. Our project explores a better approach: tunable quantum dots."  
> **[0:08 - 0:18]** *(Visual: radius slider and bandgap shift animation)*  
> "By changing the nanocrystal radius, we tune the bandgap and align the emission peak with Doppler-shifted exoplanet atmosphere lines in real time."  
> **[0:18 - 0:30]** *(Visual: spectral graph and exoplanet transit overlay)*  
> "Quantum Dots in Projection brings this concept to life through a 3D scientific simulator that makes advanced space optics intuitive, interactive, and mission-relevant."

### B. 2-Minute Full Demonstration Video Script

- **Scene 1 [0:00 - 0:25] — The Scientific Problem**  
  *Visual:* Show the 3D optical bench and the concept of a fixed filter wheel.  
  *Voiceover:* "Traditional space spectrographs rely on heavy filter wheels and fixed optical elements. While effective, they are mechanically rigid and limited in how flexibly they can respond to changing wavelengths in the field."

- **Scene 2 [0:25 - 0:55] — Quantum Dots as a Tunable Solution**  
  *Visual:* Animate the nanocrystal core radius changing while the emission wavelength shifts.  
  *Voiceover:* "Quantum dots change the story. Because their bandgap is size-dependent, altering the nanocrystal radius changes the emission energy. That means one material platform can be tuned across a broad spectral range without needing a new fixed filter for every band."

- **Scene 3 [0:55 - 1:30] — Exoplanet Spectroscopy Context**  
  *Visual:* Show the transit model, atmospheric line absorption, and the shifted spectral signature.  
  *Voiceover:* "In exoplanet transit spectroscopy, molecules in the atmosphere leave narrow absorption lines on the host star's spectrum. These lines shift with Doppler motion and transit geometry. Our simulation shows how a quantum-dot emission profile can be matched to those features for enhanced spectral sensitivity."

- **Scene 4 [1:30 - 2:00] — Interactive Mission Visualization**  
  *Visual:* Show the spectral graph, user controls, and the 3D bench in the app.  
  *Voiceover:* "Quantum Dots in Projection turns this complex scientific concept into an interactive browser-based instrument. It demonstrates the physics, visualizes the spectral overlap, and makes the potential of tunable nanocrystal optics accessible to a broad audience—while still grounded in the technical realities of space instrumentation."

---

# SECTION 4: Submission Summary for Judges

Quantum Dots in Projection is a concept-driven scientific visualization for a future optical sensing architecture in space. It brings together nanophotonics, exoplanet atmospheric science, 3D visualization, and interactive interface design to demonstrate how size-tunable quantum dots could help build lighter, more flexible, and more adaptive spectroscopic hardware for next-generation orbital missions.

This project is intentionally designed to be both educational and technically credible: it explains the quantum confinement physics, models realistic photophysical behavior, and presents the system as an engineering concept grounded in open NASA and astronomy research traditions. It showcases how advanced science communication and interactive web engineering can make mission concepts more understandable, tangible, and compelling for judges and the public alike.

