/**
 * Hook para sincronización en tiempo real
 * Refleja cambios en viajes, pagos y reservaciones automáticamente
 */

import { useEffect, useCallback } from 'react';

interface RealtimeSyncOptions {
  onSync?: () => Promise<void>;
  interval?: number; // milisegundos
  enabled?: boolean;
}

export const useRealtimeSync = ({
  onSync,
  interval = 5000, // Por defecto cada 5 segundos
  enabled = true,
}: RealtimeSyncOptions) => {
  const handleSync = useCallback(async () => {
    try {
      if (onSync) {
        await onSync();
      }
    } catch (error) {
      console.error('[REALTIME SYNC] Error durante sincronización:', error);
    }
  }, [onSync]);

  useEffect(() => {
    if (!enabled) return;

    // Sincronización inicial
    handleSync();

    // Sincronización periódica
    const syncInterval = setInterval(() => {
      console.log('[REALTIME SYNC] Sincronizando cambios...');
      handleSync();
    }, interval);

    // También sincronizar cuando la ventana recibe el foco
    const handleFocus = () => {
      console.log('[REALTIME SYNC] Ventana enfocada, sincronizando...');
      handleSync();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleSync, interval, enabled]);

  return { handleSync };
};
