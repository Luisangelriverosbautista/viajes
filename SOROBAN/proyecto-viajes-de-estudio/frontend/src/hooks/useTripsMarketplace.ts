import { useState, useCallback } from 'react';

export const useTripsMarketplace = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeMarketplace = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      throw new Error('Soroban context not available - useTripsMarketplace needs SorobanContext setup');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Error initializing marketplace:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrip = useCallback(
    async (
      destination: string,
      description: string,
      priceXLM: number,
      availableSpots: number,
      startDate: number,
      endDate: number
    ) => {
      try {
        setIsLoading(true);
        setError(null);
        throw new Error('Soroban contract not available');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('❌ Error creating trip:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const listTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.warn('⚠️ Contract not yet initialized, returning empty array');
      return [];
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Error loading trips:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listCompanyTrips = useCallback(
    async (companyWallet: string) => {
      try {
        setIsLoading(true);
        setError(null);
        throw new Error('Contract not initialized');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('❌ Error loading company trips:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const makeReservation = useCallback(
    async (tripId: string, priceXLM: number) => {
      try {
        setIsLoading(true);
        setError(null);
        throw new Error('Contract or signer not initialized');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('❌ Error making reservation:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const listClientReservations = useCallback(
    async (clientWallet: string) => {
      try {
        setIsLoading(true);
        setError(null);
        throw new Error('Contract not initialized');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('❌ Error loading reservations:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    initializeMarketplace,
    createTrip,
    listTrips,
    listCompanyTrips,
    makeReservation,
    listClientReservations,
    isLoading,
    error,
  };
};