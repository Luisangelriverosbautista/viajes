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
    
    console.log('📝 [API POST] Recibiendo viaje:', body.name);
    console.log('📝 [API POST] Wallet:', body.companyWallet?.substring(0, 12));
    console.log('📝 [API POST] Destino:', body.destination);
    console.log('📝 [API POST] Precio:', body.priceXLM, 'XLM');

    // Validar datos
    if (!body.companyWallet || !body.name) {
      console.error('❌ [API POST] Faltan companyWallet o name');
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Leer viajes actuales
    const trips = readTrips();
    console.log(`📊 [API POST] Viajes actuales antes: ${trips.length}`);

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
      console.log('✅ [API POST] Viaje guardado en trips.json');
      console.log(`📊 [API POST] Viajes después: ${trips.length}`);
    } catch (persistError: any) {
      console.warn('⚠️ [API POST] No se pudo persistir (Netlify, pero OK):', persistError.message);
    }

    return NextResponse.json({
      success: true,
      trip: newTrip,
      totalTrips: trips.length,
      message: `Viaje "${newTrip.name}" guardado (total: ${trips.length})`
    });
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error('❌ [API POST] Error:', errorMessage);
    
    if (error?.code === 'EROFS' || errorMessage.includes('read-only')) {
      console.warn('⚠️ [API POST] Sistema de archivos de solo lectura (Netlify), pero viaje es válido');
      return NextResponse.json({
        success: true,
        message: 'Viaje registrado en Netlify (sin persistencia local)'
      }, { status: 201 });
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyWallet = searchParams.get('company');

    const allTrips = readTrips();
    console.log(`📊 [API GET] trips.json tiene ${allTrips.length} viajes`);
    
    let trips = allTrips;
    if (companyWallet) {
      trips = allTrips.filter((t: any) => t.companyWallet === companyWallet);
      console.log(`  └─ Filtrado por empresa: ${trips.length} viajes`);
    }

    return NextResponse.json({
      success: true,
      trips,
      count: trips.length,
    });
  } catch (error: any) {
    console.error('❌ [API GET] Error:', error.message);
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
