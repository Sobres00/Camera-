import React from 'react';
import { Zap, ZapOff, Sparkles, Settings, Volume2, VolumeX } from 'lucide-react';
import { CameraSettings } from '../types/camera';

interface TopBarProps {
  settings: CameraSettings;
  onUpdateSettings: (partial: Partial<CameraSettings>) => void;
  onOpenSettings: () => void;
  recordingTime?: string;
  isRecording?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  recordingTime = '00:00:00',
  isRecording = false,
}) => {
  const toggleFlash = () => {
    const next = settings.flash === 'off' ? 'auto' : settings.flash === 'auto' ? 'on' : 'off';
    onUpdateSettings({ flash: next });
  };

  const toggleHdr = () => {
    const next = settings.hdr === 'off' ? 'auto' : settings.hdr === 'auto' ? 'on' : 'off';
    onUpdateSettings({ hdr: next });
  };

  const toggleSound = () => {
    onUpdateSettings({ shutterSound: !settings.shutterSound });
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 z-30 select-none">
      {/* Flash */}
      <button
        onClick={toggleFlash}
        className="flex items-center gap-1 p-2 rounded-full hover:bg-white/10 active:scale-95 transition text-white"
        title="Flash"
      >
        {settings.flash === 'off' ? (
          <ZapOff className="w-5 h-5 text-neutral-400" />
        ) : (
          <Zap className={`w-5 h-5 ${settings.flash === 'on' ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
        )}
        <span className="text-[11px] font-semibold tracking-wide uppercase">
          {settings.flash === 'auto' ? 'A' : settings.flash === 'on' ? 'ON' : ''}
        </span>
      </button>

      {/* HDR */}
      <button
        onClick={toggleHdr}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider transition active:scale-95 ${
          settings.hdr !== 'off'
            ? 'text-amber-300 border border-amber-300/40 bg-amber-400/10'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        HDR {settings.hdr === 'auto' ? 'AUTO' : settings.hdr === 'on' ? 'ON' : 'OFF'}
      </button>

      {/* Center status / Recording timecode */}
      <div className="flex items-center gap-2">
        {isRecording ? (
          <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            {recordingTime}
          </div>
        ) : (
          <div className="text-center">
            <span className="text-xs font-mono tracking-widest text-neutral-300">
              {recordingTime}
            </span>
          </div>
        )}
      </div>

      {/* Format & Resolution Badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium tracking-wide text-neutral-200 bg-neutral-900/80 border border-neutral-700/80 px-2 py-0.5 rounded text-[11px]">
          {settings.isRawEnabled ? 'RAW 48MP' : `${settings.aspectRatio} · 12MP`}
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">
          4K·{isRecording ? '60' : '30'}
        </span>
      </div>

      {/* Shutter Sound Mute / Unmute & Settings */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleSound}
          className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition text-neutral-300 hover:text-white"
          title={settings.shutterSound ? 'Sonido activado (clic para silenciar)' : 'Silencioso activado (cero sonido)'}
        >
          {settings.shutterSound ? (
            <Volume2 className="w-5 h-5 text-neutral-300" />
          ) : (
            <VolumeX className="w-5 h-5 text-amber-400" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition text-neutral-200 hover:text-white"
          title="Ajustes y Código Android Nativo"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
