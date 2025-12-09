/**
 * Hook para sincronizar user_registry entre localStorage y sessionStorage
 * DEPRECADO: Ahora usamos readUserRegistry/writeUserRegistry que son más robustas
 */

import { useEffect } from 'react';

export const usePersistUserRegistry = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Este hook ahora es un NO-OP porque la sincronización se hace en
    // readUserRegistry y writeUserRegistry del hook useUserRegistry
    
    console.log('📌 [PERSIST] Hook initialized (legacy - no longer needed)');

    return () => {};
  }, []);
};

