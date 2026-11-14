import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { SpectrumChart } from './SpectrumChart';
import { ViewportCanvas } from './ViewportCanvas';
import {
  HC_EV_NM,
  MaterialId,
  RADIUS_MAX_NM,
  RADIUS_MIN_NM,
  SEMICONDUCTOR_MATERIALS,
  computeQuantumSimulation,
} from '../physics/quantumConfinement';
import { CameraPreset } from '../scene/QuantumProjectionScene';

const MATERIAL_ORDER: MaterialId[] = ['cdse', 'inp', 'cdte', 'cspbbr3'];

const CAMERA_PRESET_LABELS: Array<{ id: CameraPreset; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'qd', label: 'Quantum Dot' },
  { id: 'projection', label: 'Projection' },
  { id: 'planet', label: 'Exoplanet' },
];

const INITIAL_STATE = {
  materialId: 'cdse' as MaterialId,
  radiusNm: 2.68,
  excitationEv: 3.1,
  redshiftZ: 0.0,
};

export function QuantumProjectionLab() {
  const [materialId, setMaterialId] = useState<MaterialId>(INITIAL_STATE.materialId);
  const [radiusNm, setRadiusNm] = useState<number>(INITIAL_STATE.radiusNm);
  const [excitationEv, setExcitationEv] = useState<number>(INITIAL_STATE.excitationEv);
  const [redshiftZ, setRedshiftZ] = useState<number>(INITIAL_STATE.redshiftZ);

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [presetVersion, setPresetVersion] = useState<number>(0);
  const [dockOpen, setDockOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const simState = useMemo(
    () => computeQuantumSimulation(materialId, radiusNm, excitationEv, redshiftZ),
    [materialId, radiusNm, excitationEv, redshiftZ],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const handleSelectCamera = (preset: CameraPreset) => {
    setCameraPreset(preset);
    setPresetVersion((v) => v + 1);
  };

  const handleReset = () => {
    setMaterialId(INITIAL_STATE.materialId);
    setRadiusNm(INITIAL_STATE.radiusNm);
    setExcitationEv(INITIAL_STATE.excitationEv);
    setRedshiftZ(INITIAL_STATE.redshiftZ);
    handleSelectCamera('overview');
  };

  const excitationWlNm = HC_EV_NM / excitationEv;

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-40 w-screen h-screen overflow-hidden bg-[#06080d] text-slate-100 select-none'
          : 'relative w-full h-[86vh] min-h-[760px] overflow-hidden bg-[#06080d] text-slate-100 select-none border border-slate-800 rounded-xl'
      }
    >
      {/* Unobstructed 3D Viewport */}
      <ViewportCanvas
        simState={simState}
        cameraPreset={cameraPreset}
        presetVersion={presetVersion}
      />

      {/* Stage Instrument Header Bar */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="pointer-events-auto flex items-baseline gap-3 bg-[#0a0e17]/92 border border-slate-800 rounded-lg px-3.5 py-2">
          <span className="text-sm font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            3D Optical Projection Bench
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 whitespace-nowrap">
            Drag to orbit · Scroll to zoom
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0a0e17]/92 border border-slate-800 rounded-lg p-1">
          {CAMERA_PRESET_LABELS.map((preset) => {
            const active = cameraPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectCamera(preset.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-800 text-slate-50 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-100 border border-transparent'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          <div className="w-px h-4 bg-slate-800 mx-0.5" aria-hidden="true" />
          <button
            type="button"
            onClick={handleReset}
            title="Reset parameters and camera"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            title={isFullscreen ? 'Exit fullscreen' : 'Expand 3D lab fullscreen'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span className="hidden md:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Bottom Instrument Control Dock */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 z-20 w-[min(1060px,95%)] transition-transform duration-200 ease-out ${
          dockOpen ? 'bottom-3 translate-y-0' : 'bottom-3 translate-y-[calc(100%-34px)]'
        }`}
      >
        {/* Collapse Toggle Tab */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockOpen((prev) => !prev)}
            aria-expanded={dockOpen}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#0a0e17]/95 border border-b-0 border-slate-800 rounded-t-lg transition-colors whitespace-nowrap shrink-0"
          >
            {dockOpen ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hide Controls</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Show Controls</span>
              </>
            )}
            <span className="text-[10px] font-mono text-slate-500 ml-1">(H)</span>
          </button>
        </div>

        {/* Main Dock Panel */}
        <section
          aria-label="Spectrometer and Quantum Confinement Controls"
          className="bg-[#0a0e17]/95 border border-slate-800 rounded-xl shadow-2xl p-4 space-y-3.5"
        >
          {/* Live Telemetry Readout Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pb-3 border-b border-slate-800/90">
            <div>
              <div className="text-[11px] text-slate-400">Effective Bandgap</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-mono font-semibold tabular-nums text-slate-100">
                  {simState.bandgapEv.toFixed(2)}
                </span>
                <span className="text-[11px] font-mono text-slate-400">eV</span>
                <span className="text-[11px] text-slate-500 ml-1">
                  · {simState.confinementRegime}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Emission Peak</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className="text-lg font-mono font-semibold tabular-nums"
                  style={{ color: simState.isEmitting ? simState.emissionColor.css : '#64748b' }}
                >
                  {simState.isEmitting ? simState.emissionWavelengthNm.toFixed(1) : '--'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">nm</span>
                <span className="text-[11px] font-mono text-slate-500 ml-1">
                  ±{(simState.material.fwhmNm / 2).toFixed(0)}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Excitation Margin</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-mono font-semibold tabular-nums text-slate-100">
                  {(simState.excitationEv - simState.bandgapEv >= 0 ? '+' : '') +
                    (simState.excitationEv - simState.bandgapEv).toFixed(2)}
                </span>
                <span className="text-[11px] font-mono text-slate-400">eV</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Doppler Radial Velocity</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-mono font-semibold tabular-nums text-slate-100">
                  {Math.round(simState.radialVelocityKmS).toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-slate-400">km/s</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
              <div className="text-[11px] text-slate-400">Resonance State</div>
              {!simState.isEmitting ? (
                <div className="text-xs font-medium text-amber-400 mt-1 truncate">
                  ▲ Excitation below Eg
                </div>
              ) : simState.activeMatch ? (
                <div className="text-xs font-medium text-emerald-400 mt-1 truncate">
                  ● Locked: {simState.activeMatch.species.symbol} (
                  {simState.activeMatch.shiftedWavelengthNm.toFixed(1)} nm)
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-300 mt-1 truncate">
                  ○ Scanning continuum
                </div>
              )}
            </div>
          </div>

          {/* Interactive Spectrum + Parameter Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7">
              <SpectrumChart simState={simState} onTuneToRadius={setRadiusNm} />
            </div>

            <div className="lg:col-span-5 space-y-3">
              {/* Semiconductor Core Material Switcher */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span>Nanocrystal Core / Shell</span>
                  <span className="font-mono text-slate-400">
                    aB = {simState.bohrRadiusNm.toFixed(1)} nm · {simState.material.latticeType}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#070a11] border border-slate-800 rounded-md">
                  {MATERIAL_ORDER.map((id) => {
                    const mat = SEMICONDUCTOR_MATERIALS[id];
                    const active = materialId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMaterialId(id)}
                        className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap truncate ${
                          active
                            ? 'bg-slate-800 text-slate-50 border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        {mat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Radius Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <label htmlFor="qd-radius" className="text-slate-300 font-medium">
                    Core Radius (R)
                  </label>
                  <span className="font-mono tabular-nums text-slate-200">
                    {radiusNm.toFixed(2)} nm
                  </span>
                </div>
                <input
                  id="qd-radius"
                  type="range"
                  className="lab-slider"
                  min={RADIUS_MIN_NM}
                  max={RADIUS_MAX_NM}
                  step={0.02}
                  value={radiusNm}
                  onChange={(e) => setRadiusNm(parseFloat(e.target.value))}
                />
              </div>

              {/* Excitation Photon Energy & Target Redshift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <label htmlFor="qd-excitation" className="text-slate-300 font-medium">
                      Excitation Pump
                    </label>
                    <span className="font-mono tabular-nums text-slate-200">
                      {excitationEv.toFixed(2)} eV ({Math.round(excitationWlNm)} nm)
                    </span>
                  </div>
                  <input
                    id="qd-excitation"
                    type="range"
                    className="lab-slider"
                    min={1.5}
                    max={4.5}
                    step={0.05}
                    value={excitationEv}
                    onChange={(e) => setExcitationEv(parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <label htmlFor="target-redshift" className="text-slate-300 font-medium">
                      Target Redshift (z)
                    </label>
                    <span className="font-mono tabular-nums text-slate-200">
                      z = {redshiftZ.toFixed(3)}
                    </span>
                  </div>
                  <input
                    id="target-redshift"
                    type="range"
                    className="lab-slider"
                    min={0.0}
                    max={0.25}
                    step={0.002}
                    value={redshiftZ}
                    onChange={(e) => setRedshiftZ(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
