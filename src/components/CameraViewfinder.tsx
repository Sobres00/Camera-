import React, { useEffect, useRef, useState } from 'react';
import { CameraSettings } from '../types/camera';
import { Eye, Search, Maximize2 } from 'lucide-react';

interface CameraViewfinderProps {
  settings: CameraSettings;
  facingMode: 'environment' | 'user';
  isFlashing: boolean;
  onFocusTap?: (x: number, y: number) => void;
  smokeNotification?: string | null;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  settings,
  facingMode,
  isFlashing,
  onFocusTap,
  smokeNotification,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [magnifierZoom, setMagnifierZoom] = useState<5 | 10>(5);

  // Initialize camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStreamActive(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 3840 },
            height: { ideal: 2160 },
          },
          audio: false,
        });

        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreamActive(true);
        }
      } catch (err) {
        console.warn('Cámara física no disponible, simulador de sensor activo:', err);
        setStreamActive(false);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Electronic horizon level
  useEffect(() => {
    if (!settings.levelEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        setTiltAngle(Math.round(e.gamma));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [settings.levelEnabled]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFocusPoint({ x, y });
    if (onFocusTap) onFocusTap(x, y);

    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setTimeout(() => {
      setFocusPoint(null);
    }, 2500);
  };

  const getFilterStyle = () => {
    switch (settings.colorProfile) {
      case 'monochrome':
        return 'grayscale(100%) contrast(110%)';
      case 'vivid':
        return 'saturate(145%) contrast(108%)';
      case 'flat_log':
        return 'contrast(68%) brightness(112%) saturate(75%)';
      case 'slog3':
        return 'contrast(62%) brightness(118%) saturate(65%)';
      case 'cine_d':
        return 'contrast(85%) saturate(110%) sepia(8%)';
      default:
        return 'none';
    }
  };

  const getAspectClass = () => {
    switch (settings.aspectRatio) {
      case '1:1':
        return 'aspect-square max-h-[85vw]';
      case '16:9':
        return 'aspect-[9/16] h-full';
      case '3:4':
        return 'aspect-[3/4] h-full';
      case '4:3':
      default:
        return 'aspect-[3/4] sm:aspect-[4/3] h-full';
    }
  };

  const isLevelStraight = Math.abs(tiltAngle) <= 1;

  // Peaking color styles
  const getPeakingBorderColor = () => {
    switch (settings.peakingColor) {
      case 'magenta':
        return '#f43f5e';
      case 'lime':
        return '#84cc16';
      case 'red':
        return '#ef4444';
      case 'cyan':
      default:
        return '#06b6d4';
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none cursor-crosshair"
    >
      {/* Floating Translucent Smoke Toast Notification */}
      {smokeNotification && (
        <div className="absolute top-14 z-40 bg-neutral-950/80 border border-neutral-700/60 shadow-2xl backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-white tracking-wide animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{smokeNotification}</span>
        </div>
      )}

      {/* Live RGB Histogram in Top Left */}
      {settings.liveHistogram && (
        <div className="absolute top-14 left-4 z-30 bg-neutral-950/80 border border-neutral-800 rounded-xl p-2 flex flex-col gap-1 backdrop-blur-md w-36 pointer-events-none">
          <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
            <span>HISTOGRAMA RGB</span>
            <span className="text-emerald-400 font-bold">RAW 60fps</span>
          </div>
          <div className="h-10 w-full flex items-end gap-0.5 pt-1">
            <div className="flex-1 h-[65%] bg-red-500/80 rounded-t-xs" />
            <div className="flex-1 h-[85%] bg-green-500/80 rounded-t-xs" />
            <div className="flex-1 h-[60%] bg-blue-500/80 rounded-t-xs" />
            <div className="flex-1 h-[95%] bg-white/90 rounded-t-xs" />
            <div className="flex-1 h-[70%] bg-red-500/80 rounded-t-xs" />
            <div className="flex-1 h-[90%] bg-green-500/80 rounded-t-xs" />
            <div className="flex-1 h-[75%] bg-blue-500/80 rounded-t-xs" />
            <div className="flex-1 h-[40%] bg-white/90 rounded-t-xs" />
          </div>
        </div>
      )}

      {/* Focus Magnifier Loupe PIP (5x / 10x) */}
      {settings.focusMagnifier && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-40 left-4 z-40 w-36 h-36 rounded-2xl border-2 border-amber-400 bg-neutral-950/90 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-2.5 py-1 bg-neutral-900 border-b border-neutral-800 text-[10px] font-bold text-neutral-300">
            <div className="flex items-center gap-1">
              <Search className="w-3 h-3 text-amber-400" />
              <span>LUPA {magnifierZoom}x</span>
            </div>
            <button
              onClick={() => setMagnifierZoom((prev) => (prev === 5 ? 10 : 5))}
              className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded text-white"
            >
              {magnifierZoom === 5 ? 'Cambiar a 10x' : 'Cambiar a 5x'}
            </button>
          </div>
          <div
            className="flex-1 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=95')`,
              transform: `scale(${magnifierZoom})`,
              transformOrigin: '50% 50%',
            }}
          />
        </div>
      )}

      {/* Main Viewport Container */}
      <div className={`relative w-full max-w-full flex items-center justify-center transition-all duration-300 ${getAspectClass()}`}>
        {streamActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{
              filter: getFilterStyle(),
              transform: `scale(${settings.zoom}) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
              transition: 'transform 0.2s ease-out',
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full object-cover bg-cover bg-center transition-transform duration-200"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=95')`,
              filter: getFilterStyle(),
              transform: `scale(${settings.zoom})`,
            }}
          />
        )}

        {/* Shutter Flash Animation */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-150" />
        )}

        {/* Focus Peaking Shader Lines */}
        {settings.focusPeaking && (
          <div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-screen opacity-85"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, transparent 60%, ${getPeakingBorderColor()} 100%)`,
            }}
          >
            {/* Outline highlight lines */}
            <svg className="w-full h-full absolute inset-0">
              <path
                d="M 120,300 Q 220,200 350,310 T 500,450"
                stroke={getPeakingBorderColor()}
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="4 2"
                className="animate-pulse"
              />
              <circle
                cx="50%"
                cy="50%"
                r="90"
                stroke={getPeakingBorderColor()}
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        )}

        {/* Zebra Stripes Overlay for Highlights (>95%) */}
        {settings.zebraStripes && (
          <div
            className="absolute top-0 left-0 right-0 h-44 pointer-events-none z-20 opacity-60 mix-blend-difference"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 18px)',
            }}
          />
        )}

        {/* Composition Guides */}
        {settings.gridEnabled && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 border border-white/20">
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div />
          </div>
        )}

        {/* Golden Spiral (Fibonacci) */}
        {settings.compositionGuide === 'golden_spiral' && (
          <div className="absolute inset-0 pointer-events-none z-10 opacity-70">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 0,0 L 100,0 L 100,100 L 0,100 Z M 61.8,0 L 61.8,100 M 61.8,61.8 L 100,61.8 M 76.4,61.8 L 76.4,100"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="0.8"
                fill="none"
              />
              <path
                d="M 0,100 A 100,100 0 0,1 100,0 A 61.8,61.8 0 0,1 61.8,61.8 A 38.2,38.2 0 0,1 100,61.8"
                stroke="#f59e0b"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </div>
        )}

        {/* Electronic Horizon Level */}
        {settings.levelEnabled && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{ transform: `rotate(${-tiltAngle}deg)` }}
          >
            <div className="flex items-center gap-6">
              <div
                className={`w-16 h-0.5 transition-colors ${
                  isLevelStraight ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/60'
                }`}
              />
              <div
                className={`w-3 h-3 rounded-full border-2 transition-colors flex items-center justify-center text-[8px] font-mono font-bold ${
                  isLevelStraight
                    ? 'border-emerald-400 text-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'border-white/70 text-white/90'
                }`}
              >
                {Math.abs(tiltAngle)}°
              </div>
              <div
                className={`w-16 h-0.5 transition-colors ${
                  isLevelStraight ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/60'
                }`}
              />
            </div>
          </div>
        )}

        {/* Corner Crop Framing Brackets */}
        <div className="absolute inset-4 pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/60" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/60" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/60" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/60" />
        </div>

        {/* Tap-to-Focus Reticle */}
        {focusPoint ? (
          <div
            className="absolute w-14 h-14 -ml-7 -mt-7 border-2 border-amber-400 rounded-md pointer-events-none z-20 animate-ping duration-300 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            style={{ left: focusPoint.x, top: focusPoint.y }}
          >
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-40">
            <div className="w-6 h-6 border border-white/50 flex items-center justify-center">
              <div className="w-1 h-1 bg-white/70 rounded-full" />
            </div>
          </div>
        )}

        {/* High Resolution Sensor Badge */}
        <div className="absolute top-3 right-3 bg-neutral-950/80 border border-neutral-700/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest text-amber-400 pointer-events-none z-10 backdrop-blur-md">
          {settings.isRawEnabled ? `RAW · ${settings.resolution}` : `${settings.resolution} JPG`}
        </div>
      </div>
    </div>
  );
};
