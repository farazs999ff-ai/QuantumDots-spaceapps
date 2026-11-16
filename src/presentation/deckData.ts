export interface PresenterProfile {
  id: number;
  defaultName: string;
  role: string;
  slideNumbers: number[];
}

export interface SlideStat {
  label: string;
  value: string;
  unit?: string;
}

export interface SlideColumn {
  heading: string;
  items: string[];
}

export interface PresentationSlide {
  number: number;
  presenterIndex: number; // 0..5
  kicker: string;
  title: string;
  subtitle: string;
  layout: 'title' | 'flow' | 'equation' | 'table' | 'split' | 'roadmap';
  bullets?: string[];
  columns?: SlideColumn[];
  stats?: SlideStat[];
  equation?: {
    formula: string;
    caption: string;
    terms: Array<{ symbol: string; meaning: string }>;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
  flowSteps?: Array<{ step: string; title: string; detail: string }>;
  speakerNotes: string;
}

export const PRESENTERS: PresenterProfile[] = [
  {
    id: 1,
    defaultName: 'Abid Ali Leghari',
    role: 'Project Lead & Optical Concept',
    slideNumbers: [1, 2],
  },
  {
    id: 2,
    defaultName: 'Iqra Bhatti',
    role: 'Quantum Confinement & Materials',
    slideNumbers: [3, 4],
  },
  {
    id: 3,
    defaultName: 'Samreen',
    role: 'Exoplanet Spectroscopy & Doppler',
    slideNumbers: [5],
  },
  {
    id: 4,
    defaultName: 'Niaz Hussain',
    role: '3D Nanocrystal & Shader Engineer',
    slideNumbers: [6, 7],
  },
  {
    id: 5,
    defaultName: 'Gulfaraz Ahmed',
    role: 'Spectrum Analyzer & UI Systems',
    slideNumbers: [8],
  },
  {
    id: 6,
    defaultName: 'Antisha Zahra',
    role: 'Performance, Verification & Roadmap',
    slideNumbers: [9],
  },
];

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    number: 1,
    presenterIndex: 0,
    kicker: 'Slide 01 of 09',
    title: 'Quantum Dots in Projection',
    subtitle:
      'Tunable Core-Shell Nanocrystal Sensors for Doppler-Shifted Exoplanet Transmission Spectroscopy',
    layout: 'title',
    stats: [
      { label: 'Spectral Window', value: '380 - 780', unit: 'nm' },
      { label: 'Core Radius Range', value: '1.20 - 5.50', unit: 'nm' },
      { label: 'Material Systems', value: '4', unit: 'Presets' },
      { label: 'Target Gas Lines', value: '7', unit: 'Species' },
    ],
    bullets: [
      'Couples nanoscale semiconductor quantum confinement directly with exoplanet atmospheric spectroscopy.',
      'Replaces static optical filters with size-tunable colloidal quantum dots on a 3D focal-plane bench.',
      'Built as a modular React, TypeScript, and Three.js WebGL scientific instrument.',
    ],
    speakerNotes:
      'Welcome everyone. Today our six-member team presents "Quantum Dots in Projection," an interactive 3D optical spectroscopy simulation. We connect how tuning the physical radius of a semiconductor nanocrystal shifts its photoluminescence wavelength to lock onto Doppler-shifted absorption lines in a transiting exoplanet atmosphere. I will cover the mission concept, followed by our team across physics, spectroscopy, 3D rendering, UI instrumentation, and verification.',
  },
  {
    number: 2,
    presenterIndex: 0,
    kicker: 'Slide 02 of 09',
    title: 'Motivation & Optical Projection Architecture',
    subtitle: 'End-to-end physical chain from transiting exoplanet starlight to nanocrystal resonance',
    layout: 'flow',
    flowSteps: [
      {
        step: '01',
        title: 'Host Star & Exoplanet Limb',
        detail:
          'Broadband stellar continuum passes through the planet upper atmosphere, imprinting narrow gas absorption troughs.',
      },
      {
        step: '02',
        title: 'Collimator & Blazed Grating',
        detail:
          'Incoming light passes through an optical slit and disperses across a calibrated 380-780 nm projection baffle.',
      },
      {
        step: '03',
        title: 'Pump-Excited Quantum Dot',
        detail:
          'An excitation source (E_ex >= E_g) generates confined electron-hole pairs inside a ZnS-passivated core.',
      },
      {
        step: '04',
        title: 'Spectral Resonance Lock',
        detail:
          'Adjusting core radius R aligns the Stokes-shifted QD emission envelope with a Doppler-shifted target line.',
      },
    ],
    bullets: [
      'Traditional space spectrometers rely on fixed gratings and discrete bandpass filters.',
      'Colloidal quantum dots offer continuous spectral tunability via particle radius alone, without changing chemistry.',
    ],
    speakerNotes:
      'Why combine quantum dots with exoplanet spectroscopy? When a planet transits its host star, trace gases absorb specific wavelengths. On our optical bench, starlight disperses onto a focal-plane projection screen while a core-shell quantum dot acts as an active tunable reference emitter. By varying radius R, we match the QD emission peak directly to shifted planetary lines.',
  },
  {
    number: 3,
    presenterIndex: 1,
    kicker: 'Slide 03 of 09',
    title: 'Brus Equation & Quantum Confinement',
    subtitle: 'Size-dependent semiconductor bandgap governed by carrier effective mass and dielectric screening',
    layout: 'equation',
    equation: {
      formula: 'Eg(R) = E_bulk + [ hbar^2 * pi^2 / (2 * R^2) ] * (1/m_e* + 1/m_h*) - 1.8 * e^2 / (4 * pi * eps_0 * eps_r * R)',
      caption: 'Effective-mass Brus approximation implemented in quantumConfinement.ts (eV, nm)',
      terms: [
        { symbol: 'E_bulk', meaning: 'Bulk semiconductor bandgap at 300 K (eV)' },
        { symbol: '1 / R^2', meaning: 'Kinetic quantum confinement energy scaling inversely with radius squared' },
        { symbol: 'm_e*, m_h*', meaning: 'Effective electron and hole masses relative to free electron mass m_0' },
        { symbol: '1 / (eps_r * R)', meaning: 'Dielectric-screened electron-hole Coulomb attraction correction' },
      ],
    },
    stats: [
      { label: 'Planck Constant hc/e', value: '1239.84', unit: 'eV·nm' },
      { label: 'Confinement Regimes', value: '3', unit: 'Strong / Int / Weak' },
      { label: 'Bohr Criterion', value: 'R < 0.85 aB', unit: 'Strong Regime' },
    ],
    speakerNotes:
      'Moving to the core quantum physics: our simulation uses the Brus equation rather than arbitrary constants. As radius R shrinks below the exciton Bohr radius a_B, the 1/R^2 kinetic confinement term widens the effective bandgap Eg, shifting emission toward blue wavelengths, partially offset by the 1/R Coulomb attraction term.',
  },
  {
    number: 4,
    presenterIndex: 1,
    kicker: 'Slide 04 of 09',
    title: 'Core-Shell Materials & Photoluminescence',
    subtitle: 'Four calibrated nanocrystal presets with Stokes shifts, FWHM linewidths, and pump thresholds',
    layout: 'table',
    table: {
      headers: ['Material System', 'E_bulk (eV)', 'Bohr a_B (nm)', 'Stokes (nm)', 'FWHM (nm)', 'Peak QY'],
      rows: [
        ['CdSe / ZnS (Zinc-Blende)', '1.74', '4.88', '14', '26', '88%'],
        ['InP / ZnS (Heavy-Metal-Free)', '1.34', '9.37', '18', '34', '78%'],
        ['CdTe / ZnS (Type-I)', '1.44', '6.75', '16', '28', '82%'],
        ['CsPbBr3 (Cubic Perovskite)', '2.36', '3.58', '10', '19', '92%'],
      ],
    },
    bullets: [
      'Excitation Threshold: Pump photon energy E_ex must exceed Eg(R); excess (E_ex - Eg) relaxes via phonons.',
      'Realistic Spectral Profile: Emission peaks are Stokes-shifted from the absorption edge with finite Gaussian FWHM.',
      'Near-IR Reach: InP/ZnS and CdTe/ZnS extend coverage to O2 A-band (759.4 nm) and K I (766.5 nm).',
    ],
    speakerNotes:
      'We modeled four realistic nanocrystal systems. CdSe/ZnS spans the visible spectrum cleanly, while InP/ZnS offers a larger 9.37 nm Bohr radius that reaches the near-infrared O2 A-band. CsPbBr3 perovskite gives ultra-narrow 19 nm linewidth in the blue-green region. Notice also that photoluminescence only activates when pump energy E_ex exceeds Eg(R).',
  },
  {
    number: 5,
    presenterIndex: 2,
    kicker: 'Slide 05 of 09',
    title: 'Exoplanet Spectra & Relativistic Doppler Shift',
    subtitle: 'Resolving Lorentzian atmospheric absorption troughs under radial velocity redshift',
    layout: 'split',
    columns: [
      {
        heading: 'Tracked Atmospheric Species',
        items: [
          'Fe I (430.79 nm) — Neutral Iron G-band',
          'H-beta (486.13 nm) & H-alpha (656.28 nm) — Balmer series',
          'Mg I b (517.27 nm) — Magnesium triplet',
          'Na I D (589.29 nm) — Sodium doublet (strong alkali signature)',
          'O2 A-band (759.37 nm) & K I (766.49 nm) — Near-IR biosignature & potassium',
        ],
      },
      {
        heading: 'Doppler & Overlap Detection',
        items: [
          'Observed line shift: lambda_obs = lambda_rest * (1 + z) across z = 0.000 to 0.250.',
          'Exact relativistic velocity: v_r = c * ((1+z)^2 - 1) / ((1+z)^2 + 1) up to ~66,000 km/s.',
          'Lorentzian optical depth profiles superimposed on a Rayleigh-sloped stellar continuum.',
          'Resonance lock evaluates the Gaussian-Lorentzian overlap integral within +/- 0.45 FWHM.',
        ],
      },
    ],
    speakerNotes:
      'On the astronomical side, we simulate seven real visible and near-infrared absorption lines commonly targeted in exoplanet transit spectroscopy. Each line forms a Lorentzian dip on a Rayleigh-sloped continuum. As the user increases redshift z, lines shift toward longer wavelengths and our engine computes exact relativistic radial velocity and Gaussian overlap strength.',
  },
  {
    number: 6,
    presenterIndex: 3,
    kicker: 'Slide 06 of 09',
    title: '3D Nanocrystal Lattice & Optical Bench',
    subtitle: 'Multi-part Three.js composite assemblies grounded on a calibrated laboratory stage',
    layout: 'split',
    columns: [
      {
        heading: 'Core-Shell Quantum Dot Assembly',
        items: [
          'Zinc-Blende Atomic Lattice: InstancedMesh cation/anion sublattices dynamically clipped to physical radius R.',
          'Epitaxial ZnS Shell: Transmissive MeshPhysicalMaterial (IOR 2.36, clearcoat 1.0) with fallback for software WebGL.',
          '64 Surface Ligands: Fibonacci-sphere distributed hydrocarbon chains anchored to shell facets.',
          '1S Exciton Shader: Custom GLSL radial standing-wave probability envelope oscillating with bandgap frequency.',
        ],
      },
      {
        heading: 'Grounded Laboratory Hardware',
        items: [
          'Anodized aluminum optical breadboard rail with brushed dovetail tracks and soft radial contact shadow.',
          'Lathe-turned pedestal, brushed titanium gimbal ring, and side trunnion posts.',
          'Collimated excitation laser aperture and streaming InstancedMesh emission wavepackets.',
          'RoomEnvironment PMREM image-based reflections paired with warm/cool 3-point lighting.',
        ],
      },
    ],
    speakerNotes:
      'In Three.js, we replaced simple primitive spheres with physically grounded multi-part hardware. Inside the faceted nanocrystal core, an instanced zinc-blende atomic lattice adds or removes atomic shells as radius R changes. Around it sit the epitaxial ZnS shell, 64 organic passivation ligands, and a custom GLSL standing-wave shader for the confined 1S exciton.',
  },
  {
    number: 7,
    presenterIndex: 3,
    kicker: 'Slide 07 of 09',
    title: 'Projection Screen & Planetary Limb Shaders',
    subtitle: 'Real-time focal-plane CanvasTexture dispersion and Fresnel atmospheric scattering',
    layout: 'split',
    columns: [
      {
        heading: '3D Focal-Plane Projection Screen',
        items: [
          'Collimator slit and blazed diffraction grating direct the optical beam onto a tilted projection baffle.',
          'High-DPI 1024x384 CanvasTexture repaints live whenever radius, material, or redshift changes.',
          'Displays continuous wavelength-colored flux, dark absorption troughs, and the glowing QD FWHM band.',
        ],
      },
      {
        heading: 'Procedural Exoplanet & Starfield',
        items: [
          '1024x512 procedural zonal jet cloud-deck texture with anisotropic filtering (no external image assets).',
          'Custom GLSL BackSide Fresnel limb shader simulates Rayleigh scattering and glows on resonance lock.',
          '1,400-star background colored by realistic Planckian stellar temperature classes (O/B through K/M).',
        ],
      },
    ],
    speakerNotes:
      'To visualize "Quantum Dots in Projection" directly in 3D space, the emitted light passes a collimator slit and blazed grating onto a calibrated projection screen. Its CanvasTexture updates dynamically with absorption troughs and the QD reticle. Behind the bench, our procedural exoplanet uses a custom Fresnel limb shader that illuminates in the matched wavelength when resonance locks.',
  },
  {
    number: 8,
    presenterIndex: 4,
    kicker: 'Slide 08 of 09',
    title: 'Interactive Spectrum Analyzer & Instrument UI',
    subtitle: 'Unobstructed 3D viewport paired with a collapsible bottom telemetry and control dock',
    layout: 'split',
    columns: [
      {
        heading: 'Precision Ergonomics & Typography',
        items: [
          'Full-screen WebGL canvas with zero mid-screen side cards or backdrop-blur stalls.',
          'Collapsible bottom dock (H shortcut) housing all readouts, SVG spectrum plot, and parameter sliders.',
          'IBM Plex Sans and IBM Plex Mono with tabular-nums prevent numeric layout jitter during live scrubbing.',
        ],
      },
      {
        heading: 'Interactive Analytical Features',
        items: [
          'Crosshair hover probe reports exact wavelength (nm), photon energy (eV), and transmittance (%).',
          'Click-to-Tune: Clicking any spectral line label runs binary search (solveRadiusForEmissionWavelength) to auto-set R.',
          'Four damped camera presets (Overview, Quantum Dot, Projection, Exoplanet) yield immediately on OrbitControls drag.',
        ],
      },
    ],
    speakerNotes:
      'For the user interface, we removed obstructive floating glass panels so the 3D optical bench remains 100% clear. All controls live in a collapsible bottom dock with tabular monospace metrics. Users can hover the SVG spectrum plot to inspect exact transmittance, or click any gas label to solve the Brus equation inversely and auto-tune the quantum dot radius.',
  },
  {
    number: 9,
    presenterIndex: 5,
    kicker: 'Slide 09 of 09',
    title: 'Verification, Performance & Future Scope',
    subtitle: 'Production WebGL engineering safeguards and roadmap toward multi-band infrared arrays',
    layout: 'roadmap',
    columns: [
      {
        heading: 'Engineering & Runtime Safeguards',
        items: [
          'Software-WebGL detection paces headless/CPU rendering via WebGL2 fenceSync afterDraw loop.',
          'Zero per-frame garbage collection using pre-allocated scratch vectors, matrices, and quaternions.',
          'Full geometry, material, texture, and composer disposal on unmount plus webglcontextlost recovery.',
          'Verified cleanly with TypeScript strict check (tsc --noEmit) and Vite production build.',
        ],
      },
      {
        heading: 'Scientific Extensions & Roadmap',
        items: [
          'Extend Brus parameters to PbS and HgTe colloidal dots covering 1.0-2.5 um infrared H2O, CH4, and CO2 bands.',
          'Simulate multi-pixel gradient QD focal-plane arrays for simultaneous single-shot spectral readout.',
          'Import real FITS / JWST exoplanet transit transmission datasets for empirical bench validation.',
        ],
      },
    ],
    stats: [
      { label: 'GC Allocations / Frame', value: '0', unit: 'Objects' },
      { label: 'Build & Type Check', value: 'Pass', unit: 'tsc + vite' },
      { label: 'External Asset 404s', value: '0', unit: '100% Procedural' },
    ],
    speakerNotes:
      'To wrap up, our codebase is engineered for reliability across both hardware GPUs and software WebGL environments using fence-synchronized pacing, zero per-frame object allocations, and complete resource cleanup. Looking ahead, extending this framework to PbS/HgTe infrared quantum dots and importing real JWST transit spectra will bridge educational simulation and mission instrumentation. Thank you—we welcome your questions.',
  },
];
