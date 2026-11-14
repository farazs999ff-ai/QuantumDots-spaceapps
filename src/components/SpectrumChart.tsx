import { useMemo, useState } from 'react';
import {
  HC_EV_NM,
  QuantumSimulationState,
  SPECTRUM_MAX_NM,
  SPECTRUM_MIN_NM,
  evaluateTransmissionFlux,
  solveRadiusForEmissionWavelength,
  wavelengthToColor,
} from '../physics/quantumConfinement';

interface SpectrumChartProps {
  simState: QuantumSimulationState;
  onTuneToRadius: (radiusNm: number) => void;
}

const SVG_W = 680;
const SVG_H = 156;
const PAD_L = 38;
const PAD_R = 14;
const PAD_T = 22;
const PAD_B = 34;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

function wlToX(wlNm: number): number {
  const clamped = Math.max(SPECTRUM_MIN_NM, Math.min(SPECTRUM_MAX_NM, wlNm));
  return PAD_L + ((clamped - SPECTRUM_MIN_NM) / (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM)) * PLOT_W;
}

export function SpectrumChart({ simState, onTuneToRadius }: SpectrumChartProps) {
  const [probeWl, setProbeWl] = useState<number | null>(null);

  const transmissionPath = useMemo(() => {
    const samples = 220;
    let d = '';
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const wl = SPECTRUM_MIN_NM + t * (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM);
      const flux = evaluateTransmissionFlux(wl, simState.shiftedLines);
      const x = PAD_L + t * PLOT_W;
      const y = PAD_T + (1 - flux) * PLOT_H;
      d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }, [simState.shiftedLines]);

  const emissionPaths = useMemo(() => {
    if (!simState.isEmitting) return null;
    const sigma = simState.material.fwhmNm / 2.35482;
    const samples = 160;
    let lineD = '';
    let areaD = '';

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const wl = SPECTRUM_MIN_NM + t * (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM);
      const delta = wl - simState.emissionWavelengthNm;
      const gauss = simState.emissionIntensity * Math.exp(-(delta * delta) / (2 * sigma * sigma));
      const x = PAD_L + t * PLOT_W;
      const y = PAD_T + (1 - gauss) * PLOT_H;
      if (i === 0) {
        lineD = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        areaD = `M ${x.toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        lineD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        areaD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
    areaD += ` L ${(PAD_L + PLOT_W).toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} Z`;
    return { lineD, areaD };
  }, [
    simState.isEmitting,
    simState.emissionWavelengthNm,
    simState.emissionIntensity,
    simState.material.fwhmNm,
  ]);

  const spectrumStops = useMemo(() => {
    const stops: Array<{ offset: string; color: string }> = [];
    for (let wl = 380; wl <= 780; wl += 25) {
      const pct = ((wl - SPECTRUM_MIN_NM) / (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM)) * 100;
      stops.push({ offset: `${pct.toFixed(1)}%`, color: wavelengthToColor(wl).css });
    }
    return stops;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * SVG_W;
    if (relX < PAD_L || relX > PAD_L + PLOT_W) {
      setProbeWl(null);
      return;
    }
    const wl = SPECTRUM_MIN_NM + ((relX - PAD_L) / PLOT_W) * (SPECTRUM_MAX_NM - SPECTRUM_MIN_NM);
    setProbeWl(wl);
  };

  const probeFlux = probeWl !== null ? evaluateTransmissionFlux(probeWl, simState.shiftedLines) : null;
  const emissionX = wlToX(simState.emissionWavelengthNm);
  const absorptionX = wlToX(simState.absorptionEdgeNm);

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
        <span>Exoplanet Transmission &amp; QD Photoluminescence Profile</span>
        <div className="font-mono tabular-nums text-slate-300">
          {probeWl !== null && probeFlux !== null ? (
            <span>
              {probeWl.toFixed(1)} nm · {(HC_EV_NM / probeWl).toFixed(2)} eV · T {(probeFlux * 100).toFixed(1)}%
            </span>
          ) : (
            <span>Click a line label below to tune R</span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto bg-[#070a11] border border-slate-800 rounded-md cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setProbeWl(null)}
        role="img"
        aria-label="Exoplanet atmospheric transmission spectrum and quantum dot emission profile"
      >
        <defs>
          <linearGradient id="vis-spectrum-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            {spectrumStops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const y = PAD_T + (1 - level) * PLOT_H;
          return (
            <g key={level}>
              <line
                x1={PAD_L}
                y1={y}
                x2={PAD_L + PLOT_W}
                y2={y}
                stroke="rgba(148, 163, 184, 0.14)"
                strokeWidth="1"
              />
              <text
                x={PAD_L - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-500 text-[9px] font-mono"
              >
                {level.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Vertical wavelength grid & axis ticks */}
        {[400, 450, 500, 550, 600, 650, 700, 750].map((wl) => {
          const x = wlToX(wl);
          return (
            <g key={wl}>
              <line
                x1={x}
                y1={PAD_T}
                x2={x}
                y2={PAD_T + PLOT_H}
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={SVG_H - 6}
                textAnchor="middle"
                className="fill-slate-400 text-[9.5px] font-mono"
              >
                {wl}
              </text>
            </g>
          );
        })}

        {/* Thin physical visible-band color reference bar */}
        <rect
          x={PAD_L}
          y={PAD_T + PLOT_H + 3}
          width={PLOT_W}
          height={6}
          rx={1}
          fill="url(#vis-spectrum-grad)"
          opacity={0.85}
        />

        {/* QD Photoluminescence Gaussian Envelope */}
        {emissionPaths && (
          <g>
            <path d={emissionPaths.areaD} fill={simState.emissionColor.css} fillOpacity={0.2} />
            <path
              d={emissionPaths.lineD}
              fill="none"
              stroke={simState.emissionColor.css}
              strokeWidth="1.75"
            />
          </g>
        )}

        {/* QD Absorption onset dashed marker */}
        {simState.absorptionEdgeNm >= SPECTRUM_MIN_NM &&
          simState.absorptionEdgeNm <= SPECTRUM_MAX_NM && (
            <line
              x1={absorptionX}
              y1={PAD_T}
              x2={absorptionX}
              y2={PAD_T + PLOT_H}
              stroke="rgba(148, 163, 184, 0.45)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}

        {/* QD Peak Emission Cursor */}
        {simState.isEmitting &&
          simState.emissionWavelengthNm >= SPECTRUM_MIN_NM &&
          simState.emissionWavelengthNm <= SPECTRUM_MAX_NM && (
            <line
              x1={emissionX}
              y1={PAD_T}
              x2={emissionX}
              y2={PAD_T + PLOT_H + 9}
              stroke="#f8fafc"
              strokeWidth="1.5"
            />
          )}

        {/* Exoplanet Transmission Continuum + Absorption Dips */}
        <path
          d={transmissionPath}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Shifted Atmospheric Absorption Line Markers */}
        {simState.shiftedLines.map((line) => {
          if (!line.inWindow) return null;
          const x = wlToX(line.shiftedWavelengthNm);
          const isMatched = simState.activeMatch?.species.id === line.species.id;
          const targetR = solveRadiusForEmissionWavelength(
            simState.material,
            line.shiftedWavelengthNm,
          );
          const tunable = targetR !== null;

          return (
            <g
              key={line.species.id}
              onClick={() => {
                if (targetR !== null) onTuneToRadius(targetR);
              }}
              className={tunable ? 'cursor-pointer' : 'cursor-not-allowed opacity-55'}
            >
              <line
                x1={x}
                y1={PAD_T - 3}
                x2={x}
                y2={PAD_T + PLOT_H}
                stroke={isMatched ? '#34d399' : line.species.accentHex}
                strokeWidth={isMatched ? '1.75' : '1'}
                strokeOpacity={isMatched ? 0.95 : 0.45}
              />
              <text
                x={x}
                y={13}
                textAnchor="middle"
                className="text-[9.5px] font-mono font-medium"
                fill={isMatched ? '#34d399' : tunable ? '#e2e8f0' : '#64748b'}
              >
                {line.species.symbol}
              </text>
            </g>
          );
        })}

        {/* Crosshair hover probe */}
        {probeWl !== null && (
          <line
            x1={wlToX(probeWl)}
            y1={PAD_T}
            x2={wlToX(probeWl)}
            y2={PAD_T + PLOT_H}
            stroke="rgba(56, 189, 248, 0.7)"
            strokeWidth="1"
          />
        )}
      </svg>
    </div>
  );
}
