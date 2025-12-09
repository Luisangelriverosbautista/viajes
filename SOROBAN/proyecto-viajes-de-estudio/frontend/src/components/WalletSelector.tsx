'use client';

import { useWallet } from '@/contexts/WalletContext';
import { Wallet, Loader } from 'lucide-react';

export function WalletSelector() {
  const { account, freighterAvailable, isConnecting, connectWallet, disconnectWallet, error } =
    useWallet();

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!account ? (
        <button
          onClick={connectWallet}
          disabled={!freighterAvailable || isConnecting}
          className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            !freighterAvailable || isConnecting
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
              Conectar Wallet Freighter
            </>
          )}
        </button>
      ) : (
        <div className="bg-stellar/10 border border-stellar/30 rounded-lg p-4">
          <div className="mb-3">
            <p className="text-sm text-slate-400">Wallet conectada</p>
            <p className="font-mono text-stellar font-semibold">
              {account.publicKey.slice(0, 8)}...{account.publicKey.slice(-4)}
            </p>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-slate-400">Saldo:</span>
            <span className="font-semibold text-stellar">{account.balance.toFixed(2)} XLM</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="w-full py-2 px-4 rounded-lg font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletSelector;
