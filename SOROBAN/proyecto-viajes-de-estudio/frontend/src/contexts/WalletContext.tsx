'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import useFreighterWallet, { WalletAccount } from '@/hooks/useFreighterWallet';

interface WalletContextType {
  account: WalletAccount | null;
  isConnecting: boolean;
  error: string | null;
  freighterAvailable: boolean;
  isCheckingFreighter: boolean;
  connectWallet: () => Promise<WalletAccount>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallet = useFreighterWallet();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Cargar datos guardados al montar
  useEffect(() => {
    wallet.loadSavedData();
  }, []);

  // Actualizar cookie cuando hay cambios en la wallet
  useEffect(() => {
    if (wallet.account) {
      document.cookie = `wallet_connected=true; path=/; max-age=${7 * 24 * 60 * 60}`;
    } else {
      document.cookie = 'wallet_connected=; path=/; max-age=0';
    }
  }, [wallet.account]);

  // Escuchar cambios en Freighter en tiempo real
  useEffect(() => {
    const handleFreighterChange = () => {
      console.log('🔄 Cambio en estado de Freighter, refrescando...');
      setRefreshTrigger(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      // Escuchar eventos de Freighter
      window.addEventListener('freighter#initialized', handleFreighterChange);
      window.addEventListener('freighter#ready', handleFreighterChange);
      window.addEventListener('freighterReady', handleFreighterChange);
      
      return () => {
        window.removeEventListener('freighter#initialized', handleFreighterChange);
        window.removeEventListener('freighter#ready', handleFreighterChange);
        window.removeEventListener('freighterReady', handleFreighterChange);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account: wallet.account,
        isConnecting: wallet.isConnecting,
        error: wallet.error,
        freighterAvailable: wallet.freighterAvailable,
        isCheckingFreighter: wallet.isCheckingFreighter,
        connectWallet: wallet.connectWallet,
        disconnectWallet: wallet.disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet debe usarse dentro de WalletProvider');
  }
  return context;
}
