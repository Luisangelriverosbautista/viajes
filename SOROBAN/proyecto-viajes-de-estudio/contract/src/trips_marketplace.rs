use soroban_sdk::{
    contract, contractimpl, symbol_short, Address, Env, Symbol, Vec, Bytes, Map, Error as SorobanError,
};

use crate::trips_marketplace_types::{TripOffer, Reservation, MarketplaceError};

// Helper to convert MarketplaceError to SorobanError
fn err(_e: MarketplaceError) -> SorobanError {
    SorobanError::from((
        soroban_sdk::xdr::ScErrorType::Contract,
        soroban_sdk::xdr::ScErrorCode::InvalidAction,
    ))
}

// Storage keys
const INITIALIZED: Symbol = symbol_short!("INIT");
const TRIPS: Symbol = symbol_short!("TRIPS");
const RESERVATIONS: Symbol = symbol_short!("RES");
const TRIP_COUNT: Symbol = symbol_short!("TC");

#[contract]
pub struct TripsMarketplace;

#[contractimpl]
impl TripsMarketplace {
    /// Initialize the marketplace
    pub fn initialize(env: Env) -> Result<(), SorobanError> {
        if env.storage().instance().has(&INITIALIZED) {
            return Err(err(MarketplaceError::AlreadyInitialized));
        }

        env.storage().instance().set(&INITIALIZED, &true);
        env.storage().instance().set(&TRIP_COUNT, &0u64);

        Ok(())
    }

    /// Create a new trip offer by a company
    pub fn create_trip(
        env: Env,
        company: Address,
        destination: Bytes,
        description: Bytes,
        price_xlm: i128,
        available_spots: u32,
        start_date: u64,
        end_date: u64,
    ) -> Result<Bytes, SorobanError> {
        Self::require_initialized(&env)?;

        // Validate inputs
        if destination.len() == 0 || price_xlm <= 0 || available_spots == 0 {
            return Err(err(MarketplaceError::InvalidInput));
        }

        // Generate unique trip ID
        let trip_count: u64 = env.storage().instance().get(&TRIP_COUNT).unwrap_or(0);
        let trip_id = format_trip_id(trip_count);

        let trip = TripOffer {
            id: trip_id.clone(),
            company_wallet: company.clone(),
            destination,
            description,
            price_xlm,
            available_spots,
            reserved_spots: 0,
            start_date,
            end_date,
            created_at: env.ledger().timestamp(),
        };

        // Store the trip
        let mut trips: Map<Bytes, TripOffer> = env
            .storage()
            .instance()
            .get(&TRIPS)
            .unwrap_or(Map::new(&env));

        trips.set(trip_id.clone(), trip);
        env.storage().instance().set(&TRIPS, &trips);

        // Update count
        env.storage()
            .instance()
            .set(&TRIP_COUNT, &(trip_count + 1));

        Ok(trip_id)
    }

    /// Get a specific trip by ID
    pub fn get_trip(env: Env, trip_id: Bytes) -> Result<TripOffer, SorobanError> {
        let trips: Map<Bytes, TripOffer> = env
            .storage()
            .instance()
            .get(&TRIPS)
            .ok_or(err(MarketplaceError::TripNotFound))?;

        trips.get(trip_id).ok_or(err(MarketplaceError::TripNotFound))
    }

    /// List all available trips
    pub fn list_trips(env: Env) -> Vec<TripOffer> {
        let trips: Map<Bytes, TripOffer> = env
            .storage()
            .instance()
            .get(&TRIPS)
            .unwrap_or(Map::new(&env));

        let mut result = Vec::new(&env);
        let mut iter = trips.iter();

        while let Some((_, trip)) = iter.next() {
            result.push_back(trip);
        }

        result
    }

    /// List trips by a specific company
    pub fn list_company_trips(env: Env, company: Address) -> Vec<TripOffer> {
        let trips: Map<Bytes, TripOffer> = env
            .storage()
            .instance()
            .get(&TRIPS)
            .unwrap_or(Map::new(&env));

        let mut result = Vec::new(&env);
        let mut iter = trips.iter();

        while let Some((_, trip)) = iter.next() {
            if trip.company_wallet == company {
                result.push_back(trip);
            }
        }

        result
    }

    /// Make a reservation for a trip
    pub fn make_reservation(
        env: Env,
        trip_id: Bytes,
        client: Address,
        price_paid: i128,
    ) -> Result<Bytes, SorobanError> {
        Self::require_initialized(&env)?;

        // Get the trip
        let mut trips: Map<Bytes, TripOffer> = env
            .storage()
            .instance()
            .get(&TRIPS)
            .ok_or(err(MarketplaceError::TripNotFound))?;

        let mut trip = trips
            .get(trip_id.clone())
            .ok_or(err(MarketplaceError::TripNotFound))?;

        // Check availability
        if trip.reserved_spots >= trip.available_spots {
            return Err(err(MarketplaceError::NoAvailableSpots));
        }

        // Check price
        if price_paid < trip.price_xlm {
            return Err(err(MarketplaceError::InsufficientFunds));
        }

        // Generate reservation ID
        let res_count: u64 = env.storage().instance().get(&TRIP_COUNT).unwrap_or(0);
        let reservation_id = format_reservation_id(res_count);

        // Create reservation
        let reservation = Reservation {
            id: reservation_id.clone(),
            trip_id: trip_id.clone(),
            client_wallet: client.clone(),
            price_paid,
            status: Bytes::from_slice(&env, b"confirmed"),
            created_at: env.ledger().timestamp(),
        };

        // Update trip reserved spots
        trip.reserved_spots += 1;
        trips.set(trip_id.clone(), trip);
        env.storage().instance().set(&TRIPS, &trips);

        // Store reservation
        let mut reservations: Map<Bytes, Reservation> = env
            .storage()
            .instance()
            .get(&RESERVATIONS)
            .unwrap_or(Map::new(&env));

        reservations.set(reservation_id.clone(), reservation);
        env.storage().instance().set(&RESERVATIONS, &reservations);

        Ok(reservation_id)
    }

    /// Get a reservation by ID
    pub fn get_reservation(env: Env, reservation_id: Bytes) -> Result<Reservation, SorobanError> {
        let reservations: Map<Bytes, Reservation> = env
            .storage()
            .instance()
            .get(&RESERVATIONS)
            .ok_or(err(MarketplaceError::ReservationNotFound))?;

        reservations
            .get(reservation_id)
            .ok_or(err(MarketplaceError::ReservationNotFound))
    }

    /// List reservations for a client
    pub fn list_client_reservations(env: Env, client: Address) -> Vec<Reservation> {
        let reservations: Map<Bytes, Reservation> = env
            .storage()
            .instance()
            .get(&RESERVATIONS)
            .unwrap_or(Map::new(&env));

        let mut result = Vec::new(&env);
        let mut iter = reservations.iter();

        while let Some((_, res)) = iter.next() {
            if res.client_wallet == client {
                result.push_back(res);
            }
        }

        result
    }

    /// List reservations for a trip
    pub fn list_trip_reservations(env: Env, trip_id: Bytes) -> Vec<Reservation> {
        let reservations: Map<Bytes, Reservation> = env
            .storage()
            .instance()
            .get(&RESERVATIONS)
            .unwrap_or(Map::new(&env));

        let mut result = Vec::new(&env);
        let mut iter = reservations.iter();

        while let Some((_, res)) = iter.next() {
            if res.trip_id == trip_id {
                result.push_back(res);
            }
        }

        result
    }

    /// Cancel a reservation
    pub fn cancel_reservation(env: Env, reservation_id: Bytes) -> Result<(), SorobanError> {
        let mut reservations: Map<Bytes, Reservation> = env
            .storage()
            .instance()
            .get(&RESERVATIONS)
            .ok_or(err(MarketplaceError::ReservationNotFound))?;

        let mut reservation = reservations
            .get(reservation_id.clone())
            .ok_or(err(MarketplaceError::ReservationNotFound))?;

        reservation.status = Bytes::from_slice(&env, b"cancelled");
        reservations.set(reservation_id, reservation.clone());
        env.storage().instance().set(&RESERVATIONS, &reservations);

        // Decrease trip reserved spots
        let mut trips: Map<Bytes, TripOffer> = env
            .storage()
            .instance()
            .get(&TRIPS)
            .ok_or(err(MarketplaceError::TripNotFound))?;

        let mut trip = trips
            .get(reservation.trip_id.clone())
            .ok_or(err(MarketplaceError::TripNotFound))?;

        if trip.reserved_spots > 0 {
            trip.reserved_spots -= 1;
            trips.set(reservation.trip_id, trip);
            env.storage().instance().set(&TRIPS, &trips);
        }

        Ok(())
    }

    /// Get total trips count
    pub fn get_trips_count(env: Env) -> u64 {
        env.storage().instance().get(&TRIP_COUNT).unwrap_or(0)
    }
}

// Helper functions
impl TripsMarketplace {
    fn require_initialized(env: &Env) -> Result<(), SorobanError> {
        if env.storage().instance().has(&INITIALIZED) {
            Ok(())
        } else {
            Err(err(MarketplaceError::NotInitialized))
        }
    }
}

fn format_trip_id(count: u64) -> Bytes {
    // Use count as bytes directly prefixed with 't'
    let env = Env::default();
    let mut bytes: [u8; 9] = [0; 9];
    bytes[0] = b't';
    let count_bytes = count.to_le_bytes();
    for i in 0..8 {
        bytes[i + 1] = count_bytes[i];
    }
    Bytes::from_slice(&env, &bytes)
}

fn format_reservation_id(count: u64) -> Bytes {
    // Use count as bytes directly prefixed with 'r'
    let env = Env::default();
    let mut bytes: [u8; 9] = [0; 9];
    bytes[0] = b'r';
    let count_bytes = count.to_le_bytes();
    for i in 0..8 {
        bytes[i + 1] = count_bytes[i];
    }
    Bytes::from_slice(&env, &bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripsMarketplace);
        let client = TripsMarketplaceClient::new(&env, &contract_id);

        assert!(client.initialize().is_ok());
    }

    #[test]
    fn test_create_trip() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripsMarketplace);
        let client = TripsMarketplaceClient::new(&env, &contract_id);

        client.initialize().unwrap();

        let company = Address::generate(&env);
        let destination = Bytes::from_slice(&env, b"Japan");
        let description = Bytes::from_slice(&env, b"Amazing trip to Japan");

        let trip_id = client.create_trip(
            &company,
            &destination,
            &description,
            &100_000_000, // 1 XLM in stroops
            &10,          // 10 spots
            &1700000000,  // start date
            &1700100000,  // end date
        );

        assert!(trip_id.is_ok());
    }

    #[test]
    fn test_list_trips() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripsMarketplace);
        let client = TripsMarketplaceClient::new(&env, &contract_id);

        client.initialize().unwrap();

        let company = Address::generate(&env);
        let destination = Bytes::from_slice(&env, b"Japan");
        let description = Bytes::from_slice(&env, b"Amazing trip");

        client
            .create_trip(
                &company,
                &destination,
                &description,
                &100_000_000,
                &10,
                &1700000000,
                &1700100000,
            )
            .unwrap();

        let trips = client.list_trips();
        assert_eq!(trips.len(), 1);
    }
}
