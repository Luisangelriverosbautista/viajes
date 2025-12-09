'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [storageData, setStorageData] = useState<any>(null);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Leer TODO de localStorage
      const registry = localStorage.getItem('user_registry');
      const current = localStorage.getItem('current_user');
      
      // Leer todas las claves
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i) || '');
      }

      setAllKeys(keys);
      setStorageData({
        user_registry: registry ? JSON.parse(registry) : [],
        current_user: current ? JSON.parse(current) : null,
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-6">🔍 DIAGNÓSTICO COMPLETO</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* user_registry */}
        <div className="bg-slate-800 rounded-lg p-6 border-2 border-cyan-500">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            user_registry: {storageData?.user_registry?.length || 0} usuarios
          </h2>
          {storageData?.user_registry?.length === 0 ? (
            <p className="text-red-400 font-bold">❌ VACÍO!</p>
          ) : (
            <div className="space-y-2">
              {storageData?.user_registry?.map((user: any, idx: number) => (
                <div key={idx} className="bg-slate-900 p-3 rounded border border-cyan-600">
                  <p className="text-green-300 font-bold">
                    {idx + 1}. {user.companyName || user.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Type: {user.userType} | Email: {user.email}
                  </p>
                  <p className="text-blue-300 text-xs break-all">
                    Wallet: {user.publicKey}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* current_user */}
        <div className="bg-slate-800 rounded-lg p-6 border-2 border-purple-500">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">
            current_user (Sesión)
          </h2>
          {storageData?.current_user ? (
            <div className="bg-slate-900 p-4 rounded border border-purple-600">
              <p className="text-green-300 font-bold mb-2">
                {storageData.current_user.companyName || storageData.current_user.name}
              </p>
              <p className="text-gray-400 text-sm">
                Type: {storageData.current_user.userType}
              </p>
              <p className="text-blue-300 text-xs break-all">
                Wallet: {storageData.current_user.publicKey}
              </p>
            </div>
          ) : (
            <p className="text-yellow-400">⚠️ Sin sesión activa</p>
          )}
        </div>
      </div>

      {/* Comparación */}
      <div className="bg-slate-800 rounded-lg p-6 border-2 border-orange-500 mb-8">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">🔄 COMPARACIÓN</h2>
        {storageData?.current_user && storageData?.user_registry?.length > 0 ? (
          <div>
            {storageData.user_registry.find(
              (u: any) => u.publicKey === storageData.current_user.publicKey
            ) ? (
              <p className="text-green-400 font-bold">
                ✅ current_user SÍ está en user_registry
              </p>
            ) : (
              <p className="text-red-400 font-bold">
                ❌ current_user NO está en user_registry - PROBLEMA ENCONTRADO!
              </p>
            )}
          </div>
        ) : (
          <p className="text-yellow-400">⚠️ No hay datos para comparar</p>
        )}
      </div>

      {/* Todas las claves */}
      <div className="bg-slate-800 rounded-lg p-6 border-2 border-green-500">
        <h2 className="text-2xl font-bold text-green-400 mb-4">
          📦 Todas las claves en localStorage ({allKeys.length})
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {allKeys.filter(k => k).map((key, idx) => (
            <div key={idx} className="bg-slate-900 p-2 rounded border border-green-600">
              <p className="text-green-300 text-sm font-mono break-all">{key}</p>
              {key?.startsWith('company_trips_') && (
                <p className="text-yellow-300 text-xs">
                  Contiene: {JSON.parse(localStorage.getItem(key) || '[]').length} viajes
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





