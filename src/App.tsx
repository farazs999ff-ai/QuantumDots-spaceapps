import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Presentation } from 'lucide-react';
import { PresentationModal } from './components/PresentationModal';
import { QuantumProjectionLab } from './components/QuantumProjectionLab';
import { ResilientImage } from './components/ResilientImage';
import { PRESENTERS } from './presentation/deckData';
import HERO_IMAGE_SRC from './assets/images/hero_quantum_dot_nanocrystal_1794654157189.jpg';
import SPACE_IMAGE_SRC from './assets/images/space_exoplanet_spectroscopy_1794654159051.jpg';

const PROBLEMS_SOLVED = [
  {
    index: '01',
    title: 'Replacing Bulky Fixed Filter Wheels',
    problem:
      'Conventional space spectrographs depend on heavy mechanical filter wheels and fixed dichroic stacks that restrict wavelength flexibility.',
    solution:
      'Quantum dots continuously shift their absorption and photoluminescence bandgap across 380–780 nm (and into the NIR) simply by varying nanocrystal radius R without altering chemical composition.',
  },
  {
    index: '02',
    title: 'Suppressing Surface Trap Losses & Blinking',
    problem:
      'Bare nanoscale crystals suffer rapid non-radiative recombination at dangling surface bonds, degrading signal-to-noise under harsh orbital flux.',
    solution:
      'Epitaxial Type-I shell passivation (e.g., ZnS over CdSe or InP) confines the electron-hole wavefunction to the core, achieving 78%–92% quantum yield and narrow 19–34 nm linewidths.',
  },
  {
    index: '03',
    title: 'Recovering UV & Near-Infrared Detector Sensitivity',
    problem:
      'Standard silicon focal-plane arrays exhibit sharp quantum efficiency drop-offs in deep UV (< 400 nm) and near-IR atmospheric bands.',
    solution:
      'Quantum-dot luminescent down-conversion layers and small-bandgap colloidal films convert high-energy or NIR photons into matched sensor bands with minimal payload mass.',
  },
];

const SPACE_APPLICATIONS = [
  {
    title: 'Exoplanet Atmospheric Transit Spectroscopy',
    detail:
      'Tunable QD optical references and focal-plane sensors resolve Doppler-shifted absorption signatures (Fe I, H-beta, Mg I b, Na I D, H-alpha, O2 A-band, K I) as starlight filters through distant planetary limbs.',
  },
  {
    title: 'Radiation-Tolerant Space Photovoltaics',
    detail:
      'Multi-exciton generation and size-graded bandgap tandem stacks deliver high specific power (W/kg) while resisting proton and gamma displacement damage in deep-space orbits.',
  },
  {
    title: 'CubeSat & Optical Inter-Satellite Links',
    detail:
      'Narrow-FWHM colloidal emitters (19–26 nm) enable compact, wavelength-multiplexed laser telemetry and spectral calibration beacons on volume-constrained small satellites.',
  },
];

const QUANTUM_DOT_EQUATIONS = [
  {
    name: 'Brus Effective-Mass Quantum Confinement Equation',
    formula:
      'Eg(R) = E_bulk + [ hbar^2 * pi^2 / (2 * R^2) ] * (1 / m_e* + 1 / m_h*) - (1.8 * e^2) / (4 * pi * eps_0 * eps_r * R)',
    variables: [
      'Eg(R): Size-dependent effective bandgap energy (eV)',
      'E_bulk: Bulk semiconductor bandgap at 300 K (e.g., 1.74 eV for CdSe)',
      'm_e*, m_h*: Effective electron and hole masses; eps_r: relative permittivity',
      'R: Nanocrystal core radius (nm); kinetic confinement scales as 1 / R^2',
    ],
  },
  {
    name: 'Exciton Bohr Radius & Confinement Criterion',
    formula: 'a_B = a_0 * (eps_r * m_0 / mu*),   where   1 / mu* = 1 / m_e* + 1 / m_h*',
    variables: [
      'a_B: Spatial extent of the bound electron-hole pair (e.g., 4.88 nm in CdSe)',
      'Strong confinement occurs when R < 0.85 * a_B; weak when R > 1.6 * a_B',
    ],
  },
  {
    name: 'Planck–Einstein Transition & Stokes Shift',
    formula: 'lambda_abs = (h * c) / Eg(R),     lambda_em = lambda_abs + delta_Stokes',
    variables: [
      'h * c = 1239.84 eV·nm converts bandgap energy directly to absorption edge',
      'delta_Stokes: Non-radiative phonon relaxation shift to peak photoluminescence',
    ],
  },
  {
    name: 'Relativistic Doppler Redshift & Transmission Overlap',
    formula:
      'lambda_obs = lambda_rest * (1 + z),     v_r = c * [ (1 + z)^2 - 1 ] / [ (1 + z)^2 + 1 ]',
    variables: [
      'z: Exoplanet radial redshift shifting rest absorption lines toward longer wavelengths',
      'Lorentzian atmospheric troughs match QD Gaussian emission I_QD(lambda) at resonance',
    ],
  },
];

export default function App() {
  const [presentationOpen, setPresentationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100">
      {/* Sticky Single-Row Top Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#06080d]/95">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#about"
            className="text-base font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
          >
            Quantum Dots in Projection
          </a>

          {/* Zone 2: 4 Clean Single-Line Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
          >
            <a
              href="#about"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              About Quantum Dots
            </a>
            <a
              href="#space-and-equations"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Space &amp; Equations
            </a>
            <a
              href="#projection-3d"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              3D Visualization
            </a>
            <a
              href="#team"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Research Team
            </a>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setPresentationOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Presentation className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Slides (9)</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ================================================================
            PAGE 1: ABOUT QUANTUM DOTS (HERO & FUNDAMENTALS)
           ================================================================ */}
        <section id="about" className="mx-auto max-w-[1280px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <p className="text-xs font-mono uppercase tracking-wider text-sky-400">
                  Nanoscale Semiconductor Photophysics · Optical Sensing
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-50 leading-[1.12] [text-wrap:balance]">
                  Tunable Quantum Dots for Space Optical Projection
                </h1>
                <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                  Quantum dots (QDs) are colloidal semiconductor nanocrystals measuring{' '}
                  <span className="font-mono text-slate-100">2 to 10 nm</span> in diameter.
                  Because their dimensions are comparable to the material&apos;s exciton Bohr
                  radius, electrons and holes experience three-dimensional quantum confinement—turning
                  each crystal into an artificial atom with discrete, size-tunable energy levels.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                  By shrinking or expanding the core radius <span className="font-mono">R</span> of
                  epitaxially passivated nanocrystals such as{' '}
                  <span className="font-mono text-slate-200">CdSe / ZnS</span>,{' '}
                  <span className="font-mono text-slate-200">InP / ZnS</span>,{' '}
                  <span className="font-mono text-slate-200">CdTe / ZnS</span>, and{' '}
                  <span className="font-mono text-slate-200">CsPbBr3</span>, a single semiconductor
                  family emits narrow-band photoluminescence from deep violet to near-infrared
                  without changing chemical composition.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#projection-3d"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-slate-100 hover:bg-white rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore 3D Visualization</span>
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="#space-and-equations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Space Uses &amp; Equations</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <ResilientImage
                src={HERO_IMAGE_SRC}
                alt="Isometric scientific rendering of a core-shell semiconductor quantum dot crystal lattice inside an optical laser trap"
                caption="Core-shell semiconductor nanocrystal suspended inside a precision laboratory optical gimbal."
                className="h-full min-h-[320px] lg:min-h-[420px]"
              />
            </div>
          </div>

          {/* Quantitative Specification Strip */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 border border-slate-800 rounded-xl bg-[#090d16] divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="p-5">
              <div className="text-xs text-slate-400">Nanocrystal Core Radius</div>
              <div className="text-2xl font-mono font-semibold tabular-nums text-slate-100 mt-1">
                1.20 – 5.50 <span className="text-xs text-slate-400 font-normal">nm</span>
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs text-slate-400">Calibrated Spectral Range</div>
              <div className="text-2xl font-mono font-semibold tabular-nums text-sky-400 mt-1">
                380 – 780 <span className="text-xs text-slate-400 font-normal">nm</span>
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs text-slate-400">Passivated Quantum Yield</div>
              <div className="text-2xl font-mono font-semibold tabular-nums text-emerald-400 mt-1">
                78 – 92 <span className="text-xs text-slate-400 font-normal">% QY</span>
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs text-slate-400">Tracked Exoplanet Lines</div>
              <div className="text-2xl font-mono font-semibold tabular-nums text-slate-100 mt-1">
                7 <span className="text-xs text-slate-400 font-normal">Atomic &amp; O2 Bands</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PAGE 2: PROBLEMS SOLVED, SPACE EXPLORATION & EQUATIONS
           ================================================================ */}
        <section
          id="space-and-equations"
          className="border-t border-slate-800/90 bg-[#080b12] py-16 lg:py-20"
        >
          <div className="mx-auto max-w-[1280px] px-6 space-y-16">
            {/* 2A. Problems Solved by Quantum Dots */}
            <div>
              <div className="max-w-3xl mb-8">
                <p className="text-xs font-mono uppercase tracking-wider text-sky-400">
                  Engineering Solutions
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50 mt-2 [text-wrap:balance]">
                  Key Optical &amp; Detector Problems Solved by Quantum Dots
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROBLEMS_SOLVED.map((item) => (
                  <article
                    key={item.index}
                    className="border border-slate-800 rounded-xl bg-[#0a0f1a] p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-sky-400">{item.index}.</div>
                      <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        <span className="text-slate-200 font-medium">Challenge: </span>
                        {item.problem}
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed pt-3 border-t border-slate-800/80">
                      <span className="text-emerald-400 font-medium">QD Solution: </span>
                      {item.solution}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* 2B. Role in Space Exploration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch pt-4">
              <div className="lg:col-span-6">
                <ResilientImage
                  src={SPACE_IMAGE_SRC}
                  alt="Space telescope optical spectrometer dispersing starlight from an exoplanet atmospheric limb onto a focal-plane detector"
                  caption="Transmission spectroscopy across a transiting exoplanet atmospheric limb into a dispersive focal-plane sensor."
                  className="h-full min-h-[300px]"
                />
              </div>

              <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                    Aerospace &amp; Astrophysics Impact
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50 mt-2 [text-wrap:balance]">
                    How Quantum Dots Enable Next-Generation Space Exploration
                  </h2>
                </div>

                <div className="divide-y divide-slate-800 border-y border-slate-800">
                  {SPACE_APPLICATIONS.map((app) => (
                    <div key={app.title} className="py-4 space-y-1.5">
                      <h3 className="text-base font-semibold text-slate-100">{app.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{app.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2C. Mathematical Equations Used for Quantum Dots */}
            <div className="pt-4">
              <div className="max-w-3xl mb-8">
                <p className="text-xs font-mono uppercase tracking-wider text-sky-400">
                  Mathematical Foundation
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50 mt-2 [text-wrap:balance]">
                  Governing Equations Used in the Quantum Confinement &amp; Projection Model
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {QUANTUM_DOT_EQUATIONS.map((eq) => (
                  <div
                    key={eq.name}
                    className="border border-slate-800 rounded-xl bg-[#0a0f1a] p-6 space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-slate-100">{eq.name}</h3>
                    <div className="bg-[#060911] border border-slate-800 rounded-lg px-4 py-3 overflow-x-auto">
                      <code className="text-xs sm:text-sm font-mono text-sky-300 whitespace-nowrap">
                        {eq.formula}
                      </code>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed list-disc pl-4">
                      {eq.variables.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PAGE 3: EXACT 3D VISUALIZATION IN ACTION
           ================================================================ */}
        <section
          id="projection-3d"
          className="border-t border-slate-800/90 bg-[#06080d] py-14 lg:py-16"
        >
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-sky-400">
                  Interactive 3D Laboratory
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50 mt-1">
                  Quantum Dots in Projection — Live 3D Simulation
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Tune core radius <span className="font-mono text-slate-200">R</span>, excitation
                pump energy, or Doppler redshift <span className="font-mono text-slate-200">z</span>{' '}
                below, or click any absorption line in the spectrum chart to lock resonance.
              </p>
            </div>

            <QuantumProjectionLab />
          </div>
        </section>

        {/* ================================================================
            PAGE 4: RESEARCHER, WEB DEVELOPERS & TEAM CREDITS
           ================================================================ */}
        <section
          id="team"
          className="border-t border-slate-800/90 bg-[#080b12] py-16 lg:py-20"
        >
          <div className="mx-auto max-w-[1280px] px-6 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-sky-400">
                  Project Credits &amp; Attribution
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50 mt-1">
                  Researcher, Web Developers &amp; Team
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPresentationOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-100 border border-slate-700 hover:border-slate-500 rounded-md transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
              >
                <Presentation className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                <span>Open 9-Slide Team Presentation</span>
              </button>
            </div>

            {/* Primary Named Credits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-800 rounded-xl bg-[#0a0f1a] p-6 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-sky-400">
                  Researcher
                </div>
                <h3 className="text-xl font-bold text-slate-50">Abid Ali Leghari</h3>
                <a
                  className="text-sm text-sky-400 hover:underline"
                  href="mailto:abidalileghari8@gmail.com"
                >
                  abidalileghari8@gmail.com
                </a>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Quantum Dot Confinement Research, Brus Mathematical Modeling &amp; Space
                  Exploration Spectroscopy Formulation.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl bg-[#0a0f1a] p-6 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Web Developers
                </div>
                <h3 className="text-xl font-bold text-slate-50">
                  Gulfaraz Ahmed &amp; Niaz Hussain
                </h3>
                <a
                  className="text-sm text-emerald-400 hover:underline"
                  href="mailto:gulfaraz435175@gmail.com"
                >
                  gulfaraz435175@gmail.com
                </a>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Full-Stack Web Engineering, Three.js 3D Optical Projection Architecture, Shaders,
                  and Interactive Spectroscopy Instrumentation.
                </p>
              </div>
            </div>

            {/* 6-Member Team & Presentation Allocation */}
            <div className="border border-slate-800 rounded-xl bg-[#0a0f1a] p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-100">
                  Project &amp; Presentation Team (6 Members)
                </h3>
                <span className="text-xs text-slate-400">
                  Assigned across the 9-slide technical briefing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESENTERS.map((member) => (
                  <div
                    key={member.id}
                    className="border border-slate-800/90 rounded-lg bg-[#070a11] p-4 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-100">
                        {member.defaultName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{member.role}</div>
                    </div>
                    <span className="text-xs font-mono text-sky-400 whitespace-nowrap shrink-0">
                      Slides {member.slideNumbers.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/90 bg-[#06080d] py-6">
        <div className="mx-auto max-w-[1280px] px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Quantum Dots in Projection · Researcher: Abid Ali Leghari · Web Developers: Gulfaraz
            Ahmed &amp; Niaz Hussain
          </span>
          <span className="font-mono text-slate-500">380–780 nm Brus &amp; Doppler Engine</span>
        </div>
      </footer>

      <PresentationModal open={presentationOpen} onClose={() => setPresentationOpen(false)} />
    </div>
  );
}
