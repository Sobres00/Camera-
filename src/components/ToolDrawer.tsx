import React, { useState } from 'react';
import {
  Grid,
  Compass,
  Timer,
  Sliders,
  Camera,
  Settings,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Search,
  BookmarkPlus,
  Sparkles,
} from 'lucide-react';
import { CameraSettings, AspectRatio, SensorResolution, ColorProfile, QuickPreset } from '../types/camera';

interface ToolDrawerProps {
  settings: CameraSettings;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateSettings: (partial: Partial<CameraSettings>) => void;
  onOpenSettingsModal: () => void;
  onOpenPresetsModal: () => void;
}

export const ToolDrawer: React.FC<ToolDrawerProps> = ({
  settings,
  isOpen,
  onToggleOpen,
  onUpdateSettings,
  onOpenSettingsModal,
  onOpenPresetsModal,
}) => {
  const aspectRatios: AspectRatio[] = ['4:3', '16:9', '1:1', '3:4'];
  const resolutions: SensorResolution[] = ['12MP', '50MP', '108MP', '200MP'];
  const zoomLevels = [0.5, 1, 2, 3, 5, 10];

  const cycleTimer = () => {
    const next = settings.timerSeconds === 0 ? 3 : settings.timerSeconds === 3 ? 10 : 0;
    onUpdateSettings({ timerSeconds: next });
  };

  const cycleColorProfile = () => {
    const profiles: ColorProfile[] = ['standard', 'flat_log', 'cine_d', 'slog3', 'monochrome', 'vivid'];
    const currentIndex = profiles.indexOf(settings.colorProfile);
    const nextProfile = profiles[(currentIndex + 1) % profiles.length];
    onUpdateSettings({ colorProfile: nextProfile });
  };

  const cycleComposition = () => {
    if (!settings.gridEnabled) {
      onUpdateSettings({ gridEnabled: true, compositionGuide: 'thirds' });
    } else if (settings.compositionGuide === 'thirds') {
      onUpdateSettings({ gridEnabled: true, compositionGuide: 'golden_spiral' });
    } else {
      onUpdateSettings({ gridEnabled: false, compositionGuide: 'none' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 z-20 flex flex-col items-center select-none">
      {/* Toggle Arrow Pill Button */}
      <button
        onClick={onToggleOpen}
        className="mb-1.5 px-4 py-1 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-neutral-300 hover:text-white flex items-center gap-1.5 text-xs font-medium shadow-lg backdrop-blur-md active:scale-95 transition"
        title="Ocultar / Desplegar Herramientas"
      >
        <span>{isOpen ? 'Ocultar Herramientas' : 'Herramientas y Resolución (108/200MP)'}</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Main Floating Tool Drawer Box */}
      {isOpen && (
        <div className="w-full bg-neutral-950/90 border border-neutral-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3.5 text-white animate-in fade-in zoom-in-95 duration-200">
          {/* Row 1: Aspect Ratio & Sensor Resolution (12MP, 50MP, 108MP, 200MP) */}
          <div className="flex flex-col gap-2">
            {/* Aspect Ratio Row */}
            <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-700/70 rounded-xl p-1">
              {aspectRatios.map((ratio) => {
                const isActive = settings.aspectRatio === ratio;
                return (
                  <button
                    key={ratio}
                    onClick={() => onUpdateSettings({ aspectRatio: ratio })}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold tracking-wider transition ${
                      isActive
                        ? 'bg-white text-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                );
              })}
            </div>

            {/* Sensor Resolution Row (12MP, 50MP, 108MP, 200MP RAW) */}
            <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-700/70 rounded-xl p-1">
              {resolutions.map((res) => {
                const isActive = settings.resolution === res;
                return (
                  <button
                    key={res}
                    onClick={() =>
                      onUpdateSettings({
                        resolution: res,
                        isRawEnabled: true,
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-wider transition active:scale-95 ${
                      isActive
                        ? 'bg-amber-400 text-black shadow-md font-extrabold'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {res === '200MP' ? '200MP RAW' : res}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Tool Icons with text labels */}
          <div className="grid grid-cols-6 gap-2 pt-1 text-center">
            {/* Grid / Golden Spiral */}
            <button
              onClick={cycleComposition}
              className="flex flex-col items-center gap-1 p-1 rounded-xl transition hover:bg-white/5 active:scale-95"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                  settings.gridEnabled
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-neutral-300 truncate w-full">
                {settings.compositionGuide === 'golden_spiral' ? 'Espiral' : settings.gridEnabled ? 'Tercios' : 'Guías'}
              </span>
            </button>

            {/* Focus Peaking */}
            <button
              onClick={() => onUpdateSettings({ focusPeaking: !settings.focusPeaking })}
              className="flex flex-col items-center gap-1 p-1 rounded-xl transition hover:bg-white/5 active:scale-95"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                  settings.focusPeaking
                    ? 'bg-cyan-400 text-black border-cyan-400 shadow-md font-bold'
                    : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-300'
                }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-neutral-300">Peaking</span>
            </button>

            {/* Zebra Stripes */}
            <button
              onClick={() => onUpdateSettings({ zebraStripes: !settings.zebraStripes })}
              className="flex flex-col items-center gap-1 p-1 rounded-xl transition hover:bg-white/5 active:scale-95"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                  settings.zebraStripes
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                    : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-300'
                }`}
              >
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-neutral-300">Cebras</span>
            </button>

            {/* Histogram Live */}
            <button
              onClick={() => onUpdateSettings({ liveHistogram: !settings.liveHistogram })}
              className="flex flex-col items-center gap-1 p-1 rounded-xl transition hover:bg-white/5 active:scale-95"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                  settings.liveHistogram
                    ? 'bg-emerald-400 text-black border-emerald-400 shadow-md'
                    : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-300'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-neutral-300">Histograma</span>
            </button>

            {/* Lupa PIP Focus Magnifier */}
            <button
              onClick={() => onUpdateSettings({ focusMagnifier: !settings.focusMagnifier })}
              className="flex flex-col items-center gap-1 p-1 rounded-xl transition hover:bg-white/5 active:scale-95"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                  settings.focusMagnifier
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-300'
                }`}
              >
                <Search className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-neutral-300">Lupa 5x</span>
            </button>

            {/* Presets Manager */}
            <button
              onClick={onOpenPresetsModal}
              className="flex flex-col items-center gap-1 p-1 rounded-xl transition hover:bg-white/5 active:scale-95"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border bg-neutral-900/80 border-neutral-700/60 text-amber-300">
                <BookmarkPlus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-neutral-300">Presets</span>
            </button>
          </div>

          {/* Row 3: Horizon Level, Timer, Color Profile (Flat/Log), Settings */}
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            <button
              onClick={() => onUpdateSettings({ levelEnabled: !settings.levelEnabled })}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                settings.levelEnabled
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 border-neutral-700/60 text-neutral-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Nivel</span>
            </button>

            <button
              onClick={cycleTimer}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                settings.timerSeconds > 0
                  ? 'bg-amber-400 text-black border-amber-400'
                  : 'bg-neutral-900 border-neutral-700/60 text-neutral-300'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{settings.timerSeconds > 0 ? `${settings.timerSeconds}s` : 'Timer'}</span>
            </button>

            <button
              onClick={cycleColorProfile}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition truncate ${
                settings.colorProfile !== 'standard'
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 border-neutral-700/60 text-neutral-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="capitalize">{settings.colorProfile.replace('_', ' ')}</span>
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border bg-neutral-900 border-neutral-700/60 text-neutral-300 hover:text-white transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ajustes</span>
            </button>
          </div>

          {/* Row 4: Zoom Capsule (.5, 1x, 2, 3, 5x, 10x) */}
          <div className="flex justify-center pt-0.5">
            <div className="inline-flex items-center bg-neutral-900/90 border border-neutral-700/70 rounded-full p-1 gap-1 shadow-inner">
              {zoomLevels.map((lvl) => {
                const isActive = settings.zoom === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => onUpdateSettings({ zoom: lvl })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition active:scale-90 ${
                      isActive
                        ? 'bg-white text-black shadow-lg scale-105'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lvl === 0.5 ? '.5' : `${lvl}x`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
