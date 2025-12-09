'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useUserRegistry } from '@/hooks/useUserRegistry';
import { usePersistUserRegistry } from '@/hooks/usePersistUserRegistry';
import { useTripOffers, TripOffer, ClientReservation } from '@/hooks/useTripOffers';
import { MapPin, Clock, Users, DollarSign, Star, LogOut, ArrowLeft, Wallet, Check, Loader, RotateCw } from 'lucide-react';

export default function AvailableTripsPage() {
  // Sincronizar registry persistentemente
  usePersistUserRegistry();

  const router = useRouter();
  const { account, disconnectWallet } = useWallet();
  const { getCurrentUser } = useUserRegistry();
  const { trips, loading, loadAllTrips, loadClientReservations, createReservation, confirmReservationPayment } = useTripOffers();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reservations, setReservations] = useState<ClientReservation[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripOffer | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState(1000);
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar si está autenticado
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      // No hay usuario, redirigir al login
      router.push('/login');
      return;
    }
    // Permitir tanto clientes como empresas ver viajes
    console.log(`✅ [AVAILABLE-TRIPS] Usuario autenticado: ${user.userType} (${user.name || user.companyName})`);
    setCurrentUser(user);
    if (account?.publicKey) {
      loadClientReservations(account.publicKey).then(res => setReservations(res));
    }
    setIsInitialized(true);
  }, [router, account?.publicKey]);

  // FunciÃ³n para refrescar viajes manualmente
  const handleRefreshTrips = async () => {
    setRefreshing(true);
    console.log('ðŸ”„ [PAGE] Refrescando lista de viajes...');
    await loadAllTrips();
    setRefreshing(false);
  };

  const filteredTrips = trips.filter(trip => {
    const matchesDestination = trip.destination.toLowerCase().includes(filterDestination.toLowerCase());
    const matchesPrice = trip.priceXLM <= filterMaxPrice;
    return matchesDestination && matchesPrice;
  });

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_wallet');
    router.push('/login');
  };

  const handleReserveTrip = (trip: TripOffer) => {
    if (trip.currentBookings >= trip.maxParticipants) {
      alert('Este viaje estÃ¡ lleno');
      return;
    }
    setSelectedTrip(trip);
    setShowReservationModal(true);
    setPaymentStatus('idle');
  };

  const handleConfirmReservation = async () => {
    if (!selectedTrip || !account?.publicKey) return;

    try {
      setProcessingPayment(true);
      
      // Crear reserva (ahora es async)
      const reservation = await createReservation(
        selectedTrip.id,
        account.publicKey,
        selectedTrip.companyWallet,
        selectedTrip.priceXLM
      );

      if (!reservation) {
        throw new Error('Error al crear la reserva');
      }

      console.log('ðŸ”„ [PAGE] Iniciando pago para reserva:', reservation.id);

      // Simular procesamiento de pago Stellar
      // En producciÃ³n, aquÃ­ se harÃ­a una transacciÃ³n real a travÃ©s de FreighterAPI
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirmar pago
      const mockTxHash = `stellar_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await confirmReservationPayment(reservation.id, account.publicKey, mockTxHash);

      setPaymentStatus('success');
      setReservations([...reservations, { ...reservation, status: 'completed', txHash: mockTxHash }]);

      console.log('âœ… [PAGE] Reserva completada. TX:', mockTxHash);

      setTimeout(() => {
        setShowReservationModal(false);
        setSelectedTrip(null);
        setPaymentStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('âŒ [PAGE] Error procesando reserva:', error);
      setPaymentStatus('error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const isAlreadyReserved = (tripId: string) => {
    return reservations.some(r => r.tripId === tripId && r.status === 'completed');
  };

  const getReservedCount = (tripId: string) => {
    return reservations.filter(r => r.tripId === tripId && r.status === 'completed').length;
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-stellar/20 rounded-full mb-4">
            <Wallet className="w-12 h-12 text-stellar animate-pulse" />
          </div>
          <p className="text-gray-300">Inicializando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-stellar/20 rounded-full mb-4">
            <Wallet className="w-12 h-12 text-stellar animate-pulse" />
          </div>
          <p className="text-gray-300">Cargando viajes disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              title="Volver"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">Viajes Disponibles</h1>
              <p className="text-gray-400">Explora y reserva tu prÃ³ximo viaje de estudio</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar SesiÃ³n
          </button>
        </div>

        {/* User Info */}
        <div className="bg-gradient-to-r from-stellar/20 to-cyan-500/20 rounded-2xl p-4 mb-8 border border-stellar/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Conectado como: <span className="text-stellar font-bold">{currentUser.name}</span></p>
              <p className="text-xs text-gray-400 font-mono mt-1">{account?.publicKey.substring(0, 20)}...</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300">Saldo: <span className="text-green-400 font-bold text-xl">{account?.balance.toFixed(2)} XLM</span></p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Filtros</h2>
            <button
              onClick={handleRefreshTrips}
              disabled={refreshing || loading}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-all text-sm"
            >
              <RotateCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Destino</label>
              <input
                type="text"
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
                placeholder="Buscar destino..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-stellar focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Precio mÃ¡ximo: {filterMaxPrice} XLM</label>
              <input
                type="range"
                min="0"
                max="500"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <div className="text-gray-300 text-sm">
                <span className="font-semibold text-cyan-400">{filteredTrips.length}</span> viajes encontrados
              </div>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 text-stellar animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Cargando viajes...</p>
            </div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-12 border border-slate-700/50 text-center">
              <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No hay viajes disponibles</h3>
              <p className="text-gray-400 mb-6">Intenta ajustar los filtros o vuelve mÃ¡s tarde</p>
              <button
                onClick={handleRefreshTrips}
                disabled={refreshing || loading}
                className="bg-stellar hover:bg-stellar/90 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing || loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>

            {/* Debug Info */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700/50 text-left">
              <h4 className="text-sm font-bold text-cyan-400 mb-3">ðŸ“Š InformaciÃ³n de Debug</h4>
              <div className="text-xs text-gray-300 font-mono space-y-1">
                <p>âœ“ User conectado: {currentUser?.name}</p>
                <p>âœ“ Wallet: {account?.publicKey?.substring(0, 16)}...</p>
                <p>âœ“ Tipo: {currentUser?.userType}</p>
                <p>âœ“ Viajes cargados: {trips.length}</p>
                <p>âœ“ Filtrados: {filteredTrips.length}</p>
                <p>âœ“ localStorage.registered_users: {JSON.parse(localStorage.getItem('registered_users') || '[]').length} items</p>
                <p>âœ“ localStorage.user_registry: {JSON.parse(localStorage.getItem('user_registry') || '[]').length} items</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(trip => {
              const isReserved = isAlreadyReserved(trip.id);
              const spotsLeft = trip.maxParticipants - trip.currentBookings;
              const isFull = spotsLeft <= 0;

              return (
                <div
                  key={trip.id}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-stellar/50 transition-all shadow-xl flex flex-col"
                >
                  {/* Header */}
                  <div className="h-40 bg-gradient-to-br from-stellar/30 to-cyan-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-stellar/60 mx-auto mb-2" />
                        <p className="text-stellar/80 font-semibold">{trip.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Company Info */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Oferta de: <span className="text-gray-300 font-semibold">{trip.companyName}</span></p>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{trip.name}</h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{trip.description}</p>

                    {/* Highlights */}
                    <div className="mb-4 space-y-1">
                      {trip.highlights.slice(0, 2).map((h, idx) => (
                        <p key={idx} className="text-gray-400 text-xs">âœ“ {h}</p>
                      ))}
                      {trip.highlights.length > 2 && (
                        <p className="text-gray-400 text-xs">+{trip.highlights.length - 2} mÃ¡s</p>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">{trip.duration}</span>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">{trip.currentBookings}/{trip.maxParticipants}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Status */}
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-xs">Precio</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-stellar">{trip.priceXLM}</span>
                          <span className="text-gray-400">XLM</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {isFull ? (
                          <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full">LLENO</span>
                        ) : spotsLeft <= 2 ? (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                            {spotsLeft} lugar{spotsLeft !== 1 ? 's' : ''} libre
                          </span>
                        ) : (
                          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                            Disponible
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => router.push(`/trip-detail?id=${trip.id}`)}
                      disabled={isFull || isReserved}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-auto ${
                        isReserved
                          ? 'bg-green-600/20 text-green-400 border border-green-500/50 cursor-default'
                          : isFull
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-stellar hover:bg-stellar/90 text-white hover:shadow-lg'
                      }`}
                    >
                      {isReserved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Reservado
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" />
                          Ver Detalles
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My Reservations Section */}
        {reservations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Mis Reservas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations.map(reservation => {
                const trip = trips.find(t => t.id === reservation.tripId);
                if (!trip) return null;

                return (
                  <div
                    key={reservation.id}
                    className="bg-gradient-to-br from-green-900/30 to-slate-900 rounded-2xl p-6 border border-green-500/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{trip.name}</h4>
                        <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                          <Check className="w-4 h-4" />
                          Confirmada
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>Destino: <span className="text-white font-semibold">{trip.destination}</span></p>
                      <p>Monto: <span className="text-green-400 font-semibold">{reservation.amount} XLM</span></p>
                      <p className="text-xs text-gray-500 font-mono break-all">
                        TX: {reservation.txHash?.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {showReservationModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 max-w-md w-full">
            {paymentStatus === 'idle' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">Confirmar Reserva</h2>

                {/* Trip Summary */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-3">{selectedTrip.name}</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="text-gray-400">Destino:</span> {selectedTrip.destination}</p>
                    <p><span className="text-gray-400">DuraciÃ³n:</span> {selectedTrip.duration}</p>
                    <p><span className="text-gray-400">Empresa:</span> {selectedTrip.companyName}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-stellar/10 rounded-lg p-4 mb-6 border border-stellar/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Monto a pagar:</span>
                    <span className="text-2xl font-bold text-stellar">{selectedTrip.priceXLM} XLM</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Se enviarÃ¡ desde tu wallet a la empresa
                  </p>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                  <p className="text-yellow-300 text-xs">
                    âš ï¸ Esta transacciÃ³n se procesarÃ¡ en Stellar Testnet. Confirma antes de proceder.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowReservationModal(false);
                      setSelectedTrip(null);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    disabled={processingPayment}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmReservation}
                    disabled={processingPayment}
                    className="flex-1 bg-stellar hover:bg-stellar/90 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processingPayment ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        Confirmar Pago
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : paymentStatus === 'success' ? (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Â¡Reserva Confirmada!</h2>
                  <p className="text-gray-400 mb-6">Tu reserva ha sido procesada exitosamente</p>

                  <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700 text-left">
                    <p className="text-gray-300 text-sm mb-2">{selectedTrip.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Pagado:</span>
                      <span className="text-green-400 font-bold">{selectedTrip.priceXLM} XLM</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm">
                    RecibirÃ¡s un correo de confirmaciÃ³n pronto
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">âœ•</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Error en la TransacciÃ³n</h2>
                  <p className="text-gray-400 mb-6">No se pudo procesar el pago. Intenta nuevamente.</p>

                  <button
                    onClick={() => {
                      setShowReservationModal(false);
                      setSelectedTrip(null);
                      setPaymentStatus('idle');
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}







