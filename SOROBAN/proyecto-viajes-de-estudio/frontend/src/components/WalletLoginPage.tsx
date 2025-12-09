'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useFreighterWallet from '@/hooks/useFreighterWallet';
import { Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function WalletLoginPage() {
  const router = useRouter();
  const {
    account,
    isConnecting,
    error,
    freighterAvailable,
    connectWallet,
    loadSavedData,
  } = useFreighterWallet();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSavedData();
  }, [loadSavedData]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleContinue = () => {
    if (account) {
      router.push('/dashboard');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="animate-spin">
          <Loader className="w-8 h-8 text-stellar" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-slate-800 rounded-xl border border-stellar/20 p-8 shadow-xl">
          {/* Icono */}
          <div className="flex justify-center mb-6">
            <div className="bg-stellar/10 p-4 rounded-full">
              <Wallet className="w-8 h-8 text-stellar" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            Conexión de Wallet
          </h1>
          <p className="text-center text-slate-400 mb-8">
            Para acceder al sistema de viajes de estudio, debe conectar su wallet de Freighter
          </p>

          {/* Estado Freighter */}
          <div className="mb-6 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-2">
              {freighterAvailable ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-400">Freighter detectado ✓</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-400">Freighter no detectado</span>
                </>
              )}
            </div>
            {!freighterAvailable && (
              <p className="text-xs text-slate-400 mt-2">
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stellar hover:underline"
                >
                  Descarga Freighter aquí
                </a>
              </p>
            )}
          </div>

          {/* Información del Wallet Conectado */}
          {account && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-700/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-400">Wallet Conectada</span>
              </div>
              <div className="text-sm space-y-2 text-slate-300">
                <p>
                  <span className="text-slate-400">Dirección:</span>{' '}
                  <code className="text-xs bg-slate-900 px-2 py-1 rounded">
                    {account.publicKey.slice(0, 8)}...{account.publicKey.slice(-4)}
                  </code>
                </p>
                <p>
                  <span className="text-slate-400">Saldo:</span>{' '}
                  <span className="font-semibold text-stellar">
                    {account.balance.toFixed(2)} XLM
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Red:</span> {account.network}
                </p>
              </div>
            </div>
          )}

          {/* Errores */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="space-y-3">
            {!account ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting || !freighterAvailable}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isConnecting || !freighterAvailable
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-stellar hover:bg-stellar/90 text-white'
                }`}
              >
                {isConnecting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Conectar Wallet con Freighter
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleContinue}
                  className="w-full py-3 px-4 rounded-lg font-semibold bg-stellar hover:bg-stellar/90 text-white transition-all"
                >
                  Continuar al Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 px-4 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all"
                >
                  Cambiar Wallet
                </button>
              </>
            )}
          </div>

          {/* Info de Testnet */}
          <div className="mt-8 p-4 rounded-lg bg-blue-900/20 border border-blue-700/50">
            <p className="text-sm text-blue-300">
              <span className="font-semibold">ℹ️ Testnet:</span> Este sistema funciona en Stellar
              Testnet. Los XLM de prueba pueden obtenerse desde el{' '}
              <a
                href="https://stellar.org/developers/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stellar hover:underline"
              >
                Testnet Faucet
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
