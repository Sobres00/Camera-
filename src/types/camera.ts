export type CameraMode = 'slomo' | 'video' | 'photo' | 'portrait' | 'pano' | 'pro' | 'timelapse' | 'bulb' | 'aeb';

export type AspectRatio = '4:3' | '16:9' | '1:1' | '3:4' | '9:16';

export type SensorResolution = '12MP' | '50MP' | '108MP' | '200MP';

export type RawFormat = 'raw_dng' | 'jpeg_standard' | 'tiff_16bit';

export type FocusMode = 'af' | 'macro' | 'infinity' | 'lock' | 'manual';

export type FlashMode = 'off' | 'auto' | 'on' | 'torch';

export type ColorProfile = 'standard' | 'flat_log' | 'cine_d' | 'monochrome' | 'vivid' | 'slog3';

export type CompositionGuide = 'none' | 'thirds' | 'golden_spiral' | 'center_cross' | 'perspective_lines';

export interface QuickPreset {
  id: string;
  name: string;
  iso: number;
  shutterSpeed: string;
  focusMode: FocusMode;
  colorProfile: ColorProfile;
  resolution: SensorResolution;
  isRaw: boolean;
}

export interface CameraSettings {
  aspectRatio: AspectRatio;
  resolution: SensorResolution;
  rawFormat: RawFormat;
  isRawEnabled: boolean;
  gridEnabled: boolean;
  compositionGuide: CompositionGuide;
  levelEnabled: boolean;
  timerSeconds: 0 | 3 | 10;
  colorProfile: ColorProfile;
  rawPureSensor: boolean;
  zoom: number; // 0.5, 1, 2, 3, 5, 10
  flash: FlashMode;
  hdr: 'off' | 'auto' | 'on';
  iso: number; // 50 to 12800
  shutterSpeed: string; // "1/8000s" to "30s"
  ev: number; // -3.0 to +3.0
  wb: string; // "AUTO", "3200K", "4000K", "5500K", "6500K", "8000K"
  focusMode: FocusMode;
  focusDistance: number; // 0.0 to 1.0
  // Pro Assistance Overlays
  focusPeaking: boolean;
  peakingColor: 'cyan' | 'magenta' | 'lime' | 'red';
  zebraStripes: boolean;
  zebraThreshold: number; // 95% or 100%
  liveHistogram: boolean;
  focusMagnifier: boolean; // PIP Loupe 5x/10x
  // Pro Shooting Modes
  aebFrames: 3 | 5;
  bulbActive: boolean;
  bulbSeconds: number;
  intervalometerInterval: number; // in seconds
  // System & Noise
  shutterSound: boolean; // false = Silent mode
  hapticFeedback: boolean;
  zeroShutterLag: boolean;
  antiNoiseAi: boolean;
}

export interface CapturedPhoto {
  id: string;
  url: string;
  timestamp: number;
  format: RawFormat;
  aspectRatio: AspectRatio;
  resolution: SensorResolution;
  resolutionDimensions: string;
  iso: number;
  shutter: string;
  ev: number;
  wb: string;
  lens: string;
  colorProfile: ColorProfile;
  sizeMB: number;
  gpsCleaned: boolean;
  mode: CameraMode;
  // EXIF & IPTC editable fields
  author: string;
  copyright: string;
  caption: string;
  rating: number;
}
