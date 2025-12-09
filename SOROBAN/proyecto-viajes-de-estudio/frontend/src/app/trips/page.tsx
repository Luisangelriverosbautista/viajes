'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';

interface Trip {
  id: string;
  name: string;
  description: string;
  destination: string;
  duration: string;
  priceXLM: number;
  image: string;
  highlights: string[];
  available: boolean;
}

const AVAILABLE_TRIPS: Trip[] = [
  {
    id: 'cdmx',
    name: 'Viaje a CDMX',
    description: 'Explora la capital: Museo de AntropologÃ­a, TeotihuacÃ¡n y mÃ¡s.',
    destination: 'Ciudad de MÃ©xico',
    duration: '5 dÃ­as',
    priceXLM: 50,
    image: 'bg-blue-600',
    highlights: [
      'Museo de AntropologÃ­a',
      'PirÃ¡mides de TeotihuacÃ¡n',
      'Xochimilco',
      'Centro HistÃ³rico',
    ],
    available: true,
  },
  {
    id: 'cancun',
    name: 'Playas de CancÃºn',
    description: 'RelÃ¡jate en las mejores playas del Caribe mexicano.',
    destination: 'CancÃºn, Quintana Roo',
    duration: '7 dÃ­as',
    priceXLM: 75,
    image: 'bg-cyan-600',
    highlights: [
      'Playas paradisÃ­acas',
      'Snorkel en cenotes',
      'Isla Mujeres',
      'Playa del Carmen',
    ],
    available: true,
  },
  {
    id: 'oaxaca',
    name: 'Oaxaca Cultural',
    description: 'Descubre la riqueza cultural de Oaxaca y sus tradiciones.',
    destination: 'Oaxaca',
    duration: '4 dÃ­as',
    priceXLM: 60,
    image: 'bg-amber-700',
    highlights: [
      'Templo de Santo Domingo',
      'Mercados tradicionales',
      'Monte AlbÃ¡n',
      'GastronomÃ­a oaxaqueÃ±a',
    ],
    available: true,
  },
  {
    id: 'veracruz',
    name: 'Veracruz HistÃ³rico',
    description: 'Conoce la historia del puerto mÃ¡s importante de MÃ©xico.',
    destination: 'Veracruz',
    duration: '3 dÃ­as',
    priceXLM: 40,
    image: 'bg-orange-600',
    highlights: [
      'Castillo de San Juan de UlÃºa',
      'MalecÃ³n histÃ³rico',
      'Museo Naval',
      'GastronomÃ­a local',
    ],
    available: true,
  },
];

export default function TripsPage() {
  const router = useRouter();
  const { account, isConnecting } = useWallet();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingTrip, setProcessingTrip] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Redirigir al login si no hay wallet conectada
  React.useEffect(() => {
    if (!account && !isConnecting) {
      router.push('/login');
    }
  }, [account, isConnecting, router]);

  const handleReserveClick = (trip: Trip) => {
    if (!account) {
      router.push('/login');
      return;
    }

    if (account.balance < trip.priceXLM) {
      alert(`Saldo insuficiente. Necesitas ${trip.priceXLM} XLM, tienes ${account.balance} XLM`);
      return;
    }

    setSelectedTrip(trip);
    setShowModal(true);
  };

  const handleConfirmPurchase = useCallback(async () => {
    if (!selectedTrip || !account) return;

    setProcessingTrip(selectedTrip.id);
    try {
      // Simular proceso de compra/transferencia
      console.log('ðŸš€ Procesando reserva:', selectedTrip.name);
      console.log('ðŸ’° Monto:', selectedTrip.priceXLM, 'XLM');
      console.log('ðŸ‘¤ Desde:', account.publicKey);
      console.log('ðŸ“ ID Reserva:', `TRIP_${Date.now()}`);

      // AquÃ­ irÃ­a la lÃ³gica de transferencia real con Freighter
      // Por ahora simulamos un delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage(`âœ… Â¡Viaje a ${selectedTrip.destination} reservado exitosamente!`);
      setShowModal(false);
      setSelectedTrip(null);

      // Limpiar mensaje despuÃ©s de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingTrip(null);
    }
  }, [selectedTrip, account]);

  const handleDonate = useCallback(async (trip: Trip, amount: number) => {
    if (!account) {
      router.push('/login');
      return;
    }

    setProcessingTrip(trip.id);
    try {
      console.log('ðŸŽ DonaciÃ³n a:', trip.name);
      console.log('ðŸ’° Monto:', amount, 'XLM');
      console.log('ðŸ‘¤ Desde:', account.publicKey);

      // AquÃ­ irÃ­a la lÃ³gica de donaciÃ³n real
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage(`âœ… Â¡DonaciÃ³n de ${amount} XLM realizada con Ã©xito!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(`Error en donaciÃ³n: ${error.message}`);
    } finally {
      setProcessingTrip(null);
    }
  }, [account, router]);

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Conectando wallet...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Viajes Disponibles</h1>
            <p className="text-gray-400">Explora nuestros paquetes de viajes de estudio</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            â† Volver
          </button>
        </div>

        {/* Wallet Info */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-400">Tu saldo disponible:</p>
          <p className="text-2xl font-bold text-cyan-400">{account.balance.toFixed(2)} XLM</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-900/30 border border-green-500 rounded-lg">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}
      </div>

      {/* Trips Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {AVAILABLE_TRIPS.map(trip => (
          <div
            key={trip.id}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition hover:shadow-lg hover:shadow-cyan-500/20"
          >
            {/* Trip Image */}
            <div className={`${trip.image} h-48 flex items-end justify-start p-4`}>
              <h3 className="text-2xl font-bold text-white">{trip.name}</h3>
            </div>

            {/* Trip Info */}
            <div className="p-6">
              <p className="text-gray-400 mb-4">{trip.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">ðŸ“ Destino:</span>
                  <span className="text-gray-300">{trip.destination}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">â±ï¸ DuraciÃ³n:</span>
                  <span className="text-gray-300">{trip.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">ðŸ’° Precio:</span>
                  <span className="text-cyan-400 font-bold text-lg">{trip.priceXLM} XLM</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-400 mb-2">Incluye:</p>
                <ul className="space-y-1">
                  {trip.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-center">
                      <span className="text-cyan-400 mr-2">âœ“</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleReserveClick(trip)}
                  disabled={processingTrip === trip.id || !trip.available}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                  {processingTrip === trip.id ? 'â³ Procesando...' : 'ðŸŽ« Reservar'}
                </button>

                <button
                  onClick={() => handleDonate(trip, 10)}
                  disabled={processingTrip === trip.id || account.balance < 10}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                  {processingTrip === trip.id ? 'â³ Procesando...' : 'ðŸŽ Donar 10 XLM'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reservation Modal */}
      {showModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Confirmar Reserva</h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Viaje:</p>
                <p className="text-white font-semibold">{selectedTrip.name}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Destino:</p>
                <p className="text-white font-semibold">{selectedTrip.destination}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Costo:</p>
                <p className="text-cyan-400 font-bold text-xl">{selectedTrip.priceXLM} XLM</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Tu saldo disponible:</p>
                <p className="text-cyan-400 font-semibold">{account.balance.toFixed(2)} XLM</p>
              </div>

              {account.balance - selectedTrip.priceXLM >= 0 && (
                <div className="bg-green-900/20 border border-green-500 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Saldo despuÃ©s de la compra:</p>
                  <p className="text-green-400 font-semibold">
                    {(account.balance - selectedTrip.priceXLM).toFixed(2)} XLM
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={processingTrip === selectedTrip.id}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
              >
                {processingTrip === selectedTrip.id ? 'â³ Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







