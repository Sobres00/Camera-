/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CameraSettings, CameraMode, CapturedPhoto, QuickPreset, SensorResolution } from './types/camera';
import { TopBar } from './components/TopBar';
import { CameraViewfinder } from './components/CameraViewfinder';
import { ToolDrawer } from './components/ToolDrawer';
import { ProControlsStrip } from './components/ProControlsStrip';
import { BottomBar } from './components/BottomBar';
import { GalleryModal } from './components/GalleryModal';
import { SettingsModal } from './components/SettingsModal';
import { PresetsModal } from './components/PresetsModal';

export default function App() {
  const [settings, setSettings] = useState<CameraSettings>({
    aspectRatio: '4:3',
    resolution: '200MP', // Default to 200MP Ultra RAW
    rawFormat: 'raw_dng',
    isRawEnabled: true,
    gridEnabled: true,
    compositionGuide: 'thirds',
    levelEnabled: false,
    timerSeconds: 0,
    colorProfile: 'flat_log',
    rawPureSensor: true,
    zoom: 1,
    flash: 'off',
    hdr: 'auto',
    iso: 100,
    shutterSpeed: '1/500s',
    ev: 0.0,
    wb: 'AUTO',
    focusMode: 'af',
    focusDistance: 0.0,
    focusPeaking: false,
    peakingColor: 'cyan',
    zebraStripes: false,
    zebraThreshold: 95,
    liveHistogram: false,
    focusMagnifier: false,
    aebFrames: 3,
    bulbActive: false,
    bulbSeconds: 0,
    intervalometerInterval: 5,
    shutterSound: false, // SILENT by default
    hapticFeedback: true,
    zeroShutterLag: true,
    antiNoiseAi: true,
  });

  const [currentMode, setCurrentMode] = useState<CameraMode>('pro');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState<boolean>(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [smokeNotification, setSmokeNotification] = useState<string | null>(
    'Sensor Calibrado: 200 MP RAW (14-Bit DNG)'
  );

  const recordingIntervalRef = useRef<number | null>(null);

  // Initial gallery with 200MP, 108MP, and 50MP RAW photos
  const [photos, setPhotos] = useState<CapturedPhoto[]>([
    {
      id: 'photo_200mp',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=95',
      timestamp: Date.now() - 1000 * 60 * 8,
      format: 'raw_dng',
      aspectRatio: '4:3',
      resolution: '200MP',
      resolutionDimensions: '16384 x 12288 (200 MP)',
      iso: 100,
      shutter: '1/500s',
      ev: 0.0,
      wb: '5500K',
      lens: '24mm f/1.8 ISOCELL HP2',
      colorProfile: 'flat_log',
      sizeMB: 184.2,
      gpsCleaned: true,
      mode: 'pro',
      author: 'ProRAW Photographer',
      copyright: '© 2026 Todos los derechos reservados',
      caption: 'Lago alpino capturado en sensor puro 200MP sin compresión',
      rating: 5,
    },
    {
      id: 'photo_108mp',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=95',
      timestamp: Date.now() - 1000 * 60 * 35,
      format: 'raw_dng',
      aspectRatio: '16:9',
      resolution: '108MP',
      resolutionDimensions: '12000 x 9000 (108 MP)',
      iso: 400,
      shutter: '1/250s',
      ev: -0.3,
      wb: 'AUTO',
      lens: '50mm f/1.4 Cine',
      colorProfile: 'slog3',
      sizeMB: 102.4,
      gpsCleaned: false,
      mode: 'pro',
      author: 'Studio Master',
      copyright: '© 2026 Pro RAW Vision',
      caption: 'Noche estrellada y montañas en 108MP S-Log3',
      rating: 4,
    },
    {
      id: 'photo_50mp',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=95',
      timestamp: Date.now() - 1000 * 60 * 80,
      format: 'raw_dng',
      aspectRatio: '4:3',
      resolution: '50MP',
      resolutionDimensions: '8192 x 6144 (50 MP)',
      iso: 200,
      shutter: '1/1000s',
      ev: +0.3,
      wb: 'Daylight',
      lens: '35mm f/1.8 G-Master',
      colorProfile: 'vivid',
      sizeMB: 48.3,
      gpsCleaned: true,
      mode: 'photo',
      author: 'Alex Rivera',
      copyright: '© 2026 Studio',
      caption: 'Luz dorada en la montaña en 50MP',
      rating: 5,
    },
  ]);

  // Show floating smoke notification helper
  const triggerNotification = (msg: string) => {
    setSmokeNotification(msg);
    setTimeout(() => {
      setSmokeNotification(null);
    }, 3200);
  };

  const handleUpdateSettings = useCallback((partial: Partial<CameraSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.resolution && partial.resolution !== prev.resolution) {
        triggerNotification(`Resolución activada: ${partial.resolution} RAW`);
      }
      return updated;
    });
  }, []);

  // Web Audio mechanical shutter click
  const playShutterSound = useCallback(() => {
    if (!settings.shutterSound) return; // Silent mode

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // Audio permission
    }
  }, [settings.shutterSound]);

  // Execute photographic capture
  const handleCapture = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 120);

    playShutterSound();
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([15]);
    }

    const sampleUrls = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=95',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=95',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1800&q=95',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1800&q=95',
    ];
    const pickedUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];

    let dimensions = '16384 x 12288 (200 MP)';
    let sizeMb = 184.2;

    if (settings.resolution === '12MP') {
      dimensions = '4032 x 3024 (12 MP)';
      sizeMb = 4.8;
    } else if (settings.resolution === '50MP') {
      dimensions = '8192 x 6144 (50 MP)';
      sizeMb = 48.3;
    } else if (settings.resolution === '108MP') {
      dimensions = '12000 x 9000 (108 MP)';
      sizeMb = 102.4;
    }

    const newPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}`,
      url: pickedUrl,
      timestamp: Date.now(),
      format: settings.isRawEnabled ? 'raw_dng' : 'jpeg_standard',
      aspectRatio: settings.aspectRatio,
      resolution: settings.resolution,
      resolutionDimensions: dimensions,
      iso: settings.iso,
      shutter: settings.shutterSpeed,
      ev: settings.ev,
      wb: settings.wb,
      lens: facingMode === 'environment' ? '24mm f/1.8 Sensor Ultra' : '18mm f/2.2 Front',
      colorProfile: settings.colorProfile,
      sizeMB: sizeMb,
      gpsCleaned: true,
      mode: currentMode,
      author: 'Fotógrafo Pro',
      copyright: '© 2026 Todos los derechos reservados',
      caption: `Captura en ${settings.resolution} RAW DNG sin compresión`,
      rating: 5,
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    triggerNotification(`Capturado: ${settings.resolution} RAW DNG (${sizeMb.toFixed(1)} MB)`);
  }, [currentMode, facingMode, playShutterSound, settings]);

  // Video recording toggle
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingSeconds(0);
      if (settings.hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate([20, 50, 20]);
      }
      triggerNotification('Grabación 4K 60fps guardada');
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      if (settings.hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate([30]);
      }
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      triggerNotification('Grabando en 10-bit Log 4K 60fps');
    }
  }, [isRecording, settings.hapticFeedback]);

  // Shutter action distributor
  const handleShutterPress = () => {
    if (currentMode === 'video' || currentMode === 'slomo') {
      toggleRecording();
    } else if (currentMode === 'aeb') {
      // Auto Exposure Bracketing (3 rapid bursts)
      triggerNotification('AEB: Ráfaga de 3 tomas (-1EV, 0EV, +1EV)');
      handleCapture();
      setTimeout(handleCapture, 200);
      setTimeout(handleCapture, 400);
    } else {
      if (settings.timerSeconds > 0) {
        let remaining = settings.timerSeconds;
        triggerNotification(`Disparando en ${remaining} segundos...`);
        const timerToast = window.setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timerToast);
            handleCapture();
          } else {
            triggerNotification(`Disparando en ${remaining}s...`);
          }
        }, 1000);
      } else {
        handleCapture();
      }
    }
  };

  // Hardware Volume button listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'AudioVolumeDown' || e.key === 'AudioVolumeUp' || e.key === 'VolumeDown' || e.key === 'VolumeUp') {
        e.preventDefault();
        handleShutterPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleApplyPreset = (preset: QuickPreset) => {
    setSettings((prev) => ({
      ...prev,
      iso: preset.iso,
      shutterSpeed: preset.shutterSpeed,
      focusMode: preset.focusMode,
      colorProfile: preset.colorProfile,
      resolution: preset.resolution,
      isRawEnabled: preset.isRaw,
    }));
    triggerNotification(`Preset aplicado: ${preset.name} (${preset.resolution})`);
  };

  const formatTimecode = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* 1. Top Bar */}
      <TopBar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        recordingTime={formatTimecode(recordingSeconds)}
        isRecording={isRecording}
      />

      {/* 2. Fullscreen Camera Viewfinder with Focus Peaking, Zebra, Histogram, Lupa */}
      <div className="absolute inset-0 z-0">
        <CameraViewfinder
          settings={settings}
          facingMode={facingMode}
          isFlashing={isFlashing}
          smokeNotification={smokeNotification}
        />
      </div>

      {/* 3. Floating Interactive Panels Area */}
      <div className="w-full flex flex-col items-center gap-2 z-20 pointer-events-auto">
        {/* Pro manual sensor bar (active in PRO mode) */}
        {currentMode === 'pro' && (
          <ProControlsStrip
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {/* The Exact Floating Tool Drawer with 12MP, 50MP, 108MP, 200MP RAW */}
        <ToolDrawer
          settings={settings}
          isOpen={isToolDrawerOpen}
          onToggleOpen={() => setIsToolDrawerOpen((prev) => !prev)}
          onUpdateSettings={handleUpdateSettings}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
          onOpenPresetsModal={() => setIsPresetsOpen(true)}
        />
      </div>

      {/* 4. Bottom Controls & Mode Carousel */}
      <BottomBar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onShutterPress={handleShutterPress}
        onToggleFacing={() =>
          setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
        }
        onOpenGallery={() => setIsGalleryOpen(true)}
        lastPhoto={photos[0] || null}
        photoCount={photos.length}
        isRecording={isRecording}
      />

      {/* 5. Fullscreen Gallery Modal with EXIF, IPTC editor & 200MP RAW Export */}
      <GalleryModal
        photos={photos}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onDeletePhoto={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
        onToggleGpsClean={(id) =>
          setPhotos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, gpsCleaned: !p.gpsCleaned } : p))
          )
        }
        onUpdateMetadata={(id, meta) =>
          setPhotos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...meta } : p))
          )
        }
      />

      {/* 6. Settings Modal & Android Native Studio Code Exporter */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 7. Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        currentSettings={settings}
        onApplyPreset={handleApplyPreset}
      />
    </main>
  );
}
