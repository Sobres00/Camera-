import React, { useState } from 'react';
import { CameraSettings } from '../types/camera';

interface ProControlsStripProps {
  settings: CameraSettings;
  onUpdateSettings: (partial: Partial<CameraSettings>) => void;
}

type ActivePanel = 'iso' | 'shutter' | 'focus' | 'wb' | 'ev' | null;

export const ProControlsStrip: React.FC<ProControlsStripProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const isoSteps = [50, 100, 200, 400, 800, 1600, 3200, 6400];
  const shutterSteps = [
    '1/8000s',
    '1/4000s',
    '1/2000s',
    '1/1000s',
    '1/500s',
    '1/250s',
    '1/125s',
    '1/60s',
    '1/30s',
    '1/15s',
    '1/4s',
    '1s',
    '5s',
    '15s',
    '30s',
  ];
  const wbOptions = [
    { label: 'AUTO', value: 'AUTO' },
    { label: '3200K Tungsten', value: '3200K' },
    { label: '4000K Fluorescente', value: '4000K' },
    { label: '5500K Luz Día', value: '5500K' },
    { label: '6500K Nublado', value: '6500K' },
    { label: '8000K Sombra', value: '8000K' },
  ];

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 z-20 flex flex-col items-center gap-2 select-none">
      {/* Floating Active Adjustment Box */}
      {activePanel && (
        <div className="w-full bg-neutral-950/90 border border-neutral-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <span className="text-xs font-bold tracking-wider text-neutral-300 uppercase">
              {activePanel === 'iso' && `Sensibilidad del Sensor: ISO ${settings.iso}`}
              {activePanel === 'shutter' && `Tiempo de Obturación: ${settings.shutterSpeed}`}
              {activePanel === 'focus' && `Enfoque: ${settings.focusMode === 'af' ? 'Auto AF' : `Manual (${Math.round(settings.focusDistance * 100)}%)`}`}
              {activePanel === 'wb' && `Balance de Blancos: ${settings.wb}`}
              {activePanel === 'ev' && `Compensación de Exposición: ${settings.ev > 0 ? `+${settings.ev.toFixed(1)}` : settings.ev.toFixed(1)} EV`}
            </span>
            <button
              onClick={() => setActivePanel(null)}
              className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700"
            >
              Cerrar ✕
            </button>
          </div>

          {/* ISO Content */}
          {activePanel === 'iso' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {isoSteps.map((iso) => (
                  <button
                    key={iso}
                    onClick={() => onUpdateSettings({ iso })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                      settings.iso === iso
                        ? 'bg-white text-black shadow-md'
                        : 'bg-neutral-900 border border-neutral-700/60 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {iso}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shutter Content */}
          {activePanel === 'shutter' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {shutterSteps.map((speed) => (
                <button
                  key={speed}
                  onClick={() => onUpdateSettings({ shutterSpeed: speed })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                    settings.shutterSpeed === speed
                      ? 'bg-white text-black shadow-md'
                      : 'bg-neutral-900 border border-neutral-700/60 text-neutral-300 hover:text-white'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          )}

          {/* Focus Content */}
          {activePanel === 'focus' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateSettings({ focusMode: 'af' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    settings.focusMode === 'af'
                      ? 'bg-white text-black'
                      : 'bg-neutral-900 border border-neutral-700 text-neutral-300'
                  }`}
                >
                  Enfoque Auto (AF)
                </button>
                <button
                  onClick={() => onUpdateSettings({ focusMode: 'macro' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    settings.focusMode === 'macro'
                      ? 'bg-white text-black'
                      : 'bg-neutral-900 border border-neutral-700 text-neutral-300'
                  }`}
                >
                  Macro
                </button>
                <button
                  onClick={() => onUpdateSettings({ focusMode: 'infinity' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    settings.focusMode === 'infinity'
                      ? 'bg-white text-black'
                      : 'bg-neutral-900 border border-neutral-700 text-neutral-300'
                  }`}
                >
                  Infinito ∞
                </button>
                <button
                  onClick={() => onUpdateSettings({ focusMode: 'manual' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    settings.focusMode === 'manual'
                      ? 'bg-white text-black'
                      : 'bg-neutral-900 border border-neutral-700 text-neutral-300'
                  }`}
                >
                  Manual
                </button>
              </div>

              {settings.focusMode === 'manual' && (
                <div className="flex items-center gap-3 px-1">
                  <span className="text-[11px] text-neutral-400 font-mono">Macro</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.focusDistance}
                    onChange={(e) =>
                      onUpdateSettings({ focusDistance: parseFloat(e.target.value) })
                    }
                    className="flex-1 accent-white"
                  />
                  <span className="text-[11px] text-neutral-400 font-mono">Infinito</span>
                </div>
              )}
            </div>
          )}

          {/* WB Content */}
          {activePanel === 'wb' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {wbOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdateSettings({ wb: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                    settings.wb === opt.value
                      ? 'bg-white text-black shadow-md'
                      : 'bg-neutral-900 border border-neutral-700/60 text-neutral-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* EV Content */}
          {activePanel === 'ev' && (
            <div className="flex flex-col gap-2 px-1">
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={settings.ev}
                onChange={(e) => onUpdateSettings({ ev: parseFloat(e.target.value) })}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>-3.0 EV (Subexpuesto)</span>
                <span className="text-white font-bold">{settings.ev > 0 ? `+${settings.ev.toFixed(1)}` : settings.ev.toFixed(1)}</span>
                <span>+3.0 EV (Sobreexpuesto)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Horizontal Parameter Boxes Row */}
      <div className="w-full flex items-center gap-1.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-1.5 backdrop-blur-md">
        {/* ISO Box */}
        <button
          onClick={() => togglePanel('iso')}
          className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg border transition active:scale-95 ${
            activePanel === 'iso'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-neutral-900/90 border-neutral-700/60 text-neutral-200 hover:border-neutral-500'
          }`}
        >
          <span className="text-[10px] text-neutral-400 font-semibold tracking-wider">ISO</span>
          <span className="text-xs font-bold font-mono">{settings.iso}</span>
        </button>

        {/* Shutter Box */}
        <button
          onClick={() => togglePanel('shutter')}
          className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg border transition active:scale-95 ${
            activePanel === 'shutter'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-neutral-900/90 border-neutral-700/60 text-neutral-200 hover:border-neutral-500'
          }`}
        >
          <span className="text-[10px] text-neutral-400 font-semibold tracking-wider">S</span>
          <span className="text-xs font-bold font-mono">{settings.shutterSpeed}</span>
        </button>

        {/* Focus Box */}
        <button
          onClick={() => togglePanel('focus')}
          className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg border transition active:scale-95 ${
            activePanel === 'focus'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-neutral-900/90 border-neutral-700/60 text-neutral-200 hover:border-neutral-500'
          }`}
        >
          <span className="text-[10px] text-neutral-400 font-semibold tracking-wider">AF</span>
          <span className="text-xs font-bold font-mono uppercase">
            {settings.focusMode === 'af' ? 'AF-C' : settings.focusMode}
          </span>
        </button>

        {/* WB Box */}
        <button
          onClick={() => togglePanel('wb')}
          className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg border transition active:scale-95 ${
            activePanel === 'wb'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-neutral-900/90 border-neutral-700/60 text-neutral-200 hover:border-neutral-500'
          }`}
        >
          <span className="text-[10px] text-neutral-400 font-semibold tracking-wider">WB</span>
          <span className="text-xs font-bold font-mono">{settings.wb}</span>
        </button>

        {/* EV Box */}
        <button
          onClick={() => togglePanel('ev')}
          className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg border transition active:scale-95 ${
            activePanel === 'ev'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-neutral-900/90 border-neutral-700/60 text-neutral-200 hover:border-neutral-500'
          }`}
        >
          <span className="text-[10px] text-neutral-400 font-semibold tracking-wider">EV</span>
          <span className="text-xs font-bold font-mono">
            {settings.ev > 0 ? `+${settings.ev.toFixed(1)}` : settings.ev.toFixed(1)}
          </span>
        </button>
      </div>
    </div>
  );
};
