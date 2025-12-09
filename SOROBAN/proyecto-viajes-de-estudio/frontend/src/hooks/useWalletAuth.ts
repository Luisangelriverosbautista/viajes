'use client';

// DEPRECATED: Este archivo ha sido reemplazado por useFreighterWallet.ts
// Mantiene compatibilidad de importaciones para archivos existentes

export { useFreighterWallet as useWalletAuth } from './useFreighterWallet';
export type { WalletAccount as WalletSession } from './useFreighterWallet';

// Re-export para compatibilidad
export interface TransactionRecord {
  id: string;
  hash: string;
  trip: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  explorerUrl?: string;
}
