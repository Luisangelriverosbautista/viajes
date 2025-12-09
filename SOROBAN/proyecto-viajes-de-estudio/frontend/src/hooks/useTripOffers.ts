import { useState, useEffect, useCallback } from 'react';
import { useUserRegistry } from './useUserRegistry';

export interface TripOffer {
  id: string;
  companyWallet: string;
  companyName?: string;
  name: string;
  destination: string;
  duration: string;
  priceXLM: number;
  description: string;
  maxParticipants: number;
  currentBookings: number;
  status: 'active' | 'inactive';
  createdAt: string;
  highlights: string[];
}

export interface ClientReservation {
  id: string;
  tripId: string;
  clientWallet: string;
  companyWallet: string;
  amount: number;
  txHash?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export const useTripOffers = () => {
  const [trips, setTrips] = useState<TripOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Cargar todas las propuestas de viajes de todas las empresas desde la API
  const loadAllTrips = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/trips?t=' + Date.now()); // Force no cache
      if (!response.ok) {
        throw new Error(`Failed to fetch trips: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('[HOOK] API error:', data.message);
        return null;
      }
      
      const activeTrips = data.trips.filter((t: TripOffer) => t.status === 'active');
      
      // 🔄 DEDUPLICACIÓN: Solo actualizar si cambió el contenido
      const currentTripsStr = JSON.stringify(trips);
      const newTripsStr = JSON.stringify(activeTrips);
      
      if (currentTripsStr !== newTripsStr) {
        console.log(`[HOOK] 📡 Cambios detectados: ${trips.length} → ${activeTrips.length} viajes`);
        setTrips(activeTrips);
      } else {
        console.log(`[HOOK] ✓ Sin cambios (${activeTrips.length} viajes)`);
      }
      
      return activeTrips;
    } catch (error) {
      console.error('[HOOK] ❌ Error cargando viajes:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [trips]);

  // Cargar reservas del cliente actual
  const loadClientReservations = useCallback(async (clientWallet: string): Promise<ClientReservation[]> => {
    try {
      const response = await fetch(`/api/reservations?clientWallet=${encodeURIComponent(clientWallet)}`);
      if (!response.ok) {
        console.warn(`Failed to fetch reservations: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      if (data.success) {
        return data.reservations;
      }
      return [];
    } catch (error) {
      console.error('[HOOK] Error cargando reservas:', error);
      return [];
    }
  }, []);

  // Crear reserva
  const createReservation = useCallback(async (
    tripId: string,
    clientWallet: string,
    companyWallet: string,
    amount: number
  ): Promise<ClientReservation | null> => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          clientWallet,
          companyWallet,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create reservation: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log('✅ [HOOK] Reserva creada:', data.reservation.id);
        // Recargar viajes para actualizar booking counts
        await loadAllTrips();
        return data.reservation;
      } else {
        console.error('❌ [HOOK] Error:', data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ [HOOK] Error creando reserva:', error);
      return null;
    }
  }, [loadAllTrips]);

  // Confirmar pago de reserva
  const confirmReservationPayment = useCallback(async (
    reservationId: string,
    clientWallet: string,
    txHash: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          clientWallet,
          txHash,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to confirm payment: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log('✅ [HOOK] Pago confirmado:', txHash);
        return true;
      } else {
        console.error('❌ [HOOK] Error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ [HOOK] Error confirmando pago:', error);
      return false;
    }
  }, []);

  // Obtener viaje por ID
  const getTripById = useCallback((tripId: string): TripOffer | undefined => {
    return trips.find(t => t.id === tripId);
  }, [trips]);

  // Obtener viajes por empresa
  const getTripsByCompany = useCallback((companyWallet: string): TripOffer[] => {
    return trips.filter(t => t.companyWallet === companyWallet);
  }, [trips]);

  // Solo cargar en cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar viajes cuando se marca como cliente con polling adaptativo
  useEffect(() => {
    if (isClient) {
      loadAllTrips();
      
      // Polling adaptativo: comienza lento, se acelera con cambios
      let currentInterval = 30000; // 30 segundos inicial
      let lastTripsHash = '';
      let lastChangeTime = Date.now();
      
      const updatePolling = async () => {
        const beforeCount = trips.length;
        await loadAllTrips();
        const afterCount = trips.length;
        
        // Si hay cambios, acelera el polling
        if (beforeCount !== afterCount) {
          console.log('🔄 [HOOK] Cambios detectados, acelerando polling...');
          lastChangeTime = Date.now();
          currentInterval = 5000; // 5 segundos cuando hay actividad
        } else {
          // Si han pasado 60 segundos sin cambios, ralentiza
          const timeSinceChange = Date.now() - lastChangeTime;
          if (timeSinceChange > 60000 && currentInterval !== 30000) {
            console.log('⏱️ [HOOK] Sin cambios por 60s, ralentizando polling...');
            currentInterval = 30000; // Vuelve a 30 segundos
          }
        }
      };
      
      // Intervalo adaptativo
      let pollingInterval: NodeJS.Timeout;
      
      const scheduleNextPoll = () => {
        pollingInterval = setTimeout(() => {
          updatePolling();
          scheduleNextPoll();
        }, currentInterval);
      };
      
      scheduleNextPoll();
      
      return () => clearTimeout(pollingInterval);
    }
  }, [isClient, loadAllTrips, trips.length]);

  return {
    trips,
    loading,
    loadAllTrips,
    loadClientReservations,
    createReservation,
    confirmReservationPayment,
    getTripById,
    getTripsByCompany,
  };
};
