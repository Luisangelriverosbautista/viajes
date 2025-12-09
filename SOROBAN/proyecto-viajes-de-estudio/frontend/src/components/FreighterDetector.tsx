'use client';

import { useEffect, useState } from 'react';

interface FreighterDetectorProps {
  onDetected?: (available: boolean) => void;
}

/**
 * Componente que detecta si Freighter está instalada
 * Útil para debugging y garantizar que se detecta correctamente
 */
export function FreighterDetector({ onDetected }: FreighterDetectorProps) {
  const [status, setStatus] = useState<'checking' | 'found' | 'not-found'>('checking');

  useEffect(() => {
    const detect = async () => {
      console.log('🔍 FreighterDetector: Iniciando detección...');
      
      // Chequeo 1: Inmediato
      if ((window as any).freighter) {
        console.log('✅ FreighterDetector: Freighter encontrada INMEDIATAMENTE');
        setStatus('found');
        onDetected?.(true);
        return;
      }

      // Chequeo 2: Esperar al documento listo
      if (document.readyState === 'loading') {
        await new Promise<void>(resolve => {
          const handler = () => {
            console.log('📄 FreighterDetector: Documento listo');
            window.removeEventListener('DOMContentLoaded', handler);
            resolve();
          };
          window.addEventListener('DOMContentLoaded', handler, { once: true });
        });
      }

      if ((window as any).freighter) {
        console.log('✅ FreighterDetector: Freighter encontrada DESPUÉS DE DOMContentLoaded');
        setStatus('found');
        onDetected?.(true);
        return;
      }

      // Chequeo 3: Esperar al load
      if (document.readyState !== 'complete') {
        await new Promise<void>(resolve => {
          const handler = () => {
            console.log('✅ FreighterDetector: Window loaded');
            window.removeEventListener('load', handler);
            resolve();
          };
          window.addEventListener('load', handler, { once: true });
        });
      }

      if ((window as any).freighter) {
        console.log('✅ FreighterDetector: Freighter encontrada DESPUÉS DE window.load');
        setStatus('found');
        onDetected?.(true);
        return;
      }

      // Chequeo 4: Polling agresivo
      console.log('⏳ FreighterDetector: Polling para Freighter...');
      for (let i = 0; i < 200; i++) {
        if ((window as any).freighter) {
          console.log(`✅ FreighterDetector: Freighter encontrada en polling intento ${i}`);
          setStatus('found');
          onDetected?.(true);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      console.log('❌ FreighterDetector: No se encontró Freighter');
      setStatus('not-found');
      onDetected?.(false);
    };

    detect();
  }, [onDetected]);

  // No renderizar nada, solo detectar
  return null;
}
