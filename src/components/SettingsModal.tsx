import React, { useState } from 'react';
import {
  X,
  VolumeX,
  Volume2,
  Code2,
  Smartphone,
  Shield,
  Layers,
  Copy,
  Check,
  FileCode,
  Flame,
} from 'lucide-react';
import { CameraSettings } from '../types/camera';
import {
  ANDROID_MANIFEST_XML,
  CAMERA2_RAW_SERVICE_KT,
  BUILD_GRADLE_KTS,
} from '../services/nativeAndroidCode';

interface SettingsModalProps {
  settings: CameraSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (partial: Partial<CameraSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'android_code'>('settings');
  const [activeCodeFile, setActiveCodeFile] = useState<'manifest' | 'service' | 'gradle'>('manifest');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const getCodeContent = () => {
    switch (activeCodeFile) {
      case 'manifest':
        return ANDROID_MANIFEST_XML;
      case 'service':
        return CAMERA2_RAW_SERVICE_KT;
      case 'gradle':
        return BUILD_GRADLE_KTS;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 text-white select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold tracking-wide">
              {activeTab === 'settings' ? 'Ajustes de Cámara del Sistema' : 'Código Nativo Android Studio (APK)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-white text-white bg-white/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Preferencias & Sistema
          </button>
          <button
            onClick={() => setActiveTab('android_code')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'android_code'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Código Nativo Android (APK)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 no-scrollbar flex flex-col gap-5">
          {activeTab === 'settings' ? (
            <>
              {/* Shutter Sound Setting (Zero noise request) */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${settings.shutterSound ? 'bg-neutral-800 text-white' : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'}`}>
                    {settings.shutterSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sonido del Obturador</h4>
                    <p className="text-xs text-neutral-400">
                      {settings.shutterSound
                        ? 'Reproduce sonido de disparo mecánico'
                        : 'Silencioso absoluto (cero ruido para máxima discreción)'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ shutterSound: !settings.shutterSound })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    settings.shutterSound
                      ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                      : 'bg-white text-black font-extrabold shadow-md'
                  }`}
                >
                  {settings.shutterSound ? 'Audible' : 'Silencioso'}
                </button>
              </div>

              {/* Default Android System Camera Setup */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Cámara Predeterminada del Sistema</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Configurada con intents nativos de Android:
                  <code className="text-neutral-300 block my-1 font-mono text-[11px] bg-black/60 p-2 rounded border border-neutral-800">
                    android.media.action.STILL_IMAGE_CAMERA_SECURE
                  </code>
                  Permite abrir esta cámara con el **doble toque del botón de encendido** de tu celular, incluso con la pantalla bloqueada, y usar los botones físicos de volumen como disparador.
                </p>
              </div>

              {/* Hardware Volume Keys Trigger */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Botones Físicos de Volumen</h4>
                  <p className="text-xs text-neutral-400">
                    Usa los botones de subir o bajar volumen como disparador físico del sensor.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Habilitado
                </span>
              </div>

              {/* Zero Shutter Lag (ZSL) */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Zero Shutter Lag (ZSL)</h4>
                  <p className="text-xs text-neutral-400">
                    Buffer circular en memoria para disparar en 0 milisegundos sin retraso.
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ zeroShutterLag: !settings.zeroShutterLag })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    settings.zeroShutterLag
                      ? 'bg-white text-black border-white shadow'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {settings.zeroShutterLag ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Anti-Noise AI Local */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold text-white">IA Predictiva Local (100% Offline)</h4>
                  <p className="text-xs text-neutral-400">
                    Reducción de ruido matemática en la GPU del teléfono sin enviar datos a internet.
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ antiNoiseAi: !settings.antiNoiseAi })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    settings.antiNoiseAi
                      ? 'bg-white text-black border-white shadow'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {settings.antiNoiseAi ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Haptic Feedback */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Vibración Háptica</h4>
                  <p className="text-xs text-neutral-400">
                    Vibración mecánica al pulsar el obturador y al ajustar diales.
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ hapticFeedback: !settings.hapticFeedback })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    settings.hapticFeedback
                      ? 'bg-white text-black border-white shadow'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {settings.hapticFeedback ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </>
          ) : (
            /* Android Native Code Hub */
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Proyecto Nativo Android Studio</h4>
                  <p className="text-[11px] text-neutral-300">
                    Archivos Kotlin y manifiesto con todos los permisos listos para compilar tu APK.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-neutral-200 active:scale-95 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Archivo'}</span>
                </button>
              </div>

              {/* File selector pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveCodeFile('manifest')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    activeCodeFile === 'manifest'
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>AndroidManifest.xml</span>
                </button>

                <button
                  onClick={() => setActiveCodeFile('service')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    activeCodeFile === 'service'
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Camera2RawService.kt</span>
                </button>

                <button
                  onClick={() => setActiveCodeFile('gradle')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    activeCodeFile === 'gradle'
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>build.gradle.kts</span>
                </button>
              </div>

              {/* Code viewer box */}
              <div className="relative rounded-2xl bg-black border border-neutral-800 p-4 font-mono text-xs text-neutral-300 max-h-80 overflow-y-auto no-scrollbar">
                <pre className="whitespace-pre-wrap leading-relaxed">{getCodeContent()}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
