'use client';

import { useState, useCallback, useEffect } from 'react';
import * as StellarSDK from '@stellar/stellar-sdk';
import * as FreighterAPI from '@stellar/freighter-api';

declare global {
  interface Window {
    Freighter?: any;
    freighter?: any;
  }
}

export interface WalletAccount {
  publicKey: string;
  balance: number;
  network: string;
}

export interface PendingTransaction {
  id: string;
  tripName: string;
  amount: number;
  status: 'pending' | 'submitted' | 'success' | 'failed';
  hash?: string;
  timestamp: string;
  error?: string;
}

const TESTNET_SERVER = new StellarSDK.Horizon.Server(
  'https://horizon-testnet.stellar.org'
);

const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const TRIPS_OPERATOR_ADDRESS = 'GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO';

export const useFreighterWallet = () => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [freighterAvailable, setFreighterAvailable] = useState(false);
  const [isCheckingFreighter, setIsCheckingFreighter] = useState(true); // Nuevo estado

  useEffect(() => {
    const checkFreighter = async () => {
      setIsCheckingFreighter(true);
      let retries = 0;
      const maxRetries = 5;
      const delays = [500, 1000, 2000, 3000, 5000]; // Aumentar delays progresivamente

      const attemptCheck = async () => {
        try {
          console.log(`🔍 [HOOK] Verificando Freighter (intento ${retries + 1}/${maxRetries})...`);
          console.log('🔍 [HOOK] FreighterAPI disponible:', !!FreighterAPI);
          console.log('🔍 [HOOK] FreighterAPI.getAddress disponible:', !!FreighterAPI?.getAddress);
          
          // Freighter 6+ API: simplemente intentar llamar a getAddress
          // Usar un timeout para no esperar indefinidamente
          const addressPromise = FreighterAPI.getAddress();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 2000)
          );
          
          const addressResult = await Promise.race([addressPromise, timeoutPromise]);
          console.log('🔍 [HOOK] Resultado de getAddress:', addressResult);
          
          const address = typeof addressResult === 'string' ? addressResult : (addressResult as any)?.address;
          if (address) {
            console.log('✅ [HOOK] Freighter está disponible, dirección:', address.substring(0, 10) + '...');
            setFreighterAvailable(true);
            return true;
          } else {
            console.log('ℹ️ [HOOK] Freighter respondió pero sin dirección (no conectado)');
            setFreighterAvailable(true); // API está disponible aunque no esté conectado
            return true;
          }
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          console.log(`ℹ️ [HOOK] Intento ${retries + 1} falló:`, errorMsg.substring(0, 100));
          
          if (retries < maxRetries - 1) {
            const delay = delays[retries] || 5000;
            console.log(`⏱️ [HOOK] Reintentando en ${delay}ms...`);
            return false;
          }
          
          console.log('❌ [HOOK] Freighter no disponible después de todos los intentos');
          setFreighterAvailable(false);
          return true; // Stop retrying
        }
      };

      // Loop de reintentos
      while (retries < maxRetries) {
        const success = await attemptCheck();
        if (success) break;
        
        const delay = delays[retries] || 5000;
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }

      // Marcar que se terminó la verificación
      setIsCheckingFreighter(false);
    };

    checkFreighter();
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🔗 [HOOK] Iniciando conexión con Freighter...');
      
      // Solicitar acceso a Freighter
      console.log('📋 [HOOK] Solicitando acceso...');
      try {
        await FreighterAPI.requestAccess();
        console.log('✅ [HOOK] Acceso otorgado');
      } catch (e) {
        console.log('ℹ️ [HOOK] requestAccess no disponible (puede ser normal)');
      }

      // Obtener dirección pública
      console.log('📍 [HOOK] Obteniendo dirección pública...');
      const publicKeyResult = await FreighterAPI.getAddress();
      const publicKey = typeof publicKeyResult === 'string' ? publicKeyResult : publicKeyResult?.address;

      if (!publicKey) {
        throw new Error('No se pudo obtener la dirección pública');
      }

      if (!publicKey.startsWith('G') || publicKey.length !== 56) {
        throw new Error(`Dirección pública inválida: ${publicKey}`);
      }

      console.log('✅ [HOOK] Clave pública válida obtenida');

      // Obtener saldo desde Testnet
      console.log('🔄 [HOOK] Obteniendo saldo de Testnet...');
      const response = await TESTNET_SERVER.accounts().accountId(publicKey).call();
      const balance = parseFloat(
        response.balances.find((b: any) => b.asset_type === 'native')?.balance || '0'
      );

      const walletData: WalletAccount = {
        publicKey,
        balance,
        network: 'Stellar Testnet',
      };

      setAccount(walletData);
      setFreighterAvailable(true);
      localStorage.setItem('wallet_account', JSON.stringify(walletData));
      localStorage.setItem('wallet_public_key', publicKey);

      console.log('✅ [HOOK] Wallet conectada exitosamente');
      return walletData;
    } catch (err: any) {
      const message = err.message || 'Error conectando wallet';
      setError(message);
      console.error('❌ [HOOK] Error de conexión:', message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setTransactions([]);
    setError(null);
    localStorage.removeItem('wallet_account');
    localStorage.removeItem('wallet_public_key');
  }, []);

  const buyTrip = useCallback(
    async (trip: { id: string; name: string; priceXLM: number }) => {
      if (!account) {
        throw new Error('Wallet no conectada');
      }

      if (account.balance < trip.priceXLM) {
        throw new Error(`Saldo insuficiente. Necesitas ${trip.priceXLM} XLM`);
      }

      const txId = `trip_${Date.now()}`;
      const pendingTx: PendingTransaction = {
        id: txId,
        tripName: trip.name,
        amount: trip.priceXLM,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };

      setTransactions(prev => [pendingTx, ...prev]);

      try {
        // Obtener cuenta actual
        const sourceAccount = await TESTNET_SERVER.loadAccount(account.publicKey);

        // Construir transacción
        const transaction = new StellarSDK.TransactionBuilder(sourceAccount, {
          fee: StellarSDK.BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addMemo(StellarSDK.Memo.text(`Viaje: ${trip.name}`))
          .addOperation(
            StellarSDK.Operation.payment({
              destination: TRIPS_OPERATOR_ADDRESS,
              asset: StellarSDK.Asset.native(),
              amount: trip.priceXLM.toString(),
            })
          )
          .setTimeout(300)
          .build();

        console.log('🔐 [HOOK] Solicitando firma a Freighter...');
        
        // Freighter 6+ signTransaction
        const signedXdrResult = await FreighterAPI.signTransaction(
          transaction.toXDR(),
          {
            networkPassphrase: NETWORK_PASSPHRASE,
          }
        );

        const signedXdr = typeof signedXdrResult === 'string' ? signedXdrResult : signedXdrResult?.signedTxXdr;

        if (!signedXdr) {
          throw new Error('No se pudo obtener la firma de la transacción');
        }

        console.log('✅ [HOOK] Transacción firmada');

        const signedTx = StellarSDK.TransactionBuilder.fromXDR(
          signedXdr,
          NETWORK_PASSPHRASE
        );

        // Actualizar estado a submitted
        setTransactions(prev =>
          prev.map(tx =>
            tx.id === txId ? { ...tx, status: 'submitted' } : tx
          )
        );

        // Enviar a la red
        console.log('📤 [HOOK] Enviando transacción a Testnet...');
        const result = await TESTNET_SERVER.submitTransaction(signedTx);
        console.log('✅ [HOOK] Transacción enviada:', result.hash);

        // Actualizar estado a success
        setTransactions(prev =>
          prev.map(tx =>
            tx.id === txId
              ? {
                  ...tx,
                  status: 'success',
                  hash: result.hash,
                }
              : tx
          )
        );

        // Actualizar saldo
        const updatedAccount = await TESTNET_SERVER.loadAccount(account.publicKey);
        const newBalance = parseFloat(
          updatedAccount.balances.find((b: any) => b.asset_type === 'native')?.balance || '0'
        );

        setAccount(prev => prev ? { ...prev, balance: newBalance } : null);

        return {
          success: true,
          hash: result.hash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
        };
      } catch (err: any) {
        const errorMsg = err.message || 'Error procesando pago';
        setTransactions(prev =>
          prev.map(tx =>
            tx.id === txId
              ? {
                  ...tx,
                  status: 'failed',
                  error: errorMsg,
                }
              : tx
          )
        );
        throw err;
      }
    },
    [account]
  );

  const loadSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem('wallet_account');
      if (saved) {
        setAccount(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  }, []);

  const fetchTransactionHistory = useCallback(async () => {
    if (!account) return [];

    try {
      const response = await TESTNET_SERVER.transactions()
        .forAccount(account.publicKey)
        .order('desc')
        .limit(10)
        .call();

      return response.records || [];
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return [];
    }
  }, [account]);

  return {
    account,
    isConnecting,
    error,
    transactions,
    freighterAvailable,
    isCheckingFreighter,
    connectWallet,
    disconnectWallet,
    buyTrip,
    loadSavedData,
    fetchTransactionHistory,
  };
};

export default useFreighterWallet;
