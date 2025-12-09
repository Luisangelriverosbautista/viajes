'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import * as FreighterAPI from '@stellar/freighter-api';

export function FreighterStatus() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        console.log('🔍 [FreighterStatus] Verificando disponibilidad de Freighter...');
        console.log('🔍 [FreighterStatus] FreighterAPI disponible:', !!FreighterAPI);
        
        // Intentar obtener dirección (esto verificará que Freighter está conectado)
        const addressResult = await FreighterAPI.getAddress();
        console.log('🔍 [FreighterStatus] Resultado de getAddress:', addressResult);
        
        const address = typeof addressResult === 'string' ? addressResult : addressResult?.address;
        
        if (address) {
          console.log('✅ [FreighterStatus] Freighter disponible y conectado:', address.substring(0, 10) + '...');
          setIsAvailable(true);
          setIsConnected(true);
        }
      } catch (err: any) {
        // Esto es normal si Freighter no está conectado o no está instalada
        const errorMsg = err.message || String(err);
        
        if (errorMsg.includes('popup') || errorMsg.includes('window') || errorMsg.includes('not defined')) {
          console.log('ℹ️ [FreighterStatus] Freighter no está instalada');
          setIsAvailable(false);
        } else if (errorMsg.includes('user') || errorMsg.includes('denied') || errorMsg.includes('not connected')) {
          console.log('ℹ️ [FreighterStatus] Freighter no está conectada');
          setIsAvailable(true);
          setIsConnected(false);
        } else {
          console.warn('⚠️ [FreighterStatus] Error:', errorMsg);
          setIsAvailable(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkFreighter();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <Loader className="w-5 h-5 text-slate-400 animate-spin" />
          <p className="text-slate-300">Verificando Freighter...</p>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-semibold">⚠️ Freighter no detectada</p>
            <p className="text-yellow-200/80 text-sm mt-1">
              Para continuar necesitas instalar Freighter Wallet.
            </p>
            <div className="mt-3 space-y-2">
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm block"
              >
                📥 Descargar Freighter →
              </a>
              <details className="text-xs text-yellow-200/60">
                <summary className="cursor-pointer hover:text-yellow-200/80">Instrucciones</summary>
                <div className="mt-2 space-y-1 text-yellow-200/60">
                  <p>1. Ve a https://freighter.app</p>
                  <p>2. Instala la extensión para tu navegador</p>
                  <p>3. Crea una wallet nueva o importa una existente</p>
                  <p>4. Habilita Testnet en configuración</p>
                  <p>5. Recarga esta página</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-300 font-semibold">⚠️ Freighter no conectada</p>
            <p className="text-orange-200/80 text-sm mt-1">
              Abre Freighter y conecta tu wallet a este sitio para continuar.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-orange-200/60">
                1. Haz clic en el icono de Freighter (arriba a la derecha)
              </p>
              <p className="text-orange-200/60">
                2. Si dice "Not connected", clickea "Connect this site"
              </p>
              <p className="text-orange-200/60">
                3. Recarga esta página (F5)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-green-300 font-semibold">✅ Freighter conectada y lista</p>
      </div>
    </div>
  );
}
