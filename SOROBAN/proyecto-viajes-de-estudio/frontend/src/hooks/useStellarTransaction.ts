import { useState, useCallback } from 'react';
import * as StellarSDK from '@stellar/stellar-sdk';
import * as FreighterAPI from '@stellar/freighter-api';

const TESTNET_URL = 'https://horizon-testnet.stellar.org';

// Función para guardar transacciones locales
const saveLocalTransaction = (hash: string, tripName: string, amount: number, status: 'success' | 'pending' | 'failed' = 'pending') => {
  try {
    const existing = localStorage.getItem('transaction_history') || '[]';
    const parsed = JSON.parse(existing);
    const newTx = {
      hash,
      timestamp: new Date().toISOString(),
      tripName,
      amount,
      status,
    };
    const updated = [newTx, ...parsed];
    localStorage.setItem('transaction_history', JSON.stringify(updated));
    console.log('💾 [useStellarTransaction] Transacción guardada localmente:', newTx);
  } catch (err) {
    console.error('❌ [useStellarTransaction] Error guardando transacción local:', err);
  }
};

interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  amount: number;
}

export const useStellarTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFreighterWallet = useCallback(async (): Promise<string | null> => {
    try {
      console.log('🔍 [useStellarTransaction] Obteniendo wallet de Freighter...');
      
      // Primero intentar obtener del localStorage (más rápido y confiable)
      const savedWallet = localStorage.getItem('walletAddress');
      if (savedWallet) {
        console.log('✅ [useStellarTransaction] Wallet obtenida del localStorage:', savedWallet.substring(0, 10) + '...');
        return savedWallet;
      }

      console.log('🔍 [useStellarTransaction] Verificando si FreighterAPI está disponible...');
      
      if (!FreighterAPI || !FreighterAPI.getAddress) {
        console.error('❌ [useStellarTransaction] FreighterAPI no está disponible');
        return null;
      }

      // Si no está en localStorage, intentar obtenerla de Freighter
      const publicKeyResult = await FreighterAPI.getAddress();
      console.log('🔍 [useStellarTransaction] Resultado de getAddress:', publicKeyResult);
      
      const publicKey = typeof publicKeyResult === 'string' ? publicKeyResult : publicKeyResult?.address;
      
      if (publicKey) {
        // Guardar en localStorage para futuras llamadas
        localStorage.setItem('walletAddress', publicKey);
        console.log('✅ [useStellarTransaction] Wallet obtenida:', publicKey.substring(0, 10) + '...');
        return publicKey;
      } else {
        console.warn('⚠️ [useStellarTransaction] getAddress retornó sin dirección');
        return null;
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      console.error('❌ [useStellarTransaction] Error obteniendo wallet:', errorMsg);
      console.error('❌ [useStellarTransaction] Tipo de error:', err?.constructor?.name);
      return null;
    }
  }, []);

  const sendPayment = useCallback(
    async (
      fromWallet: string,
      toWallet: string,
      amountXLM: number,
      memoText?: string,
      tripName?: string
    ): Promise<TransactionResult> => {
      try {
        setIsProcessing(true);
        setError(null);

        const server = new StellarSDK.Horizon.Server(TESTNET_URL);

        // Obtener cuenta del remitente
        const sourceAccount = await server.loadAccount(fromWallet);

        // Construir transacción
        const transaction = new StellarSDK.TransactionBuilder(sourceAccount, {
          fee: StellarSDK.BASE_FEE,
          networkPassphrase: 'Test SDF Network ; September 2015',
        })
          .addOperation(
            StellarSDK.Operation.payment({
              destination: toWallet,
              asset: StellarSDK.Asset.native(),
              amount: amountXLM.toString(),
            })
          )
          .addMemo(StellarSDK.Memo.text(memoText || `Pago`))
          .setTimeout(300)
          .build();

        console.log('📝 Transacción construida:', {
          from: fromWallet.substring(0, 10) + '...',
          to: toWallet.substring(0, 10) + '...',
          amount: amountXLM + ' XLM',
        });

        // Solicitar firma a Freighter
        console.log('🔐 Solicitando firma a Freighter...');
        const signedXDRResult = await FreighterAPI.signTransaction(
          transaction.toXDR(),
          {
            networkPassphrase: 'Test SDF Network ; September 2015',
          }
        );

        const signedXDR = typeof signedXDRResult === 'string' ? signedXDRResult : signedXDRResult?.signedTxXdr;

        console.log('✅ Transacción firmada');

        // Enviar transacción
        console.log('📤 Enviando transacción...');
        const signedTx = StellarSDK.TransactionBuilder.fromXDR(
          signedXDR,
          'Test SDF Network ; September 2015'
        );

        const result = await server.submitTransaction(signedTx);

        console.log('✅ Transacción enviada:', result.hash);

        // Guardar localmente
        saveLocalTransaction(result.hash, tripName || memoText || 'Pago', amountXLM, 'success');

        return {
          success: true,
          hash: result.hash,
          amount: amountXLM,
        };
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ Error en transacción:', errorMsg);
        setError(errorMsg);

        return {
          success: false,
          error: errorMsg,
          amount: amountXLM,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    sendPayment,
    getFreighterWallet,
    isProcessing,
    error,
  };
};
