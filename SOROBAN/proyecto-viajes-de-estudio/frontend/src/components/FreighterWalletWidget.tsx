'use client';

import { useWallet } from '@/contexts/WalletContext';
import { useEffect, useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function FreighterWalletWidget() {
  const { account, error, freighterAvailable } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-stellar" />
            Estado de Freighter
          </h3>

          {/* Status Grid */}
          <div className="space-y-3">
            {/* Freighter Availability */}
            <div className="flex items-center gap-3 p-3 rounded bg-slate-900/50 border border-slate-700">
              {freighterAvailable ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-400">Freighter Detectada</p>
                    <p className="text-xs text-slate-400">Extensión disponible</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400">Freighter No Detectada</p>
                    <p className="text-xs text-slate-400">
                      <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className="text-stellar hover:underline">
                        Instalar →
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-3 p-3 rounded bg-slate-900/50 border border-slate-700">
              {account ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-400">Wallet Conectada</p>
                    <p className="text-xs text-slate-400 truncate">
                      {account.publicKey.slice(0, 8)}...{account.publicKey.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-stellar">{account.balance.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">XLM</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-400">Wallet No Conectada</p>
                    <p className="text-xs text-slate-400">Conecta para comprar viajes</p>
                  </div>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3 rounded bg-red-900/20 border border-red-700/50">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-400">Error</p>
                  <p className="text-xs text-red-300 break-words">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {!account && freighterAvailable && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <a
            href="/wallet-login"
            className="inline-block w-full text-center px-4 py-2 bg-stellar hover:bg-stellar/90 text-white rounded font-semibold transition-colors"
          >
            Conectar Wallet
          </a>
        </div>
      )}

      {/* Info Links */}
      <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
        <a
          href="https://stellar.expert/explorer/testnet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-stellar hover:underline flex items-center gap-1"
        >
          Ver en Stellar Expert <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://stellar.org/developers/testnet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-stellar hover:underline flex items-center gap-1"
        >
          Faucet Testnet <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
