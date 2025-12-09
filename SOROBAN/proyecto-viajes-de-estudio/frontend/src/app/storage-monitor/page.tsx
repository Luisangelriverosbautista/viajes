'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { RefreshCw, Download, Trash2, Eye, EyeOff } from 'lucide-react';

interface StorageEntry {
  key: string;
  value: string;
  size: number;
  type: 'user_registry' | 'company_trips' | 'reservations' | 'session' | 'other';
  parsedValue?: any;
  error?: string;
}

export default function StorageMonitorPage() {
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [history, setHistory] = useState<{ timestamp: string; count: number; users: string[] }[]>([]);

  const categorizeKey = (key: string): StorageEntry['type'] => {
    if (key === 'user_registry') return 'user_registry';
    if (key.startsWith('company_trips_')) return 'company_trips';
    if (key.startsWith('client_reservations_')) return 'reservations';
    if (['current_user', 'user_wallet', 'user_type'].includes(key)) return 'session';
    return 'other';
  };

  const loadStorage = () => {
    try {
      const entries: StorageEntry[] = [];
      let userCount = 0;
      let userNames: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const value = localStorage.getItem(key) || '';
        const type = categorizeKey(key);

        let parsedValue: any = undefined;
        let error: string | undefined = undefined;

        try {
          parsedValue = JSON.parse(value);
          // Contar usuarios si es user_registry
          if (key === 'user_registry' && Array.isArray(parsedValue)) {
            userCount = parsedValue.length;
            userNames = parsedValue.map((u: any) => u.companyName || u.name || '?');
          }
        } catch (e) {
          error = 'No es JSON válido';
        }

        entries.push({
          key,
          value,
          size: new Blob([value]).size,
          type,
          parsedValue,
          error,
        });
      }

      // Agregar a historial
      setHistory((prev) => [
        ...prev.slice(-99), // Mantener últimas 100 lecturas
        {
          timestamp: new Date().toLocaleTimeString(),
          count: userCount,
          users: userNames,
        },
      ]);

      setEntries(entries);
    } catch (err) {
      console.error('Error leyendo storage:', err);
    }
  };

  useEffect(() => {
    loadStorage();
    const interval = setInterval(loadStorage, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
  const userRegistry = entries.find((e) => e.key === 'user_registry');
  const userCount = userRegistry?.parsedValue?.length || 0;
  const tripCount = entries.filter((e) => e.type === 'company_trips').reduce(
    (sum, e) => sum + (Array.isArray(e.parsedValue) ? e.parsedValue.length : 0),
    0
  );

  const clearStorage = () => {
    if (confirm('¿Limpiar TODO el localStorage? ⚠️')) {
      localStorage.clear();
      loadStorage();
    }
  };

  const downloadJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      summary: { userCount, tripCount, totalSize },
      entries: entries.map((e) => ({
        key: e.key,
        type: e.type,
        size: e.size,
        value: e.parsedValue || e.value,
      })),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 font-mono text-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔍 Storage Monitor</h1>
          <p className="text-purple-200">Monitor en tiempo real del localStorage</p>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-4">
            <div className="text-green-400 text-2xl font-bold">{userCount}</div>
            <div className="text-green-200 text-xs mt-1">USUARIOS</div>
          </div>
          <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 text-2xl font-bold">{tripCount}</div>
            <div className="text-blue-200 text-xs mt-1">VIAJES</div>
          </div>
          <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-yellow-400 text-2xl font-bold">{(totalSize / 1024).toFixed(1)} KB</div>
            <div className="text-yellow-200 text-xs mt-1">TAMAÑO TOTAL</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
            <div className="text-purple-400 text-2xl font-bold">{entries.length}</div>
            <div className="text-purple-200 text-xs mt-1">CLAVES</div>
          </div>
        </div>

        {/* Botones de control */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={loadStorage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <RefreshCw size={16} /> Refrescar
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refrescar
          </label>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <option value={500}>500ms</option>
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
          </select>

          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <Download size={16} /> Descargar JSON
          </button>

          <button
            onClick={clearStorage}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <Trash2 size={16} /> Limpiar
          </button>
        </div>

        {/* Lista de valores */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Contenido del Storage</h2>

          {entries.map((entry) => (
            <div
              key={entry.key}
              className={`border rounded-lg overflow-hidden transition ${
                entry.type === 'user_registry'
                  ? 'border-green-500/50 bg-green-500/5'
                  : entry.type === 'company_trips'
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : entry.type === 'reservations'
                  ? 'border-purple-500/50 bg-purple-500/5'
                  : 'border-slate-700/50 bg-slate-700/5'
              }`}
            >
              {/* Encabezado */}
              <div
                onClick={() => setExpandedKey(expandedKey === entry.key ? null : entry.key)}
                className="p-4 cursor-pointer hover:bg-slate-700/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  {expandedKey === entry.key ? (
                    <EyeOff size={16} className="text-slate-400" />
                  ) : (
                    <Eye size={16} className="text-slate-400" />
                  )}
                  <span className="font-bold text-white">{entry.key}</span>
                  <span className="text-xs text-slate-400 ml-auto">{entry.size} bytes</span>
                </div>
              </div>

              {/* Contenido expandido */}
              {expandedKey === entry.key && (
                <div className="border-t border-slate-700/50 p-4 bg-slate-900/50 max-h-96 overflow-auto">
                  {entry.error ? (
                    <div className="text-red-400">❌ {entry.error}</div>
                  ) : entry.parsedValue ? (
                    <pre className="text-slate-300 whitespace-pre-wrap break-words">
                      {JSON.stringify(entry.parsedValue, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-400">{entry.value}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">📊 Historial de cambios</h2>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-64 overflow-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-300 border-b border-slate-700">
                  <tr>
                    <th className="text-left py-2">Hora</th>
                    <th className="text-left py-2">Usuarios</th>
                    <th className="text-left py-2">Usuarios Detectados</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-2 text-slate-400">{h.timestamp}</td>
                      <td className="py-2 text-white font-bold">{h.count}</td>
                      <td className="py-2 text-slate-300">{h.users.join(', ') || 'ninguno'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





