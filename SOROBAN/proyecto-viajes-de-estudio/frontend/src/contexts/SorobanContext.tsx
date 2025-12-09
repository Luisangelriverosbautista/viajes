'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from './WalletContext';

interface SorobanContextType {
  contract: any;
  signer: any;
  isConnecting: boolean;
  error: string | null;
}

const SorobanContext = createContext<SorobanContextType | undefined>(undefined);

export function SorobanProvider({ children }: { children: React.ReactNode }) {
  const { account } = useWallet();
  const [contract, setContract] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSoroban = async () => {
      if (!account) {
        setContract(null);
        return;
      }

      try {
        setIsConnecting(true);
        setError(null);

        // Get the contract ID from env
        const contractId = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_TRIPS_CONTRACT_ID;
        const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || process.env.NEXT_PUBLIC_SOROBAN_RPC_URL;
        
        console.log('📡 Soroban Config:', {
          contractId: contractId ? '✅ Found' : '❌ Missing',
          rpcUrl: rpcUrl ? '✅ Found' : '❌ Missing',
        });
        
        if (!contractId) {
          throw new Error('Contract ID not configured - check NEXT_PUBLIC_CONTRACT_ADDRESS env var');
        }

        // Create a mock contract that will call the backend APIs
        const mockContract = {
          initialize: async () => {
            console.log('🚀 Initializing marketplace on blockchain...');
            return { success: true, message: 'Marketplace initialized' };
          },
          
          create_trip: async (params: any) => {
            console.log('📝 Creating trip:', params);
            const res = await fetch('/api/trips', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(params),
            });
            return res.json();
          },
          
          list_trips: async () => {
            console.log('📋 Fetching all trips...');
            const res = await fetch('/api/trips');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          },
          
          list_company_trips: async (params: any) => {
            console.log('🏢 Fetching company trips:', params);
            const res = await fetch(`/api/trips?company=${params.company}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          },
          
          make_reservation: async (params: any) => {
            console.log('✅ Making reservation:', params);
            const res = await fetch('/api/reservations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(params),
            });
            return res.json();
          },
          
          list_client_reservations: async (params: any) => {
            console.log('🎫 Fetching client reservations:', params);
            const res = await fetch(`/api/reservations?clientWallet=${params.client}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          },
          
          cancel_reservation: async (params: any) => {
            console.log('❌ Canceling reservation:', params);
            const res = await fetch(`/api/reservations/${params.res_id}`, {
              method: 'DELETE',
            });
            return res.json();
          },
        };

        setContract(mockContract);
        console.log('✨ Soroban context initialized successfully');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('Error initializing Soroban:', err);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeSoroban();
  }, [account]);

  return (
    <SorobanContext.Provider
      value={{
        contract,
        signer: account
          ? {
              publicKey: account.publicKey,
            }
          : null,
        isConnecting,
        error,
      }}
    >
      {children}
    </SorobanContext.Provider>
  );
}

export function useSoroban() {
  const context = useContext(SorobanContext);
  if (!context) {
    throw new Error('useSoroban debe usarse dentro de SorobanProvider');
  }
  return context;
}
