export type MaterialId = 'cdse' | 'inp' | 'cdte' | 'cspbbr3';

export interface SemiconductorMaterial {
  id: MaterialId;
  name: string;
  shell: string;
  latticeType: string;
  /** Lattice constant in nm for atomic visual scaling */
  latticeConstantNm: number;
  /** Bulk bandgap at 300 K (eV) */
  bulkBandgapEv: number;
  /** Effective electron mass (m_e* / m_0) */
  effectiveElectronMass: number;
  /** Effective hole mass (m_h* / m_0) */
  effectiveHoleMass: number;
  /** Static relative permittivity (epsilon_r) */
  dielectricConstant: number;
  /** Typical ensemble Stokes shift (nm) */
  stokesShiftNm: number;
  /** Typical photoluminescence FWHM (nm) */
  fwhmNm: number;
  /** Peak photoluminescence quantum yield (0..1) */
  peakQuantumYield: number;
  /** Cation / Anion display colors for crystal lattice */
  cationHex: number;
  anionHex: number;
}

export interface AtmosphericSpecies {
  id: string;
  symbol: string;
  name: string;
  restWavelengthNm: number;
  lineWidthNm: number;
  opticalDepth: number;
  accentHex: string;
}

export interface SpectralMatch {
  species: AtmosphericSpecies;
  shiftedWavelengthNm: number;
  detuningNm: number;
  overlapStrength: number;
}

export interface QuantumSimulationState {
  material: SemiconductorMaterial;
  radiusNm: number;
  excitationEv: number;
  excitationWavelengthNm: number;
  redshiftZ: number;
  radialVelocityKmS: number;
  /** Effective bandgap E_g(R) from Brus equation (eV) */
  bandgapEv: number;
  /** Kinetic confinement energy term (eV) */
  confinementTermEv: number;
  /** Exciton Coulomb binding correction (eV) */
  coulombTermEv: number;
  /** Exciton Bohr radius (nm) */
  bohrRadiusNm: number;
  confinementRegime: 'Strong' | 'Intermediate' | 'Weak';
  /** First exciton absorption edge (nm) */
  absorptionEdgeNm: number;
  /** Stokes-shifted photoluminescence peak (nm) */
  emissionWavelengthNm: number;
  /** Excess energy above bandgap relaxed as phonons (eV) */
  thermalizationLossEv: number;
  isEmitting: boolean;
  /** Effective luminescence efficiency (0..1) */
  emissionIntensity: number;
  emissionColor: {
    r: number;
    g: number;
    b: number;
    hex: number;
    css: string;
  };
  excitationColor: {
    r: number;
    g: number;
    b: number;
    hex: number;
    css: string;
  };
  shiftedLines: Array<{
    species: AtmosphericSpecies;
    shiftedWavelengthNm: number;
    inWindow: boolean;
  }>;
  activeMatch: SpectralMatch | null;
}

export const HC_EV_NM = 1239.84193;
export const SPECTRUM_MIN_NM = 380;
export const SPECTRUM_MAX_NM = 780;
export const RADIUS_MIN_NM = 1.2;
export const RADIUS_MAX_NM = 5.5;

const KINETIC_PREFACTOR_EV_NM2 = 0.376030; // (hbar * pi)^2 / (2 * m_0 * e * 1e-18)
const COULOMB_PREFACTOR_EV_NM = 2.591936; // 1.8 * e / (4 * pi * eps_0 * 1e-9)
const BOHR_HYDROGEN_NM = 0.0529177;
const SPEED_OF_LIGHT_KM_S = 299792.458;

export const SEMICONDUCTOR_MATERIALS: Record<MaterialId, SemiconductorMaterial> = {
  cdse: {
    id: 'cdse',
    name: 'CdSe / ZnS',
    shell: 'ZnS Passivated',
    latticeType: 'Zinc-Blende',
    latticeConstantNm: 0.605,
    bulkBandgapEv: 1.74,
    effectiveElectronMass: 0.13,
    effectiveHoleMass: 0.45,
    dielectricConstant: 9.3,
    stokesShiftNm: 14,
    fwhmNm: 26,
    peakQuantumYield: 0.88,
    cationHex: 0xd4a373,
    anionHex: 0x64748b,
  },
  inp: {
    id: 'inp',
    name: 'InP / ZnS',
    shell: 'ZnS Heavy-Metal-Free',
    latticeType: 'Zinc-Blende',
    latticeConstantNm: 0.587,
    bulkBandgapEv: 1.34,
    effectiveElectronMass: 0.08,
    effectiveHoleMass: 0.6,
    dielectricConstant: 12.5,
    stokesShiftNm: 18,
    fwhmNm: 34,
    peakQuantumYield: 0.78,
    cationHex: 0x94a3b8,
    anionHex: 0xe11d48,
  },
  cdte: {
    id: 'cdte',
    name: 'CdTe / ZnS',
    shell: 'ZnS Type-I',
    latticeType: 'Zinc-Blende',
    latticeConstantNm: 0.648,
    bulkBandgapEv: 1.44,
    effectiveElectronMass: 0.1,
    effectiveHoleMass: 0.4,
    dielectricConstant: 10.2,
    stokesShiftNm: 16,
    fwhmNm: 28,
    peakQuantumYield: 0.82,
    cationHex: 0xd4a373,
    anionHex: 0x7c3aed,
  },
  cspbbr3: {
    id: 'cspbbr3',
    name: 'CsPbBr3',
    shell: 'Oleylammonium Capped',
    latticeType: 'Cubic Perovskite',
    latticeConstantNm: 0.583,
    bulkBandgapEv: 2.36,
    effectiveElectronMass: 0.15,
    effectiveHoleMass: 0.14,
    dielectricConstant: 4.9,
    stokesShiftNm: 10,
    fwhmNm: 19,
    peakQuantumYield: 0.92,
    cationHex: 0x38bdf8,
    anionHex: 0xf59e0b,
  },
};

export const ATMOSPHERIC_LINES: AtmosphericSpecies[] = [
  {
    id: 'fe1',
    symbol: 'Fe I',
    name: 'Neutral Iron (G-band)',
    restWavelengthNm: 430.79,
    lineWidthNm: 4.2,
    opticalDepth: 0.52,
    accentHex: '#60a5fa',
  },
  {
    id: 'hbeta',
    symbol: 'H-beta',
    name: 'Hydrogen Balmer Beta',
    restWavelengthNm: 486.13,
    lineWidthNm: 4.8,
    opticalDepth: 0.64,
    accentHex: '#22d3ee',
  },
  {
    id: 'mg1',
    symbol: 'Mg I b',
    name: 'Magnesium Triplet',
    restWavelengthNm: 517.27,
    lineWidthNm: 4.0,
    opticalDepth: 0.45,
    accentHex: '#34d399',
  },
  {
    id: 'na1',
    symbol: 'Na I D',
    name: 'Sodium D Doublet',
    restWavelengthNm: 589.29,
    lineWidthNm: 5.2,
    opticalDepth: 0.78,
    accentHex: '#fbbf24',
  },
  {
    id: 'halpha',
    symbol: 'H-alpha',
    name: 'Hydrogen Balmer Alpha',
    restWavelengthNm: 656.28,
    lineWidthNm: 5.5,
    opticalDepth: 0.82,
    accentHex: '#f87171',
  },
  {
    id: 'o2a',
    symbol: 'O2 A',
    name: 'Molecular Oxygen A-Band',
    restWavelengthNm: 759.37,
    lineWidthNm: 6.0,
    opticalDepth: 0.72,
    accentHex: '#ef4444',
  },
  {
    id: 'k1',
    symbol: 'K I',
    name: 'Potassium Resonance',
    restWavelengthNm: 766.49,
    lineWidthNm: 4.6,
    opticalDepth: 0.61,
    accentHex: '#dc2626',
  },
];

/**
 * Bruton / CIE-approximated monochromatic wavelength (nm) to sRGB conversion.
 */
export function wavelengthToColor(wavelengthNm: number): {
  r: number;
  g: number;
  b: number;
  hex: number;
  css: string;
} {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0.0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1.0;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else if (wavelengthNm < 380) {
    // Near-UV deep violet representation
    r = 0.45;
    g = 0.12;
    b = 0.92;
  } else {
    // Near-IR deep crimson representation
    r = 0.55;
    g = 0.06;
    b = 0.06;
  }

  let attenuation = 1.0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    attenuation = 0.35 + (0.65 * (wavelengthNm - 380)) / (420 - 380);
  } else if (wavelengthNm > 700 && wavelengthNm <= 780) {
    attenuation = 0.35 + (0.65 * (780 - wavelengthNm)) / (780 - 700);
  } else if (wavelengthNm < 380 || wavelengthNm > 780) {
    attenuation = 0.55;
  }

  const gamma = 0.8;
  const R = r === 0 ? 0 : Math.round(255 * Math.pow(r * attenuation, gamma));
  const G = g === 0 ? 0 : Math.round(255 * Math.pow(g * attenuation, gamma));
  const B = b === 0 ? 0 : Math.round(255 * Math.pow(b * attenuation, gamma));

  return {
    r: R / 255,
    g: G / 255,
    b: B / 255,
    hex: (R << 16) | (G << 8) | B,
    css: `rgb(${R}, ${G}, ${B})`,
  };
}

export function computeBandgapEv(material: SemiconductorMaterial, radiusNm: number): {
  bandgapEv: number;
  confinementTermEv: number;
  coulombTermEv: number;
  bohrRadiusNm: number;
} {
  const invMass = 1 / material.effectiveElectronMass + 1 / material.effectiveHoleMass;
  const reducedMass = 1 / invMass;
  const bohrRadiusNm = BOHR_HYDROGEN_NM * (material.dielectricConstant / reducedMass);

  const confinementTermEv = (KINETIC_PREFACTOR_EV_NM2 * invMass) / (radiusNm * radiusNm);
  const coulombTermEv = COULOMB_PREFACTOR_EV_NM / (material.dielectricConstant * radiusNm);
  const bandgapEv = Math.max(material.bulkBandgapEv, material.bulkBandgapEv + confinementTermEv - coulombTermEv);

  return {
    bandgapEv,
    confinementTermEv,
    coulombTermEv,
    bohrRadiusNm,
  };
}

export function computeQuantumSimulation(
  materialId: MaterialId,
  radiusNm: number,
  excitationEv: number,
  redshiftZ: number,
): QuantumSimulationState {
  const material = SEMICONDUCTOR_MATERIALS[materialId];
  const { bandgapEv, confinementTermEv, coulombTermEv, bohrRadiusNm } = computeBandgapEv(
    material,
    radiusNm,
  );

  const absorptionEdgeNm = HC_EV_NM / bandgapEv;
  const emissionWavelengthNm = absorptionEdgeNm + material.stokesShiftNm;
  const excitationWavelengthNm = HC_EV_NM / excitationEv;

  const isEmitting = excitationEv >= bandgapEv;
  const thermalizationLossEv = Math.max(0, excitationEv - bandgapEv);

  // Smooth turn-on near the band edge (Urbach tail ~0.04 eV) + gentle high-energy saturation
  const thresholdFactor = isEmitting
    ? Math.min(1, 0.35 + (excitationEv - bandgapEv) / 0.25)
    : 0;
  const emissionIntensity = isEmitting ? material.peakQuantumYield * thresholdFactor : 0;

  let confinementRegime: 'Strong' | 'Intermediate' | 'Weak' = 'Intermediate';
  if (radiusNm < bohrRadiusNm * 0.85) {
    confinementRegime = 'Strong';
  } else if (radiusNm > bohrRadiusNm * 1.6) {
    confinementRegime = 'Weak';
  }

  // Relativistic Doppler radial velocity: (1 + z)^2 = (1 + beta) / (1 - beta)
  const op = Math.pow(1 + redshiftZ, 2);
  const beta = (op - 1) / (op + 1);
  const radialVelocityKmS = beta * SPEED_OF_LIGHT_KM_S;

  const emissionColor = wavelengthToColor(emissionWavelengthNm);
  const excitationColor = wavelengthToColor(excitationWavelengthNm);

  const shiftedLines = ATMOSPHERIC_LINES.map((species) => {
    const shiftedWavelengthNm = species.restWavelengthNm * (1 + redshiftZ);
    return {
      species,
      shiftedWavelengthNm,
      inWindow: shiftedWavelengthNm >= SPECTRUM_MIN_NM && shiftedWavelengthNm <= SPECTRUM_MAX_NM,
    };
  });

  // Match occurs when QD is emitting and FWHM Gaussian overlaps a shifted line within ~12 nm
  let activeMatch: SpectralMatch | null = null;
  if (isEmitting) {
    const sigma = material.fwhmNm / 2.35482;
    let bestOverlap = 0;

    for (const line of shiftedLines) {
      if (!line.inWindow) continue;
      const detuningNm = emissionWavelengthNm - line.shiftedWavelengthNm;
      const absDetuning = Math.abs(detuningNm);
      if (absDetuning <= Math.max(10, material.fwhmNm * 0.45)) {
        const overlapStrength = Math.exp(-(detuningNm * detuningNm) / (2 * sigma * sigma));
        if (overlapStrength > bestOverlap) {
          bestOverlap = overlapStrength;
          activeMatch = {
            species: line.species,
            shiftedWavelengthNm: line.shiftedWavelengthNm,
            detuningNm,
            overlapStrength,
          };
        }
      }
    }
  }

  return {
    material,
    radiusNm,
    excitationEv,
    excitationWavelengthNm,
    redshiftZ,
    radialVelocityKmS,
    bandgapEv,
    confinementTermEv,
    coulombTermEv,
    bohrRadiusNm,
    confinementRegime,
    absorptionEdgeNm,
    emissionWavelengthNm,
    thermalizationLossEv,
    isEmitting,
    emissionIntensity,
    emissionColor,
    excitationColor,
    shiftedLines,
    activeMatch,
  };
}

/**
 * Solves for nanocrystal radius R (nm) that places the Stokes-shifted emission peak
 * at targetWavelengthNm, clamped to [RADIUS_MIN_NM, RADIUS_MAX_NM].
 */
export function solveRadiusForEmissionWavelength(
  material: SemiconductorMaterial,
  targetWavelengthNm: number,
): number | null {
  const targetAbsorptionNm = targetWavelengthNm - material.stokesShiftNm;
  if (targetAbsorptionNm <= 150) return null;

  const minEg = computeBandgapEv(material, RADIUS_MAX_NM).bandgapEv;
  const maxEg = computeBandgapEv(material, RADIUS_MIN_NM).bandgapEv;
  const targetEg = HC_EV_NM / targetAbsorptionNm;

  if (targetEg < minEg - 0.02 || targetEg > maxEg + 0.02) {
    return null;
  }

  let lo = RADIUS_MIN_NM;
  let hi = RADIUS_MAX_NM;
  for (let i = 0; i < 36; i++) {
    const mid = 0.5 * (lo + hi);
    const egMid = computeBandgapEv(material, mid).bandgapEv;
    if (egMid > targetEg) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return Math.round(((lo + hi) * 0.5) * 100) / 100;
}

/**
 * Evaluates normalized exoplanet transmission continuum (0..1) at wavelength wlNm,
 * incorporating Lorentzian absorption troughs for all atmospheric species.
 */
export function evaluateTransmissionFlux(
  wlNm: number,
  shiftedLines: QuantumSimulationState['shiftedLines'],
): number {
  // Subtle Rayleigh scattering slope toward blue wavelengths
  const rayleigh = 0.96 - 0.08 * Math.pow((SPECTRUM_MAX_NM - wlNm) / (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM), 2);
  let absorption = 0;

  for (const line of shiftedLines) {
    const gamma = line.species.lineWidthNm;
    const delta = wlNm - line.shiftedWavelengthNm;
    const lorentz = (gamma * gamma) / (delta * delta + gamma * gamma);
    absorption += line.species.opticalDepth * lorentz;
  }

  return Math.max(0.08, Math.min(1, rayleigh * (1 - Math.min(0.88, absorption))));
}
