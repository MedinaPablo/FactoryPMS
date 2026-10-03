import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
  FileArchive,
  FileJson,
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';
import { storage } from '../services/storage';
import { exportDatabaseToZip, importDatabaseFromZipOrJson, BackupStats } from '../services/backupZipService';

interface DatabaseToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const DatabaseToolsModal: React.FC<DatabaseToolsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastRestoredStats, setLastRestoredStats] = useState<BackupStats | null>(null);

  if (!isOpen) return null;

  // Export as ZIP (Compressed package with database JSON and human-readable documentation)
  const handleExportZip = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const json = storage.exportDatabase();
      const { blob, filename, stats } = await exportDatabaseToZip(json);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessMessage(
        `Copia de seguridad ZIP descargada (${stats.venturesCount} fábricas, ${stats.productsCount} productos, ${stats.budgetsCount} presupuestos, ${stats.ordersCount} órdenes).`
      );
      setTimeout(() => setSuccessMessage(null), 4500);
    } catch {
      setErrorMessage('Ocurrió un error al empaquetar y exportar el archivo ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export as standard JSON
  const handleExportJson = () => {
    try {
      const json = storage.exportDatabase();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MedinaFactory_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMessage('Copia de seguridad en archivo JSON descargada correctamente.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch {
      setErrorMessage('Error al exportar la base de datos en JSON.');
    }
  };

  // Import from either ZIP or JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const { jsonString, isZip, stats } = await importDatabaseFromZipOrJson(file);
      storage.importDatabase(jsonString);

      setLastRestoredStats(stats);
      setSuccessMessage(
        `¡Base de datos restaurada con éxito desde archivo ${isZip ? 'ZIP' : 'JSON'}! Se cargaron ${stats.venturesCount} emprendimientos, ${stats.productsCount} productos con fórmulas y ${stats.ordersCount} órdenes de producción.`
      );
      onRefreshData();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar el archivo de copia de seguridad.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        '¿Desea restaurar todos los datos a la configuración inicial de fábrica (Panadería, Empanadas, Cartelería, Calzado y usuario root)? Esta acción reemplazará los cambios no respaldados.'
      )
    ) {
      storage.resetToFactoryDefaults();
      onRefreshData();
      setLastRestoredStats(null);
      setSuccessMessage('Datos restablecidos a la configuración de fábrica original.');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Copia de Seguridad y Restauración</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  SOPORTE ZIP
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Respaldo comprimido de todos los emprendimientos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5 font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5 font-medium animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Export section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Exportar Copia de Seguridad</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Descargue un paquete comprimido con todas las fábricas, costos, recetas, órdenes y usuarios.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleExportZip}
                disabled={isProcessing}
                className="flex-1 min-w-[150px] px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                title="Exportar archivo .ZIP con base de datos y documentación"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileArchive className="w-4 h-4 text-blue-200" />
                )}
                <span>Exportar como ZIP</span>
                <span className="text-[9px] bg-blue-700 text-blue-100 px-1.5 py-0.2 rounded font-mono uppercase">
                  Recomendado
                </span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Exportar archivo .JSON simple"
              >
                <FileJson className="w-3.5 h-3.5 text-slate-500" />
                <span>Solo JSON</span>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Restaurar Copia de Seguridad</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cargue directamente su archivo <strong>.ZIP</strong> o un archivo <strong>.JSON</strong> para restablecer el sistema.
              </p>
            </div>

            <input
              type="file"
              accept=".zip,.json,application/zip,application/x-zip-compressed,application/json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white border border-indigo-200 hover:bg-indigo-50/50 hover:border-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <Upload className="w-4 h-4 text-indigo-600" />
              )}
              <span>Seleccionar Archivo (.ZIP o .JSON)</span>
            </button>
          </div>

          {/* Factory Reset */}
          <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reiniciar a Fábrica</span>
              </h4>
              <p className="text-[11px] text-rose-800">
                Restablece los 4 rubros (Pan, Empanadas, Carteles, Zapatillas) a su estado original.
              </p>
            </div>
            <button
              onClick={handleResetToDefaults}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              Reiniciar
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Formatos compatibles: .ZIP y .JSON</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

