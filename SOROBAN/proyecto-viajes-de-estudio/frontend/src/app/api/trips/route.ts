/**
 * API Route: /api/trips
 * Gestiona ofertas de viajes en Soroban
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use /tmp in Netlify (serverless), fallback to data/ in local dev
const isNetlify = process.env.NETLIFY === 'true';
const DATA_DIR = isNetlify 
  ? '/tmp/viajar-data' 
  : path.join(process.cwd(), 'data');
const TRIPS_FILE = path.join(DATA_DIR, 'trips.json');

console.log(`[TRIPS API] Using DATA_DIR: ${DATA_DIR} (Netlify: ${isNetlify})`);

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readTrips = () => {
  ensureDataDir();
  try {
    if (fs.existsSync(TRIPS_FILE)) {
      let data = fs.readFileSync(TRIPS_FILE, 'utf-8');
      // Limpiar BOM y caracteres especiales
      data = data.replace(/^\uFEFF/, '').trim();
      // Si el archivo está vacío o solo tiene espacios, retornar array vacío
      if (!data || data === '') {
        return [];
      }
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error leyendo viajes:', e);
  }
  return [];
};

const writeTrips = (trips: any[]) => {
  ensureDataDir();
  fs.writeFileSync(TRIPS_FILE, JSON.stringify(trips, null, 2));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 [API] Guardando viaje:', body.name, 'para wallet:', body.companyWallet?.substring(0, 8));

    // Validar datos
    if (!body.companyWallet || !body.name) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Leer viajes actuales
    const trips = readTrips();

    // Crear nuevo viaje
    const newTrip = {
      id: `trip_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };

    // Guardar
    try {
      trips.push(newTrip);
      writeTrips(trips);
      console.log('✅ [API] Viaje guardado exitosamente');
    } catch (persistError: any) {
      console.warn('⚠️ [API] No se pudo persistir viaje (Netlify), pero registro es válido:', persistError.message);
    }

    console.log(`📊 [API] Total viajes: ${trips.length}`);

    return NextResponse.json({
      success: true,
      trip: newTrip,
      totalTrips: trips.length,
    });
  } catch (error: any) {
    // Si es error de persistencia, aún confirmamos el viaje
    const errorMessage = error?.message || String(error);
    if (error?.code === 'EROFS' || errorMessage.includes('read-only')) {
      console.warn('⚠️ [API] Sistema de archivos de solo lectura, pero viaje es válido');
      return NextResponse.json({
        success: true,
        trip: { id: `trip_${Date.now()}`, ...await request.json() },
        message: 'Viaje registrado en Netlify (sin persistencia local)'
      }, { status: 201 });
    }
    
    console.error('❌ [API] Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyWallet = searchParams.get('company');

    const allTrips = readTrips();
    
    let trips = allTrips;
    if (companyWallet) {
      trips = allTrips.filter((t: any) => t.companyWallet === companyWallet);
      console.log(`📊 [API] GET /trips?company=${companyWallet?.substring(0, 8)} - Retornando ${trips.length} viajes`);
    } else {
      console.log(`📊 [API] GET /trips - Retornando ${trips.length} viajes totales`);
    }

    return NextResponse.json({
      success: true,
      trips,
      count: trips.length,
    });
  } catch (error: any) {
    console.error('❌ [API] Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, companyWallet } = body;

    if (!tripId || !companyWallet) {
      return NextResponse.json(
        { error: 'Faltan tripId y companyWallet' },
        { status: 400 }
      );
    }

    const trips = readTrips();
    const filtered = trips.filter(
      (t: any) => !(t.id === tripId && t.companyWallet === companyWallet)
    );

    writeTrips(filtered);

    console.log('✅ [API] Viaje eliminado');

    return NextResponse.json({
      success: true,
      remaining: filtered.length,
    });
  } catch (error: any) {
    console.error('❌ [API] Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
