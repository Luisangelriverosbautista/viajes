'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowUpRight, ExternalLink, Loader, RefreshCw } from 'lucide-react';

interface TransactionRecord {
  hash: string;
  created_at: string;
  successful: boolean;
  memo?: string;
  operations: Array<{
    type: string;
    amount?: string;
  }>;
  source?: 'blockchain' | 'local';
}

interface LocalTransaction {
  hash: string;
  timestamp: string;
  tripName: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
}

export default function TransactionHistory() {
  const { account } = useWallet();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [localTransactions, setLocalTransactions] = useState<LocalTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Cargar transacciones locales del localStorage
  const loadLocalTransactions = () => {
    try {
      const stored = localStorage.getItem('transaction_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📊 [TransactionHistory] Transacciones locales cargadas:', parsed);
        setLocalTransactions(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('❌ [TransactionHistory] Error cargando transacciones locales:', err);
    }
    return [];
  };

  // Guardar transacción en localStorage
  const saveLocalTransaction = (tx: LocalTransaction) => {
    try {
      const existing = localStorage.getItem('transaction_history') || '[]';
      const parsed = JSON.parse(existing);
      const updated = [tx, ...parsed];
      localStorage.setItem('transaction_history', JSON.stringify(updated));
      setLocalTransactions(updated);
      console.log('💾 [TransactionHistory] Transacción local guardada:', tx);
    } catch (err) {
      console.error('❌ [TransactionHistory] Error guardando transacción local:', err);
    }
  };

  const fetchTransactions = async () => {
    if (!account) return;

    setLoading(true);
    try {
      console.log('📊 [TransactionHistory] Buscando transacciones para:', account.publicKey);
      
      const response = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${account.publicKey}/transactions?order=desc&limit=50`
      );
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 [TransactionHistory] Respuesta de Horizon:', data);

      if (data.records && data.records.length > 0) {
        console.log('📊 [TransactionHistory] Encontradas', data.records.length, 'transacciones');
        
        // Para cada transacción, obtener sus operaciones
        const enrichedTxs = await Promise.all(
          data.records.map(async (tx: any) => {
            try {
              const opsResponse = await fetch(tx.links.operations.href);
              const opsData = await opsResponse.json();
              return {
                hash: tx.hash,
                created_at: tx.created_at,
                successful: tx.successful,
                memo: tx.memo,
                operations: opsData.records || [],
              };
            } catch (err) {
              console.error('Error obteniendo operaciones para tx:', tx.hash, err);
              return {
                hash: tx.hash,
                created_at: tx.created_at,
                successful: tx.successful,
                memo: tx.memo,
                operations: [],
              };
            }
          })
        );

        console.log('📊 [TransactionHistory] Transacciones enriquecidas:', enrichedTxs);
        setTransactions(enrichedTxs);
        setLastUpdated(new Date().toLocaleTimeString('es-ES'));
      } else {
        console.log('📊 [TransactionHistory] No hay transacciones registradas');
        setTransactions([]);
      }
    } catch (err) {
      console.error('❌ [TransactionHistory] Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!account) return;

    // Cargar transacciones locales al montar
    loadLocalTransactions();

    // Cargar inmediatamente
    fetchTransactions();
    
    // Luego actualizar cada 30s
    const interval = setInterval(fetchTransactions, 30000);

    return () => clearInterval(interval);
  }, [account]);

  if (!account) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p className="text-slate-400">Conecta una wallet para ver transacciones</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-stellar" />
            Historial de Transacciones
          </h3>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">
              Actualizado: {lastUpdated}
            </p>
          )}
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 bg-stellar hover:bg-stellar/90 disabled:bg-stellar/50 text-white px-3 py-2 rounded transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {loading && transactions.length === 0 && localTransactions.length === 0 ? (
        <div className="p-8 flex items-center justify-center gap-2 text-slate-400">
          <Loader className="w-4 h-4 animate-spin" />
          Cargando transacciones...
        </div>
      ) : transactions.length === 0 && localTransactions.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-slate-400 mb-4">
            <p className="text-sm mb-2">📭 No hay transacciones registradas</p>
            <p className="text-xs text-slate-500">
              Las transacciones pueden tardar unos segundos en aparecer en Stellar.
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            className="text-sm bg-stellar/20 hover:bg-stellar/30 text-stellar px-3 py-2 rounded transition-all"
          >
            Buscar de nuevo
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
          {/* Mostrar primero las transacciones locales recientes */}
          {localTransactions.length > 0 && (
            <>
              <div className="p-4 bg-slate-900/50">
                <p className="text-xs text-slate-400 font-semibold">📌 TRANSACCIONES LOCALES (Recientes)</p>
              </div>
              {localTransactions.map(ltx => (
                <div key={`local-${ltx.hash}`} className="p-4 hover:bg-slate-900/50 transition-colors border-l-2 border-amber-500">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-amber-400 font-medium mb-1">{ltx.tripName}</p>
                      <p className="text-sm text-slate-300 font-mono">
                        {ltx.hash.slice(0, 8)}...{ltx.hash.slice(-4)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(ltx.timestamp).toLocaleString('es-ES')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-amber-400">-{ltx.amount} XLM</p>
                      <div className="flex items-center gap-2 mt-2">
                        {ltx.status === 'success' && (
                          <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400">
                            ✓ Confirmada
                          </span>
                        )}
                        {ltx.status === 'pending' && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-900/30 text-yellow-400">
                            ⏳ Pendiente
                          </span>
                        )}
                        {ltx.status === 'failed' && (
                          <span className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400">
                            ✗ Fallida
                          </span>
                        )}
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${ltx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Transacciones de blockchain */}
          {transactions.length > 0 && (
            <>
              <div className="p-4 bg-slate-900/50">
                <p className="text-xs text-slate-400 font-semibold">✅ TRANSACCIONES BLOCKCHAIN (Confirmadas)</p>
              </div>
              {transactions.map(tx => {
                const paymentOp = tx.operations.find((op: any) => op.type === 'payment');
                const amount = paymentOp?.amount || '?';

                return (
                  <div key={tx.hash} className="p-4 hover:bg-slate-900/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Memo */}
                        {tx.memo && (
                          <p className="text-sm text-stellar font-medium mb-1">{tx.memo}</p>
                        )}

                        {/* Hash */}
                        <p className="text-sm text-slate-300 font-mono">
                          {tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}
                        </p>

                        {/* Fecha */}
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(tx.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>

                      {/* Monto y Estado */}
                      <div className="text-right">
                        <p className="font-semibold text-stellar">-{amount} XLM</p>
                        <div className="flex items-center gap-2 mt-2">
                          {tx.successful ? (
                            <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400">
                              ✓ Confirmada
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400">
                              ✗ Fallida
                            </span>
                          )}
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stellar hover:text-stellar/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
