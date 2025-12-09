use soroban_sdk::{contracttype, Address, Bytes};

/// Trip Offer created by companies
#[contracttype]
#[derive(Clone, Debug)]
pub struct TripOffer {
    pub id: Bytes,                    // Unique ID
    pub company_wallet: Address,      // Company offering the trip
    pub destination: Bytes,           // Destination name
    pub description: Bytes,           // Trip description
    pub price_xlm: i128,              // Price in XLM stroops
    pub available_spots: u32,         // Available spots
    pub reserved_spots: u32,          // Already reserved
    pub start_date: u64,              // Start date (timestamp)
    pub end_date: u64,                // End date (timestamp)
    pub created_at: u64,              // Creation timestamp
}

/// Reservation made by students/clients
#[contracttype]
#[derive(Clone, Debug)]
pub struct Reservation {
    pub id: Bytes,                    // Unique ID
    pub trip_id: Bytes,               // Trip being reserved
    pub client_wallet: Address,       // Student wallet
    pub price_paid: i128,             // Price paid in XLM
    pub status: Bytes,                // "pending", "confirmed", "cancelled"
    pub created_at: u64,              // Reservation timestamp
}

/// Error types - using i32 for Soroban compatibility
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(i32)]
pub enum MarketplaceError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    InvalidInput = 3,
    TripNotFound = 4,
    NoAvailableSpots = 5,
    InsufficientFunds = 6,
    Unauthorized = 7,
    ReservationNotFound = 8,
    AlreadyReserved = 9,
}
