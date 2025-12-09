import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use /tmp in Netlify (serverless), fallback to data/ in local dev
const isNetlify = process.env.NETLIFY === 'true';
const DATA_DIR = isNetlify 
  ? '/tmp/viajar-data' 
  : path.join(process.cwd(), 'data');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');

console.log(`[RESERVATIONS API] Using DATA_DIR: ${DATA_DIR} (Netlify: ${isNetlify})`);

// Asegurar que el directorio de datos existe
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`[RESERVATIONS API] Created DATA_DIR: ${DATA_DIR}`);
    }
  } catch (error) {
    console.error(`[RESERVATIONS API] Error creating DATA_DIR:`, error);
    throw error;
  }
}

// Leer reservas de archivo
function readReservations() {
  ensureDataDir();
  if (!fs.existsSync(RESERVATIONS_FILE)) {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify([]));
    return [];
  }
  let data = fs.readFileSync(RESERVATIONS_FILE, 'utf-8');
  // Limpiar BOM y caracteres especiales
  data = data.replace(/^\uFEFF/, '').trim();
  // Si el archivo está vacío o solo tiene espacios, retornar array vacío
  if (!data || data === '') {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Guardar reservas a archivo
function saveReservations(reservations: any[]) {
  ensureDataDir();
  fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    console.log('[POST /api/reservations] Request received');
    const body = await req.json();
    console.log('[POST /api/reservations] Body:', body);
    
    const { tripId, clientWallet, companyWallet, amount, txHash, status } = body;

    // Validar campos requeridos
    if (!tripId || !clientWallet || !companyWallet || !amount) {
      console.warn('[POST /api/reservations] Missing required fields:', { tripId, clientWallet, companyWallet, amount });
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: tripId, clientWallet, companyWallet, amount'
      }, { status: 400 });
    }

    const reservation = {
      id: `reservation_${Date.now()}`,
      tripId,
      clientWallet,
      companyWallet,
      amount,
      txHash: txHash || null,
      status: status || 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('[POST /api/reservations] Creating reservation:', reservation);
    
    try {
      ensureDataDir();
      const reservations = readReservations();
      reservations.push(reservation);
      saveReservations(reservations);
      console.log('[POST /api/reservations] Reservation saved successfully');
    } catch (persistError: any) {
      // En Netlify /tmp puede no persistir, pero la transacción ya fue en blockchain
      console.warn('[POST /api/reservations] Persist error (Netlify):', persistError.message);
    }

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Reservation created successfully'
    }, { status: 201 });
  } catch (error: any) {
    // Si es error de persistencia de archivo, aún confirmamos la reserva
    // porque la transacción ya ocurrió en blockchain
    const errorMessage = error?.message || String(error);
    if (error?.code === 'EROFS' || errorMessage.includes('read-only')) {
      console.warn('[POST /api/reservations] Read-only filesystem, but transaction is valid');
      const body = await req.json();
      const reservation = {
        id: `reservation_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        reservation,
        message: 'Reservation registered (blockchain transaction completed)'
      }, { status: 201 });
    }
    
    console.error('[POST /api/reservations] Error:', error);
    return NextResponse.json({
      success: false,
      message: `Server error: ${errorMessage}`
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('[GET /api/reservations] Request received');
    const { searchParams } = new URL(req.url);
    const clientWallet = searchParams.get('clientWallet');

    ensureDataDir();
    const reservations = readReservations();
    console.log('[GET /api/reservations] Total reservations:', reservations.length);

    if (clientWallet) {
      const filtered = reservations.filter((r: any) => r.clientWallet === clientWallet);
      console.log(`[GET /api/reservations] Filtered for wallet ${clientWallet.slice(0,10)}...: ${filtered.length} reservations`);
      return NextResponse.json({
        success: true,
        reservations: filtered,
        count: filtered.length
      });
    }

    return NextResponse.json({
      success: true,
      reservations,
      count: reservations.length
    });
  } catch (error) {
    console.error('[GET /api/reservations] Error:', error);
    return NextResponse.json({
      success: false,
      message: String(error)
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    console.log('[PATCH /api/reservations] Request received');
    const body = await req.json();
    const { reservationId, clientWallet, txHash } = body;

    if (!reservationId || !clientWallet || !txHash) {
      console.warn('[PATCH /api/reservations] Missing required fields');
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: reservationId, clientWallet, txHash'
      }, { status: 400 });
    }

    ensureDataDir();
    const reservations = readReservations();
    const updated = reservations.map((r: any) => {
      if (r.id === reservationId && r.clientWallet === clientWallet) {
        console.log('[PATCH /api/reservations] Updating reservation with txHash');
        return {
          ...r,
          status: 'completed',
          txHash,
        };
      }
      return r;
    });

    saveReservations(updated);
    console.log('[PATCH /api/reservations] Reservation updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Reservation updated'
    });
  } catch (error) {
    console.error('[PATCH /api/reservations] Error:', error);
    return NextResponse.json({
      success: false,
      message: String(error)
    }, { status: 500 });
  }
}
