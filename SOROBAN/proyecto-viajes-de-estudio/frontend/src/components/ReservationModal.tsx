'use client';

import React, { useState } from 'react';
import { useStellarTransaction } from '@/hooks/useStellarTransaction';
import { useWallet } from '@/contexts/WalletContext';
import { AlertCircle, CheckCircle, Clock, Zap, Send, Loader } from 'lucide-react';

interface ReservationModalProps {
  trip: any;
  onClose: () => void;
}

export default function ReservationModal({ trip, onClose }: ReservationModalProps) {
  const { sendPayment, getFreighterWallet, isProcessing } = useStellarTransaction();
  const { account } = useWallet();

  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'signing' | 'submitting' | 'registering' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleReserveTrip = async () => {
    if (!trip || !account) {
      alert('Error: Información incompleta');
      return;
    }

    try {
      setTransactionStatus('signing');
      setErrorMessage('');
      console.log('🔄 Iniciando proceso de reserva...');

      // 1. Obtener wallet de Freighter
      const clientWallet = await getFreighterWallet();
      if (!clientWallet) {
        throw new Error('No se pudo obtener la wallet de Freighter. Asegúrate de tener Freighter instalado y conectado.');
      }

      console.log('✅ Wallet obtenida:', clientWallet.substring(0, 10) + '...');

      // 2. Cambiar a estado "submitting" 
      setTransactionStatus('submitting');

      // 3. Crear transacción de pago
      console.log('📤 Enviando pago a empresa:', trip.companyWallet);
      const paymentResult = await sendPayment(
        clientWallet,
        trip.companyWallet,
        trip.priceXLM,
        `Reserva: ${trip.destination}`
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Error en la transacción de pago');
      }

      console.log('✅ Pago completado:', paymentResult.hash);
      if (paymentResult.hash) {
        setTransactionHash(paymentResult.hash);
      }

      // 4. Cambiar a estado "registering"
      setTransactionStatus('registering');

      // 5. Guardar reserva en la API
      console.log('📝 Registrando reserva...');
      const reservationResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          clientWallet,
          companyWallet: trip.companyWallet,
          amount: trip.priceXLM,
          txHash: paymentResult.hash,
          status: 'completed',
        }),
      });

      if (!reservationResponse.ok) {
        throw new Error('Error guardando la reserva. El pago fue procesado pero la reserva no se guardó.');
      }

      const reservationData = await reservationResponse.json();
      console.log('✅ Reserva registrada:', reservationData);

      setTransactionStatus('success');
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Error:', message);
      setErrorMessage(message);
      setTransactionStatus('error');
    }
  };

  return (
    <div className="w-full">
      {/* Trip Details */}
      <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
        <h3 className="text-lg font-bold text-white mb-2">{trip.destination}</h3>
        <p className="text-gray-300 mb-3">{trip.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Precio</p>
            <p className="text-2xl font-bold text-stellar">{trip.priceXLM} XLM</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Duración</p>
            <p className="text-2xl font-bold text-cyan-400">{trip.duration || 3} días</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {transactionStatus === 'idle' && (
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg flex gap-3">
          <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300 text-sm">
            Se realizará una transacción en Stellar para confirmar tu reserva. Necesitaremos firmar con tu wallet Freighter.
          </p>
        </div>
      )}

      {transactionStatus === 'signing' && (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg flex gap-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-spin" />
          <p className="text-yellow-300 text-sm">
            Abriendo Freighter para firmar la transacción...
          </p>
        </div>
      )}

      {transactionStatus === 'submitting' && (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg flex gap-3">
          <Loader className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-spin" />
          <p className="text-yellow-300 text-sm">
            Enviando transacción a Stellar Testnet...
          </p>
        </div>
      )}

      {transactionStatus === 'registering' && (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg flex gap-3">
          <Loader className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-spin" />
          <p className="text-yellow-300 text-sm">
            Registrando tu reserva...
          </p>
        </div>
      )}

      {transactionStatus === 'success' && transactionHash && (
        <div className="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
          <div className="flex gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300 font-semibold">¡Reserva realizada exitosamente!</p>
          </div>
          <div className="bg-slate-900 p-3 rounded border border-slate-600 mb-3">
            <p className="text-xs text-gray-400 mb-1">Hash de transacción:</p>
            <p className="text-xs text-cyan-400 font-mono break-all">{transactionHash}</p>
          </div>
        </div>
      )}

      {transactionStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <div className="flex gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 font-semibold">Error en la reserva</p>
          </div>
          <p className="text-red-200 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {transactionStatus !== 'success' ? (
          <>
            <button
              onClick={onClose}
              disabled={transactionStatus !== 'idle' && transactionStatus !== 'error'}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:text-white hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleReserveTrip}
              disabled={transactionStatus !== 'idle' && transactionStatus !== 'error' || isProcessing}
              className="flex-1 px-4 py-2 rounded-lg bg-stellar hover:bg-stellar/90 text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(transactionStatus !== 'idle' && transactionStatus !== 'error') || isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmar Reserva
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-stellar hover:bg-stellar/90 text-white font-semibold transition-all"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
