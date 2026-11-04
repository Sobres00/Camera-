import React, { useState } from 'react';
import { X, BookmarkPlus, Check, SlidersHorizontal, Sparkles, Trash2 } from 'lucide-react';
import { CameraSettings, QuickPreset } from '../types/camera';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: CameraSettings;
  onApplyPreset: (preset: QuickPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApplyPreset,
}) => {
  const [presets, setPresets] = useState<QuickPreset[]>([
    {
      id: 'preset_1',
      name: 'Noche Callejera',
      iso: 3200,
      shutterSpeed: '1/60s',
      focusMode: 'af',
      colorProfile: 'flat_log',
      resolution: '50MP',
      isRaw: true,
    },
    {
      id: 'preset_2',
      name: 'Retrato Macro Bokeh',
      iso: 100,
      shutterSpeed: '1/500s',
      focusMode: 'macro',
      colorProfile: 'vivid',
      resolution: '108MP',
      isRaw: true,
    },
    {
      id: 'preset_3',
      name: 'Arquitectura & Paisaje 200MP',
      iso: 50,
      shutterSpeed: '1/250s',
      focusMode: 'infinity',
      colorProfile: 'standard',
      resolution: '200MP',
      isRaw: true,
    },
    {
      id: 'preset_4',
      name: 'Astrofotografía / Larga Exp.',
      iso: 6400,
      shutterSpeed: '30s',
      focusMode: 'infinity',
      colorProfile: 'flat_log',
      resolution: '200MP',
      isRaw: true,
    },
    {
      id: 'preset_5',
      name: 'Cine DNG (S-Log3)',
      iso: 400,
      shutterSpeed: '1/50s',
      focusMode: 'manual',
      colorProfile: 'slog3',
      resolution: '108MP',
      isRaw: true,
    },
  ]);

  const [newPresetName, setNewPresetName] = useState<string>('');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!newPresetName.trim()) return;
    const newPreset: QuickPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      iso: currentSettings.iso,
      shutterSpeed: currentSettings.shutterSpeed,
      focusMode: currentSettings.focusMode,
      colorProfile: currentSettings.colorProfile,
      resolution: currentSettings.resolution,
      isRaw: currentSettings.isRawEnabled,
    };

    setPresets([newPreset, ...presets]);
    setNewPresetName('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPresets(presets.filter((p) => p.id !== id));
  };

  const handleSelect = (preset: QuickPreset) => {
    onApplyPreset(preset);
    setAppliedId(preset.id);
    setTimeout(() => {
      setAppliedId(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-white select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold tracking-wide">Presets Fotográficos Rápidos</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save current config as preset input */}
        <div className="p-4 bg-neutral-900/60 border-b border-neutral-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Guardar ajuste actual como nuevo preset..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="flex-1 bg-black/80 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleSaveCurrent}
            className="bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-300 active:scale-95 transition"
          >
            Guardar
          </button>
        </div>

        {/* Presets List */}
        <div className="p-4 overflow-y-auto flex-1 no-scrollbar flex flex-col gap-2.5">
          {presets.map((preset) => {
            const isApplied = appliedId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelect(preset)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isApplied
                    ? 'bg-amber-400/20 border-amber-400 text-white'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-200'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{preset.name}</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                      {preset.resolution}
                    </span>
                    {preset.isRaw && (
                      <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
                        RAW DNG
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    ISO {preset.iso} · {preset.shutterSpeed} · {preset.focusMode.toUpperCase()} · {preset.colorProfile.replace('_', ' ').toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isApplied ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Check className="w-4 h-4" />
                      <span>Cargado</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-800">
                      Aplicar
                    </span>
                  )}

                  {preset.id.startsWith('custom_') && (
                    <button
                      onClick={(e) => handleDelete(preset.id, e)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
