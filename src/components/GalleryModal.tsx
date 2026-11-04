import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Info,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Star,
  Edit3,
  Save,
} from 'lucide-react';
import { CapturedPhoto } from '../types/camera';

interface GalleryModalProps {
  photos: CapturedPhoto[];
  isOpen: boolean;
  onClose: () => void;
  onDeletePhoto: (id: string) => void;
  onToggleGpsClean: (id: string) => void;
  onUpdateMetadata: (id: string, metadata: Partial<CapturedPhoto>) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  photos,
  isOpen,
  onClose,
  onDeletePhoto,
  onToggleGpsClean,
  onUpdateMetadata,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showMetadataDrawer, setShowMetadataDrawer] = useState<boolean>(true);
  const [isEditingIptc, setIsEditingIptc] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[selectedIndex] || photos[0];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleDownload = (format: 'dng' | 'tiff' | 'png' | 'jpg') => {
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = `APEX_RAW_${currentPhoto.resolution}_${currentPhoto.timestamp}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Exportado como .${format.toUpperCase()} (${currentPhoto.resolution})`);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between text-white select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between p-4 bg-neutral-950/90 border-b border-neutral-800 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 active:scale-95 transition"
          >
            <X className="w-5 h-5 text-neutral-300" />
          </button>
          <div>
            <h3 className="text-sm font-bold tracking-wide">
              Galería RAW & EXIF ({selectedIndex + 1} de {photos.length})
            </h3>
            <span className="text-[10px] text-amber-400 font-mono font-bold">
              {currentPhoto.resolution} · {currentPhoto.sizeMB.toFixed(1)} MB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetadataDrawer((prev) => !prev)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              showMetadataDrawer
                ? 'bg-white text-black border-white shadow'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>EXIF / IPTC</span>
          </button>

          <button
            onClick={() => onDeletePhoto(currentPhoto.id)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 transition"
            title="Eliminar foto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative flex-1 w-full flex items-center justify-center p-2 overflow-hidden bg-black">
        <img
          src={currentPhoto.url}
          alt="Foto capturada"
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all"
        />

        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 p-3 rounded-full bg-black/60 border border-neutral-700/80 text-white hover:bg-black/90 active:scale-90 transition backdrop-blur-md"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 rounded-full bg-black/60 border border-neutral-700/80 text-white hover:bg-black/90 active:scale-90 transition backdrop-blur-md"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {downloadSuccess && (
          <div className="absolute top-6 bg-emerald-500 text-black px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <FileCheck className="w-4 h-4" />
            {downloadSuccess}
          </div>
        )}
      </div>

      {/* Full Metadata & IPTC Editor Drawer */}
      {showMetadataDrawer && (
        <div className="w-full bg-neutral-950/95 border-t border-neutral-800 p-4 flex flex-col gap-3 z-30 max-h-[50vh] overflow-y-auto no-scrollbar">
          {/* Technical Specs Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-xs text-neutral-400 font-mono uppercase">
                Sensor: {currentPhoto.resolution} RAW DNG (14-Bit Bayer)
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                ISO {currentPhoto.iso} · {currentPhoto.shutter} · {currentPhoto.ev > 0 ? `+${currentPhoto.ev}` : currentPhoto.ev} EV · {currentPhoto.wb}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-400">
                {currentPhoto.sizeMB.toFixed(1)} MB DNG
              </span>
              <p className="text-[10px] text-neutral-400 font-mono">{currentPhoto.resolutionDimensions}</p>
            </div>
          </div>

          {/* Simulated RGB Waveform Histogram */}
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>HISTOGRAMA RGB DEL SENSOR</span>
              <span>14-BIT RAW READOUT</span>
            </div>
            <div className="h-10 w-full flex items-end gap-1 pt-1 opacity-90">
              <div className="flex-1 h-[70%] bg-red-500/80 rounded-t-xs" />
              <div className="flex-1 h-[85%] bg-green-500/80 rounded-t-xs" />
              <div className="flex-1 h-[60%] bg-blue-500/80 rounded-t-xs" />
              <div className="flex-1 h-[95%] bg-white/90 rounded-t-xs" />
              <div className="flex-1 h-[75%] bg-red-500/80 rounded-t-xs" />
              <div className="flex-1 h-[95%] bg-green-500/80 rounded-t-xs" />
              <div className="flex-1 h-[80%] bg-blue-500/80 rounded-t-xs" />
              <div className="flex-1 h-[45%] bg-white/90 rounded-t-xs" />
            </div>
          </div>

          {/* IPTC Metadata Editor (Autor, Copyright, Título, Estrellas) */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Metadatos IPTC Profesionales</span>
              </div>
              <button
                onClick={() => setIsEditingIptc(!isEditingIptc)}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold"
              >
                {isEditingIptc ? 'Listo' : 'Editar'}
              </button>
            </div>

            {isEditingIptc ? (
              <div className="flex flex-col gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Autor / Fotógrafo"
                  value={currentPhoto.author}
                  onChange={(e) => onUpdateMetadata(currentPhoto.id, { author: e.target.value })}
                  className="bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Copyright (ej. © 2026 Todos los derechos reservados)"
                  value={currentPhoto.copyright}
                  onChange={(e) => onUpdateMetadata(currentPhoto.id, { copyright: e.target.value })}
                  className="bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Título o Descripción de la foto"
                  value={currentPhoto.caption}
                  onChange={(e) => onUpdateMetadata(currentPhoto.id, { caption: e.target.value })}
                  className="bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>
            ) : (
              <div className="text-xs text-neutral-300 flex flex-col gap-0.5">
                <p><span className="text-neutral-500">Autor:</span> {currentPhoto.author || 'Sin especificar'}</p>
                <p><span className="text-neutral-500">Copyright:</span> {currentPhoto.copyright || '© 2026 Pro RAW'}</p>
                <p><span className="text-neutral-500">Nota:</span> {currentPhoto.caption || 'Foto en sensor puro'}</p>
              </div>
            )}

            {/* Rating Stars */}
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdateMetadata(currentPhoto.id, { rating: star })}
                  className="p-0.5"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= currentPhoto.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-[10px] text-neutral-400 ml-2 font-mono">Calificación IPTC</span>
            </div>
          </div>

          {/* Privacy GPS Purge Toggle */}
          <div className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${currentPhoto.gpsCleaned ? 'text-emerald-400' : 'text-neutral-400'}`} />
              <div>
                <p className="text-xs font-bold text-white">Privacidad Total (Borrar GPS)</p>
                <p className="text-[10px] text-neutral-400">
                  {currentPhoto.gpsCleaned
                    ? 'Metadatos de ubicación depurados sin rastro'
                    : 'Ubicación geográfica incluida en EXIF'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleGpsClean(currentPhoto.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                currentPhoto.gpsCleaned
                  ? 'bg-emerald-500 text-black border-emerald-500'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              {currentPhoto.gpsCleaned ? 'Activado' : 'Limpiar'}
            </button>
          </div>

          {/* Export Formats Row */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleDownload('dng')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 active:scale-95 transition"
            >
              <Download className="w-4 h-4 mb-1 text-amber-400" />
              <span className="text-[11px] font-bold">.DNG RAW</span>
              <span className="text-[9px] text-neutral-400">{currentPhoto.resolution} puro</span>
            </button>

            <button
              onClick={() => handleDownload('tiff')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 active:scale-95 transition"
            >
              <Download className="w-4 h-4 mb-1 text-white" />
              <span className="text-[11px] font-bold">.TIFF 16b</span>
              <span className="text-[9px] text-neutral-400">Máxima gama</span>
            </button>

            <button
              onClick={() => handleDownload('png')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 active:scale-95 transition"
            >
              <Download className="w-4 h-4 mb-1 text-white" />
              <span className="text-[11px] font-bold">.PNG</span>
              <span className="text-[9px] text-neutral-400">Lossless</span>
            </button>

            <button
              onClick={() => handleDownload('jpg')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 active:scale-95 transition"
            >
              <Download className="w-4 h-4 mb-1 text-white" />
              <span className="text-[11px] font-bold">.JPG</span>
              <span className="text-[9px] text-neutral-400">Web rápido</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
