/**
 * WalletPaymentProcessor Component
 * Handle payments using connected wallets
 */

'use client';

import React, { useState } from 'react';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  tripId?: string;
  studentId?: string;
}

interface WalletPaymentProcessorProps {
  walletAddress: string;
  walletType: string;
  paymentData: PaymentData;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export const WalletPaymentProcessor: React.FC<WalletPaymentProcessorProps> = ({
  walletAddress,
  walletType,
  paymentData,
  onSuccess,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processMetamaskPayment = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error('MetaMask no está disponible');

      // Preparar transacción
      const txData = {
        from: walletAddress,
        to: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS,
        value: (paymentData.amount * 1e18).toString(), // Convertir a Wei
        data: `0x${paymentData.description.split('').map(c => c.charCodeAt(0).toString(16)).join('')}`,
      };

      // Enviar transacción
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [txData],
      });

      return txHash;
    } catch (err: any) {
      throw new Error(`Error en MetaMask: ${err.message}`);
    }
  };

  const processStellarPayment = async () => {
    try {
      const stellar = (window as any).stellar;
      if (!stellar) throw new Error('Stellar Wallet no está disponible');

      // Preparar y enviar pago en Stellar
      const result = await stellar.pay({
        destination: process.env.NEXT_PUBLIC_STELLAR_PAYMENT_ADDRESS,
        amount: paymentData.amount.toString(),
        asset: process.env.NEXT_PUBLIC_STELLAR_ASSET || 'native',
        memo: paymentData.description,
      });

      return result.id;
    } catch (err: any) {
      throw new Error(`Error en Stellar: ${err.message}`);
    }
  };

  const processMercadoPagoPayment = async () => {
    try {
      // Crear preferencia de pago en Mercado Pago
      const response = await fetch('/api/mercadopago/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency,
          description: paymentData.description,
          userId: paymentData.studentId,
          tripId: paymentData.tripId,
        }),
      });

      if (!response.ok) throw new Error('Error creando pago en Mercado Pago');

      const data = await response.json();
      
      // Redirigir a Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      }

      return data.id;
    } catch (err: any) {
      throw new Error(`Error en Mercado Pago: ${err.message}`);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      let txId: string;

      switch (walletType) {
        case 'metamask':
        case 'coinbase':
          txId = await processMetamaskPayment();
          break;
        case 'stellar':
          txId = await processStellarPayment();
          break;
        case 'mercadopago':
          txId = await processMercadoPagoPayment();
          break;
        case 'ledger':
          throw new Error('Ledger requiere confirmación en el dispositivo');
        default:
          throw new Error('Wallet no soportado para pagos');
      }

      setTransactionId(txId);
      onSuccess?.(txId);
    } catch (err: any) {
      const errorMsg = err.message || 'Error procesando pago';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (transactionId) {
    return (
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/40 shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-white mb-2">¡Pago Procesado!</h3>
          <p className="text-green-200 mb-4">Tu transacción ha sido completada exitosamente.</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-4 border border-white/20">
            <p className="text-xs text-gray-300 mb-1">ID de Transacción:</p>
            <p className="text-white font-mono text-sm break-all">{transactionId}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-300 text-xs mb-1">Monto</p>
              <p className="text-white font-bold">{paymentData.amount} {paymentData.currency}</p>
            </div>
            <div>
              <p className="text-gray-300 text-xs mb-1">Wallet</p>
              <p className="text-white font-bold capitalize">{walletType}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/40 shadow-xl space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Confirmar Pago</h3>
        <div className="space-y-3 bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Concepto:</span>
            <span className="text-white font-semibold">{paymentData.description}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Monto:</span>
            <span className="text-white font-bold text-lg">{paymentData.amount} {paymentData.currency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Wallet:</span>
            <span className="text-white font-semibold capitalize">{walletType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-xs">Dirección:</span>
            <span className="text-white font-mono text-xs break-all">{walletAddress.slice(0, 20)}...</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4">
          <p className="text-red-200 text-sm font-semibold">{error}</p>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin">⏳</div>
            Procesando...
          </>
        ) : (
          <>
            💳 Pagar Ahora
          </>
        )}
      </button>

      <p className="text-xs text-gray-300 text-center">
        ✓ Pago seguro y encriptado
      </p>
    </div>
  );
};
