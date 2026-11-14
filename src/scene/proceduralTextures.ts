import * as THREE from 'three';
import {
  QuantumSimulationState,
  SPECTRUM_MAX_NM,
  SPECTRUM_MIN_NM,
  evaluateTransmissionFlux,
  wavelengthToColor,
} from '../physics/quantumConfinement';

/**
 * Generates an equirectangular gas-giant / sub-Neptune atmospheric cloud-deck albedo texture.
 */
export function createExoplanetAlbedoTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Base deep atmospheric gradient across latitude
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0.0, '#17233b');
  grad.addColorStop(0.18, '#243a5e');
  grad.addColorStop(0.32, '#34557a');
  grad.addColorStop(0.45, '#1d324d');
  grad.addColorStop(0.55, '#41658a');
  grad.addColorStop(0.7, '#274060');
  grad.addColorStop(0.85, '#1b2c47');
  grad.addColorStop(1.0, '#111b2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Deterministic pseudo-random zonal jet bands and anticyclonic eddies
  let seed = 4219;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 64; i++) {
    const y = rand() * height;
    const bandH = 3 + rand() * 14;
    const alpha = 0.06 + rand() * 0.14;
    const warmTint = rand() > 0.65;
    ctx.fillStyle = warmTint
      ? `rgba(196, 168, 132, ${alpha.toFixed(3)})`
      : `rgba(148, 197, 232, ${alpha.toFixed(3)})`;
    ctx.fillRect(0, y, width, bandH);
  }

  // Soft turbulent streaks along longitude
  for (let i = 0; i < 140; i++) {
    const x = rand() * width;
    const y = 40 + rand() * (height - 80);
    const len = 30 + rand() * 160;
    const thickness = 1.5 + rand() * 4;
    ctx.fillStyle = `rgba(226, 238, 250, ${(0.04 + rand() * 0.08).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(x, y, len, thickness, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle oval storm vortex
  ctx.save();
  ctx.translate(width * 0.62, height * 0.39);
  const stormGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
  stormGrad.addColorStop(0, 'rgba(218, 178, 138, 0.36)');
  stormGrad.addColorStop(0.6, 'rgba(130, 165, 198, 0.2)');
  stormGrad.addColorStop(1, 'rgba(36, 58, 94, 0)');
  ctx.fillStyle = stormGrad;
  ctx.scale(1.8, 1.0);
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a soft radial contact shadow texture for grounding laboratory instrumentation.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.34)');
  grad.addColorStop(0.78, 'rgba(0, 0, 0, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates/updates the 3D Projection Spectrometer Screen texture showing the dispersed
 * planetary continuum, dark Fraunhofer/atmospheric absorption lines, wavelength scale,
 * and the active Quantum Dot emission overlay.
 */
export function createProjectionScreenCanvas(maxAnisotropy: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return { canvas, ctx, texture };
}

export function paintProjectionScreen(
  ctx: CanvasRenderingContext2D,
  texture: THREE.CanvasTexture,
  sim: QuantumSimulationState,
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Matte optical baffle background
  ctx.fillStyle = '#090d14';
  ctx.fillRect(0, 0, w, h);

  // Subtle calibration grid lines
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;
  for (let y = 56; y <= 290; y += 58) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(w - 40, y);
    ctx.stroke();
  }

  const plotX = 48;
  const plotW = w - 96;
  const specTop = 64;
  const specH = 148;

  // Draw dispersed continuous spectrum with real physical absorption troughs
  for (let px = 0; px < plotW; px++) {
    const t = px / (plotW - 1);
    const wl = SPECTRUM_MIN_NM + t * (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM);
    const flux = evaluateTransmissionFlux(wl, sim.shiftedLines);
    const col = wavelengthToColor(wl);

    const r = Math.round(col.r * 255 * flux);
    const g = Math.round(col.g * 255 * flux);
    const b = Math.round(col.b * 255 * flux);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(plotX + px, specTop, 1.5, specH);
  }

  // Frame around projected spectrum strip
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(plotX, specTop, plotW, specH);

  // Wavelength scale ticks (400 to 750 nm)
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  for (let wl = 400; wl <= 750; wl += 50) {
    const x = plotX + ((wl - SPECTRUM_MIN_NM) / (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM)) * plotW;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, specTop + specH);
    ctx.lineTo(x, specTop + specH + 10);
    ctx.stroke();
    ctx.fillText(`${wl}`, x, specTop + specH + 30);
  }

  // Labels for shifted atmospheric absorption lines
  ctx.font = '600 16px "IBM Plex Mono", monospace';
  for (const line of sim.shiftedLines) {
    if (!line.inWindow) continue;
    const x =
      plotX +
      ((line.shiftedWavelengthNm - SPECTRUM_MIN_NM) / (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM)) * plotW;

    const isMatched = sim.activeMatch?.species.id === line.species.id;
    ctx.strokeStyle = isMatched ? '#f8fafc' : 'rgba(226, 232, 240, 0.4)';
    ctx.lineWidth = isMatched ? 2.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, specTop - 10);
    ctx.lineTo(x, specTop);
    ctx.stroke();

    ctx.fillStyle = isMatched ? '#f8fafc' : '#94a3b8';
    ctx.fillText(line.species.symbol, x, specTop - 16);
  }

  // Active QD Photoluminescence Gaussian Band Marker
  if (
    sim.isEmitting &&
    sim.emissionWavelengthNm >= SPECTRUM_MIN_NM &&
    sim.emissionWavelengthNm <= SPECTRUM_MAX_NM
  ) {
    const centerX =
      plotX +
      ((sim.emissionWavelengthNm - SPECTRUM_MIN_NM) / (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM)) * plotW;
    const fwhmPx = (sim.material.fwhmNm / (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM)) * plotW;

    const beamGrad = ctx.createLinearGradient(centerX - fwhmPx, 0, centerX + fwhmPx, 0);
    const { r, g, b } = sim.emissionColor;
    const rgb = `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
    beamGrad.addColorStop(0, `rgba(${rgb}, 0)`);
    beamGrad.addColorStop(0.5, `rgba(${rgb}, 0.55)`);
    beamGrad.addColorStop(1, `rgba(${rgb}, 0)`);

    ctx.fillStyle = beamGrad;
    ctx.fillRect(centerX - fwhmPx, specTop, fwhmPx * 2, specH);

    // Crisp reticle line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX, specTop - 4);
    ctx.lineTo(centerX, specTop + specH + 4);
    ctx.stroke();
  }

  // Bottom instrument caption on baffle
  ctx.textAlign = 'left';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 18px "IBM Plex Sans", sans-serif';
  ctx.fillText(
    `FOCAL PLANE PROJECTION  ·  ${sim.material.name} (${sim.radiusNm.toFixed(2)} nm)`,
    plotX,
    h - 32,
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = sim.activeMatch ? '#34d399' : '#94a3b8';
  ctx.font = '500 18px "IBM Plex Mono", monospace';
  ctx.fillText(
    sim.activeMatch
      ? `LOCK: ${sim.activeMatch.species.symbol} (${sim.activeMatch.shiftedWavelengthNm.toFixed(1)} nm)`
      : `z = ${sim.redshiftZ.toFixed(3)}`,
    w - plotX,
    h - 32,
  );

  texture.needsUpdate = true;
}
