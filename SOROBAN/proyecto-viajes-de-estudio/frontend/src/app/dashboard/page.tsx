'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useTripOffers } from '@/hooks/useTripOffers';
import { LogOut, Wallet, Copy, Check, TrendingUp, X } from 'lucide-react';
import TransactionHistory from '@/components/TransactionHistory';
import ReservationModal from '@/components/ReservationModal';

export default function DashboardPage() {
  const router = useRouter();
  const { account, disconnectWallet } = useWallet();
  const { trips, loading, loadAllTrips } = useTripOffers();
  const [copied, setCopied] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [selectedTripForReservation, setSelectedTripForReservation] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
    // Verificar si hay sesiÃ³n activa
    const walletAddress = localStorage.getItem('walletAddress');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (!walletAddress || !isAuthenticated) {
      router.push('/login');
    }

    // Cargar viajes desde Stellar
    loadAllTrips();
  }, [router]);

  if (!isInitialized || !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-stellar/20 rounded-full mb-4">
            <Wallet className="w-12 h-12 text-stellar animate-pulse" />
          </div>
          <p className="text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(account.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Bienvenido a Viajes de Estudio MX</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Info Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-stellar" />
              Información de Wallet
            </h2>

            <div className="space-y-4">
              {/* Address */}
              <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">
                  Dirección de Wallet
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={account.publicKey}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-stellar font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyAddress}
                    className="bg-stellar hover:bg-stellar/90 text-white px-4 py-3 rounded-lg transition-all flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">
                  Saldo Disponible
                </label>
                <div className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-stellar">
                      {account.balance.toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-400">XLM</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Red: Stellar Testnet
                  </p>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  âœ“ Conectado a Stellar Testnet<br/>
                  âœ“ Freighter wallet activa<br/>
                  âœ“ Listo para realizar transacciones
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            {/* Available Trips */}
            <div className="bg-gradient-to-br from-stellar/20 to-cyan-500/20 rounded-2xl p-6 border border-stellar/30 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">ðŸŒ Viajes Disponibles</h3>
              <p className="text-gray-300 text-sm mb-4">
                Explora viajes de estudio ofrecidos por empresas. Reserva y paga con tu wallet.
              </p>
              <button 
                onClick={() => router.push('/available-trips')}
                className="w-full bg-stellar hover:bg-stellar/90 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                Ver Todos los Viajes
              </button>
            </div>

            {/* Transactions History */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Transacciones</h3>
              <p className="text-gray-400 text-sm mb-4">
                Visualiza tu historial de pagos y transacciones.
              </p>
              <button 
                onClick={() => setShowTransactionHistory(true)}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                Historial
              </button>
            </div>

            {/* Settings */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Configuración</h3>
              <p className="text-gray-400 text-sm mb-4">
                Administra tu perfil y preferencias.
              </p>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all">
                Ajustes
              </button>
            </div>
          </div>
        </div>

        {/* Travel Packages Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Paquetes Destacados</h2>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar"></div>
              Cargando viajes...
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
              <p className="text-gray-400 mb-4">No hay viajes disponibles en este momento</p>
              <button 
                onClick={() => router.push('/available-trips')}
                className="bg-stellar hover:bg-stellar/90 text-white font-bold py-2 px-6 rounded-lg transition-all">
                Ver todos los viajes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.slice(0, 3).map((trip, idx) => {
                const colors = [
                  { bg: 'from-stellar/20 to-cyan-500/20', border: 'stellar', text: 'stellar', button: 'bg-stellar hover:bg-stellar/90' },
                  { bg: 'from-cyan-500/20 to-blue-500/20', border: 'cyan-500', text: 'cyan-400', button: 'bg-cyan-500 hover:bg-cyan-600' },
                  { bg: 'from-amber-500/20 to-orange-500/20', border: 'amber-500', text: 'amber-400', button: 'bg-amber-500 hover:bg-amber-600' },
                ];
                const color = colors[idx % 3];

                return (
                  <div key={trip.id} className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl hover:border-${color.border}/50 transition-all`}>
                    <div className={`h-40 bg-gradient-to-br ${color.bg}`}></div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">{trip.destination}</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {trip.description || 'Descubre este increíble destino de estudio'}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-2xl font-bold text-${color.text}`}>{trip.priceXLM} XLM</span>
                        <span className={`text-xs bg-${color.border}/20 text-${color.text} px-3 py-1 rounded-full`}>
                          {trip.duration || 3} días
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedTripForReservation(trip);
                          setShowReservationModal(true);
                        }}
                        className={`w-full ${color.button} text-white font-bold py-2 px-4 rounded-lg transition-all`}>
                        Reservar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Modal */}
      {showTransactionHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h2 className="text-xl font-bold text-white">Historial de Transacciones</h2>
              <button
                onClick={() => setShowTransactionHistory(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <TransactionHistory />
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showReservationModal && selectedTripForReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h2 className="text-xl font-bold text-white">Reservar: {selectedTripForReservation.destination}</h2>
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  setSelectedTripForReservation(null);
                }}
                className="text-gray-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <ReservationModal trip={selectedTripForReservation} onClose={() => setShowReservationModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







