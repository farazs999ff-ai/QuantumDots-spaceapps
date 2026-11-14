import { useEffect, useRef, useState } from 'react';
import { QuantumSimulationState } from '../physics/quantumConfinement';
import { CameraPreset, QuantumProjectionScene } from '../scene/QuantumProjectionScene';

interface ViewportCanvasProps {
  simState: QuantumSimulationState;
  cameraPreset: CameraPreset;
  presetVersion: number;
}

export function ViewportCanvas({ simState, cameraPreset, presetVersion }: ViewportCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<QuantumProjectionScene | null>(null);
  const initialSimRef = useRef(simState);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const controller = new QuantumProjectionScene(
      container,
      initialSimRef.current,
      (lost) => setContextLost(lost),
    );
    controllerRef.current = controller;

    const resizeObserver = new ResizeObserver(() => {
      controller.resize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.applySimulationState(simState);
  }, [simState]);

  useEffect(() => {
    if (presetVersion === 0) return;
    controllerRef.current?.setCameraPreset(cameraPreset);
  }, [cameraPreset, presetVersion]);

  return (
    <div className="relative w-full h-full bg-[#06080d]">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="3D Quantum Dot Optical Projection Viewport"
      />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#06080d]/95 text-slate-200 p-6">
          <div className="max-w-md border border-slate-700 bg-slate-900 p-5 rounded-lg text-sm space-y-2">
            <p className="font-semibold text-slate-100">WebGL Rendering Context Suspended</p>
            <p className="text-slate-400">
              Hardware graphics context was interrupted. Waiting for browser restoration or reload the viewport.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
