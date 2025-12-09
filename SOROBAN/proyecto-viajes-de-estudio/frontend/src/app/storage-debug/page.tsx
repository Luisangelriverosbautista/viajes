'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, RefreshCw, Trash2, Download, Copy, Check } from 'lucide-react';

export default function DiagnosticsPage() {
  const router = useRouter();
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    loadStorageData();
  }, [refreshCount]);

  const loadStorageData = () => {
    setLoading(true);
    try {
      const data: Record<string, any> = {};
      
      // Cargar datos estructurados
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userRegistry = JSON.parse(localStorage.getItem('user_registry') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
      
      data['registered_users'] = registeredUsers;
      data['user_registry'] = userRegistry;
      data['current_user'] = currentUser;

      // Buscar todas las empresas y sus viajes
      const allKeys = Object.keys(localStorage);
      const companyTripsKeys = allKeys.filter(k => k.startsWith('company_trips_'));
      
      companyTripsKeys.forEach(key => {
        const trips = JSON.parse(localStorage.getItem(key) || '[]');
        data[key] = trips;
      });

      // Buscar todas las reservas de clientes
      const clientReservationKeys = allKeys.filter(k => k.startsWith('client_reservations_'));
      clientReservationKeys.forEach(key => {
        const reservations = JSON.parse(localStorage.getItem(key) || '[]');
        data[key] = reservations;
      });

      setLocalStorageData(data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = (key: string) => {
    const json = JSON.stringify(localStorageData[key], null, 2);
    navigator.clipboard.writeText(json);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExportAll = () => {
    const allData = {
      timestamp: new Date().toISOString(),
      data: localStorageData,
    };
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearStorage = () => {
    if (confirm('âš ï¸ Â¿EstÃ¡s seguro de que quieres limpiar TODO el localStorage?')) {
      localStorage.clear();
      setRefreshCount(prev => prev + 1);
    }
  };

  const handleDeleteKey = (key: string) => {
    if (confirm(`Â¿Eliminar ${key}?`)) {
      localStorage.removeItem(key);
      setRefreshCount(prev => prev + 1);
    }
  };

  const renderValue = (value: any, depth = 0) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return '{...}';
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-stellar animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const stats = {
    registeredUsers: localStorageData['registered_users']?.length || 0,
    companies: localStorageData['registered_users']?.filter((u: any) => u.userType === 'company').length || 0,
    clients: localStorageData['registered_users']?.filter((u: any) => u.userType === 'client').length || 0,
    totalTrips: Object.keys(localStorageData)
      .filter(k => k.startsWith('company_trips_'))
      .reduce((sum, k) => sum + (Array.isArray(localStorageData[k]) ? localStorageData[k].length : 0), 0),
    totalReservations: Object.keys(localStorageData)
      .filter(k => k.startsWith('client_reservations_'))
      .reduce((sum, k) => sum + (Array.isArray(localStorageData[k]) ? localStorageData[k].length : 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">ðŸ”§ DiagnÃ³sticos</h1>
            <p className="text-gray-400">LocalStorage Inspector</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshCount(prev => prev + 1)}
              className="flex items-center gap-2 bg-stellar hover:bg-stellar/90 text-white px-4 py-2 rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={handleClearStorage}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Usuarios', value: stats.registeredUsers, color: 'blue' },
            { label: 'Empresas', value: stats.companies, color: 'purple' },
            { label: 'Clientes', value: stats.clients, color: 'cyan' },
            { label: 'Viajes', value: stats.totalTrips, color: 'green' },
            { label: 'Reservas', value: stats.totalReservations, color: 'yellow' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-${stat.color}-500/30`}
            >
              <p className={`text-${stat.color}-400 text-sm font-semibold`}>{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-300 mt-1`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Data Explorer */}
        <div className="space-y-4">
          {Object.keys(localStorageData).length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 text-center">
              <p className="text-gray-400">No hay datos en localStorage</p>
            </div>
          ) : (
            Object.entries(localStorageData).map(([key, value]) => (
              <div
                key={key}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-cyan-400 font-mono text-sm font-bold">{key}</span>
                    {Array.isArray(value) && (
                      <span className="text-gray-400 text-xs bg-slate-700/50 px-2 py-1 rounded">
                        {value.length} items
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyJson(key)}
                      className="p-2 hover:bg-slate-700 rounded transition-all"
                      title="Copiar JSON"
                    >
                      {copied === key ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key)}
                      className="p-2 hover:bg-red-900/30 rounded transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="bg-slate-900/50 rounded p-3 font-mono text-xs text-gray-300 max-h-60 overflow-y-auto">
                  {Array.isArray(value) ? (
                    <div className="space-y-2">
                      {value.length > 0 ? (
                        <>
                          <div className="text-cyan-400">[</div>
                          {value.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="ml-2">
                              {typeof item === 'object' ? (
                                <div className="text-gray-300">
                                  {'{'}
                                  <div className="ml-2">
                                    {Object.entries(item)
                                      .slice(0, 3)
                                      .map(([k, v]) => (
                                        <div key={k} className="text-gray-400">
                                          <span className="text-yellow-400">{k}</span>: {renderValue(v)}
                                        </div>
                                      ))}
                                    {Object.keys(item).length > 3 && (
                                      <div className="text-gray-500">...</div>
                                    )}
                                  </div>
                                  {'}'}
                                </div>
                              ) : (
                                <div className="text-gray-300">{renderValue(item)}</div>
                              )}
                            </div>
                          ))}
                          {value.length > 3 && (
                            <div className="text-gray-500 ml-2">... +{value.length - 3} more</div>
                          )}
                          <div className="text-cyan-400">]</div>
                        </>
                      ) : (
                        <div className="text-cyan-400">[]</div>
                      )}
                    </div>
                  ) : typeof value === 'object' && value !== null ? (
                    <div>
                      <div className="text-cyan-400">{'{'}</div>
                      <div className="ml-2 space-y-1">
                        {Object.entries(value)
                          .slice(0, 5)
                          .map(([k, v]) => (
                            <div key={k} className="text-gray-400">
                              <span className="text-yellow-400">{k}</span>: {renderValue(v)}
                            </div>
                          ))}
                        {Object.keys(value).length > 5 && (
                          <div className="text-gray-500">...</div>
                        )}
                      </div>
                      <div className="text-cyan-400">{'}'}</div>
                    </div>
                  ) : (
                    <div className="text-gray-300">{renderValue(value)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-300 transition-all"
          >
            â† Volver
          </button>
        </div>
      </div>
    </div>
  );
}







