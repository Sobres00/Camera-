import React from 'react';
import { RefreshCw } from 'lucide-react';
import { CameraMode, CapturedPhoto } from '../types/camera';

interface BottomBarProps {
  currentMode: CameraMode;
  onSelectMode: (mode: CameraMode) => void;
  onShutterPress: () => void;
  onToggleFacing: () => void;
  onOpenGallery: () => void;
  lastPhoto: CapturedPhoto | null;
  photoCount: number;
  isRecording?: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentMode,
  onSelectMode,
  onShutterPress,
  onToggleFacing,
  onOpenGallery,
  lastPhoto,
  photoCount,
  isRecording = false,
}) => {
  const modes: { id: CameraMode; label: string }[] = [
    { id: 'slomo', label: 'SLO-MO' },
    { id: 'video', label: 'VIDEO' },
    { id: 'photo', label: 'PHOTO' },
    { id: 'portrait', label: 'PORTRAIT' },
    { id: 'pano', label: 'PANO' },
    { id: 'pro', label: 'PRO' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-3 pb-6 pt-2 px-4 z-30 select-none bg-black/40 backdrop-blur-sm">
      {/* Mode Carousel */}
      <div className="w-full flex items-center justify-center gap-6 overflow-x-auto no-scrollbar py-1">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`text-xs font-bold tracking-widest transition-all uppercase flex-shrink-0 relative py-1 ${
                isActive
                  ? 'text-amber-400 font-extrabold scale-110 drop-shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {mode.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Shutter Row */}
      <div className="w-full max-w-sm flex items-center justify-between px-6 pt-1">
        {/* Gallery Thumbnail */}
        <button
          onClick={onOpenGallery}
          className="w-13 h-13 rounded-2xl border-2 border-neutral-700/80 bg-neutral-900 overflow-hidden relative active:scale-90 transition shadow-lg flex items-center justify-center group"
          title="Abrir Galería y Metadatos RAW"
        >
          {lastPhoto ? (
            <img
              src={lastPhoto.url}
              alt="Última foto"
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-400">
              RAW
            </div>
          )}

          {photoCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
              {photoCount}
            </span>
          )}
        </button>

        {/* Shutter Button (Solid white with concentric ring) */}
        <button
          onClick={onShutterPress}
          className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition shadow-2xl focus:outline-none"
          title={isRecording ? 'Detener Grabación' : 'Disparar'}
        >
          {isRecording ? (
            <div className="w-7 h-7 bg-red-600 rounded-md animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          ) : currentMode === 'video' || currentMode === 'slomo' ? (
            <div className="w-15 h-15 rounded-full bg-red-600 transition shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white transition hover:bg-neutral-100 shadow-inner" />
          )}
        </button>

        {/* Camera Flip Button */}
        <button
          onClick={onToggleFacing}
          className="w-13 h-13 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-white flex items-center justify-center active:scale-90 active:rotate-180 transition shadow-lg hover:bg-neutral-800"
          title="Cambiar Cámara (Trasera / Frontal)"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
