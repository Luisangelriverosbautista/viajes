'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { AlertCircle, Loader, CheckCircle } from 'lucide-react';
import useFreighterWallet from '@/hooks/useFreighterWallet';

// Tipos del paquete
export interface TravelPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  priceXLM: number;
  icon: string;
  description: string;
  highlights: string[];
  benefits: string[];
  monthlyPayment: number;
  loanTerm: number;
}

interface TravelPackagesWithPaymentProps {
  onSelectPackage: (pkg: TravelPackage) => void;
  onBack: () => void;
}

const packages: TravelPackage[] = [
  {
    id: 'basic',
    name: 'Paquete Básico',
    duration: '5 días',
    price: 3500,
    priceXLM: 35, // 1 USD ≈ 0.01 XLM (aproximado)
    icon: '🎒',
    description: 'Experiencia educativa en la Ciudad de México con hospedaje compartido',
    highlights: [
      '5 noches en hostal/albergue compartido',
      'Visitas a museos y sitios culturales',
      'Desayunos incluidos',
      'Transporte interno en autobus escolar',
    ],
    benefits: [
      '🚌 Autobús escolar incluido',
      '🍽️ Desayunos diarios',
      '🏛️ 3 atracciones turísticas',
      '👥 Grupo de 20-30 estudiantes',
    ],
    monthlyPayment: 175,
    loanTerm: 24,
  },
  {
    id: 'standard',
    name: 'Paquete Estándar',
    duration: '7 días',
    price: 5200,
    priceXLM: 52,
    icon: '✈️',
    description: 'Viaje a Oaxaca con experiencia cultural inmersiva',
    highlights: [
      '7 noches en hotel 3 estrellas',
      'Tours arqueológicos y gastronómicos',
      'Desayunos y comidas incluidas',
      'Autobús privado + vuelos internos',
    ],
    benefits: [
      '✈️ Vuelos internos incluidos',
      '🚌 Autobús privado exclusivo',
      '🍽️ Desayunos + 5 comidas',
      '🏨 Hotel 3 estrellas',
      '🎭 Experiencias culturales',
    ],
    monthlyPayment: 260,
    loanTerm: 24,
  },
  {
    id: 'premium',
    name: 'Paquete Premium',
    duration: '10 días',
    price: 7800,
    priceXLM: 78,
    icon: '⭐',
    description: 'Ruta completa por Yucatán: arqueología y playas',
    highlights: [
      '10 noches en hoteles 4 estrellas',
      'Visitas a Chichén Itzá y cenotes',
      'All-inclusive: desayunos, comidas, cenas',
      'Transporte aéreo + autobús de lujo',
    ],
    benefits: [
      '🛫 Vuelos internos directos',
      '🚐 Autobús de lujo con aire acondicionado',
      '🍽️ All-inclusive (todas las comidas)',
      '🏖️ Día libre en playa',
      '🏛️ Visitas guiadas profesionales',
      '📸 Seguro de viaje incluido',
    ],
    monthlyPayment: 390,
    loanTerm: 24,
  },
  {
    id: 'deluxe',
    name: 'Paquete Deluxe',
    duration: '12 días',
    price: 10500,
    priceXLM: 105,
    icon: '👑',
    description: 'Aventura por Quintana Roo: cenotes, isla Mujeres y parques',
    highlights: [
      '12 noches en resorts todo incluido',
      'Snorkel en cenotes y arrecife',
      'Día en Isla Mujeres',
      'Aventura en parques naturales',
    ],
    benefits: [
      '✈️ Vuelos + traslados premium',
      '🚤 Excursiones en lancha privada',
      '🏊 Snorkel y actividades acuáticas',
      '🏨 Resort 5 estrellas todo incluido',
      '🎁 Paquete de bienvenida',
      '📱 Asistencia 24/7 en el destino',
      '💳 Seguro médico internacional',
    ],
    monthlyPayment: 525,
    loanTerm: 24,
  },
  {
    id: 'elite',
    name: 'Paquete Elite',
    duration: '14 días',
    price: 13200,
    priceXLM: 132,
    icon: '💎',
    description: 'Experiencia de intercambio académico en Baja California',
    highlights: [
      '14 noches en hospedaje premium',
      'Seminarios académicos en universidades',
      'Excursiones a Baja California y playas',
      'Ruta gastronómica exclusiva',
    ],
    benefits: [
      '🎓 Seminarios en universidades reconocidas',
      '✈️ Vuelos + hospedaje 5 estrellas',
      '🚁 Tour en helicóptero (opcional)',
      '🍷 Experiencia gastronómica de lujo',
      '📚 Certificados académicos',
      '🎯 Networking con profesionales',
      '💼 Mentoría personalizada',
      '🌍 Acceso a red global de estudiantes',
    ],
    monthlyPayment: 660,
    loanTerm: 24,
  },
];

export default function TravelPackagesWithPayment({
  onSelectPackage,
  onBack,
}: TravelPackagesWithPaymentProps) {
  const { account } = useWallet();
  const { buyTrip } = useFreighterWallet();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{
    hash: string;
    explorerUrl: string;
  } | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const handleSelect = (pkg: TravelPackage) => {
    setSelectedId(pkg.id);
    setTransactionResult(null);
    setTransactionError(null);
  };

  const handleBuyTrip = async (pkg: TravelPackage) => {
    if (!account) {
      setTransactionError('Debes conectar una wallet primero');
      return;
    }

    setProcessingId(pkg.id);
    setTransactionError(null);

    try {
      const result = await buyTrip(pkg);
      setTransactionResult(result);
      setTransactionError(null);
      // Guardar compra en localStorage
      const purchases = JSON.parse(localStorage.getItem('trip_purchases') || '[]');
      purchases.push({
        tripId: pkg.id,
        tripName: pkg.name,
        amount: pkg.priceXLM,
        hash: result.hash,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('trip_purchases', JSON.stringify(purchases));
    } catch (err: any) {
      setTransactionError(err.message || 'Error procesando el pago');
      setTransactionResult(null);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Elige tu Paquete de Viaje
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Paga con XLM desde tu wallet de Freighter. Las transacciones se registran en Stellar Testnet.
          </p>
        </div>

        {/* Wallet Status */}
        {account && (
          <div className="mb-8 p-4 rounded-lg bg-stellar/10 border border-stellar/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Wallet conectada</p>
                <p className="text-stellar font-semibold">
                  {account.publicKey.slice(0, 8)}...{account.publicKey.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Saldo disponible</p>
                <p className="text-stellar font-semibold">{account.balance.toFixed(2)} XLM</p>
              </div>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedId === pkg.id
                  ? 'ring-4 ring-stellar shadow-2xl scale-105'
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />

              {pkg.id === 'deluxe' || pkg.id === 'elite' ? (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full text-xs font-bold text-white">
                  🔥 Popular
                </div>
              ) : null}

              <div className="relative p-6">
                <div className="mb-4">
                  <div className="text-5xl mb-3">{pkg.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-sm text-slate-400">{pkg.duration}</p>
                </div>

                <div className="mb-4">
                  <div className="text-stellar font-bold text-lg">{pkg.priceXLM} XLM</div>
                  <div className="text-xs text-slate-400">${pkg.price.toLocaleString()}</div>
                </div>

                <p className="text-sm text-slate-300 mb-4">{pkg.description}</p>

                <div className="space-y-2 mb-4">
                  {pkg.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-stellar mt-0.5">✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleSelect(pkg);
                  }}
                  className={`w-full py-2 rounded-lg font-bold transition-all ${
                    selectedId === pkg.id
                      ? 'bg-stellar text-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {selectedId === pkg.id ? '✓ Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Details Section for Selected */}
        {selectedId && (
          <div className="mt-12 animate-fadeIn">
            {packages
              .filter(p => p.id === selectedId)
              .map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-gradient-to-r from-stellar to-stellar/80 rounded-2xl p-8 text-white"
                >
                  <h2 className="text-3xl font-bold mb-6">Beneficios incluidos en {pkg.name}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {pkg.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{benefit.split(' ')[0]}</span>
                        <div>
                          <p className="font-semibold">{benefit.substring(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Section */}
                  <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4">💳 Información de Pago</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Monto a pagar:</span>
                        <span className="font-bold text-xl">{pkg.priceXLM} XLM</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/80">Equivalente a:</span>
                        <span className="text-white/80">${pkg.price.toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Status */}
                  {transactionResult && (
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-6 mb-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-green-400 mb-2">✓ Pago Exitoso</p>
                          <p className="text-sm text-green-300 mb-3">
                            Tu pago ha sido registrado en Stellar Testnet
                          </p>
                          <a
                            href={transactionResult.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline text-green-300 hover:text-green-200"
                          >
                            Ver transacción en Stellar Expert →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Status */}
                  {transactionError && (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-red-400 mb-1">Error en la transacción</p>
                          <p className="text-sm text-red-300">{transactionError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4">📋 Términos y Condiciones</h3>
                    <ul className="space-y-2 text-sm text-white/90">
                      <li>✓ Pago único de {pkg.priceXLM} XLM</li>
                      <li>✓ Transacción registrada en Stellar Testnet</li>
                      <li>✓ Seguro de viaje y cobertura médica incluidos</li>
                      <li>✓ Cancelación gratuita hasta 30 días antes del viaje</li>
                      <li>✓ Asistencia dedicada de asesor académico</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-bold disabled:opacity-50"
                      disabled={processingId === pkg.id}
                    >
                      Cambiar Paquete
                    </button>
                    {!account ? (
                      <button
                        disabled
                        className="flex-1 px-6 py-3 bg-slate-400 text-white rounded-lg cursor-not-allowed font-bold opacity-50"
                      >
                        Conecta Wallet primero
                      </button>
                    ) : transactionResult ? (
                      <button
                        onClick={() => {
                          onSelectPackage(pkg);
                          setTransactionResult(null);
                        }}
                        className="flex-1 px-6 py-3 bg-white text-stellar rounded-lg hover:bg-slate-100 transition font-bold"
                      >
                        Continuar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyTrip(pkg)}
                        disabled={processingId === pkg.id || account.balance < pkg.priceXLM}
                        className={`flex-1 px-6 py-3 rounded-lg transition font-bold flex items-center justify-center gap-2 ${
                          processingId === pkg.id
                            ? 'bg-slate-500 text-white'
                            : account.balance < pkg.priceXLM
                              ? 'bg-slate-500 text-white cursor-not-allowed'
                              : 'bg-white text-stellar hover:bg-slate-100'
                        }`}
                      >
                        {processingId === pkg.id && (
                          <Loader className="w-4 h-4 animate-spin" />
                        )}
                        {processingId === pkg.id
                          ? 'Procesando...'
                          : account.balance < pkg.priceXLM
                            ? 'Saldo insuficiente'
                            : 'Pagar con Freighter'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition font-bold"
          >
            ← Volver a Elegir Empresa
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
