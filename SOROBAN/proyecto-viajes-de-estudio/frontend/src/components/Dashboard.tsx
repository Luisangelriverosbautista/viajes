'use client';

import React, { useState, useEffect } from 'react';
import { WalletPaymentProcessor } from './WalletPaymentProcessor';

interface PasskeyData {
  credentialId: string;
  publicKey: string;
  accountAddress?: string;
  deviceInfo?: string;
  username?: string;
}

interface DashboardProps {
  passkeyData?: PasskeyData;
  onLogout: () => void;
  onAuthenticate?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ passkeyData, onLogout, onAuthenticate }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);

  useEffect(() => {
    // Cargar datos de localStorage para wallet
    const address = localStorage.getItem('userAddress');
    const wallet = localStorage.getItem('userWalletType') as string | null;
    if (address && wallet) {
      setUserAddress(address);
      setWalletType(wallet);
    }
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shortenString = (str: string, length: number = 20) => {
    if (str.length <= length) return str;
    return `${str.slice(0, length / 2)}...${str.slice(-length / 2)}`;
  };

  const handlePaymentSuccess = (transactionId: string) => {
    alert(`¡Pago exitoso! ID: ${transactionId}`);
    setShowPayment(false);
    setSelectedTrip(null);
  };

  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1501117716987-c8e1ecb9f0b0?w=1920&h=1080&fit=crop")',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 -z-10"></div>
      {/* Header */}
      <nav className="relative z-10 px-6 pt-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-gray-900 font-bold text-xl">✈️</span>
            </div>
            <span className="text-white font-bold text-xl">Viajes de Estudio MX</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-md border border-white/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Conectado</span>
            </div>
            
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg backdrop-blur-md border border-red-500/30 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 pt-8">
        <div className="mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              ¡Bienvenido, <span className="text-yellow-300">{passkeyData?.username || 'Estudiante'}!</span>
            </h1>
            <p className="text-white text-lg font-semibold">
              Tu cuenta de viajes de estudio está protegida con autenticación biométrica
            </p>
          </div>

          {/* Stats Cards - Wallet Info */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Identidad</h3>
                  <p className="text-green-400 text-sm">Verificada</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Seguridad</h3>
                  <p className="text-teal-400 text-sm">Biométrica Activa</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Blockchain</h3>
                  <p className="text-amber-400 text-sm">Stellar Testnet</p>
                </div>
              </div>
            </div>

            {userAddress && walletType && (
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Wallet</h3>
                    <p className="text-cyan-400 text-sm capitalize">{walletType}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wallet Connection Info */}
          {userAddress && walletType && (
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/50 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Información del Wallet</h2>
                <span className="text-xs bg-cyan-500/30 text-cyan-200 px-3 py-1 rounded-full font-semibold">
                  {walletType.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2">Dirección Conectada:</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-mono text-sm break-all">{shortenString(userAddress, 40)}</p>
                    <button
                      onClick={() => copyToClipboard(userAddress, 'address')}
                      className="text-cyan-400 hover:text-cyan-300 text-xs"
                    >
                      {copied === 'address' ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-2">Red Blockchain:</p>
                  <p className="text-white font-semibold capitalize">{walletType === 'stellar' ? 'Stellar Testnet' : walletType}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Passkey Information */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 12H9l-4 4H2l1.5-1.5A6 6 0 017.257 9.243L9 7h3l4-4h3l-1.5 1.5z" />
                </svg>
                <span>Información de Viajero</span>
              </h2>

              <div className="space-y-6">
                {/* Credential ID */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">ID de Credencial</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/10">
                      <code className="text-green-400 text-sm break-all">
                        {shortenString(passkeyData?.credentialId || '')}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(passkeyData?.credentialId || '', 'credential')}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 transition-colors"
                    >
                      {copied === 'credential' ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Public Key */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Clave Pública</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/10">
                      <code className="text-blue-400 text-sm break-all">
                        {shortenString(passkeyData?.publicKey || '')}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(passkeyData?.publicKey || '', 'publicKey')}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-colors"
                    >
                      {copied === 'publicKey' ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Address */}
                {passkeyData?.accountAddress && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Dirección de Cuenta</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/10">
                        <code className="text-yellow-400 text-sm break-all">
                          {shortenString(passkeyData?.accountAddress || '')}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(passkeyData?.accountAddress || '', 'address')}
                        className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg border border-yellow-500/30 transition-colors"
                      >
                        {copied === 'address' ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Acciones Disponibles</span>
              </h2>

              <div className="space-y-4">
                {/* Payment Section */}
                {userAddress && walletType && !showPayment && (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full group relative px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>💳 Realizar Pago con Wallet</span>
                  </button>
                )}

                {/* Show Payment Processor */}
                {showPayment && userAddress && walletType && (
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
                    <button
                      onClick={() => setShowPayment(false)}
                      className="mb-4 text-gray-400 hover:text-white font-semibold text-sm"
                    >
                      ← Volver
                    </button>
                    <WalletPaymentProcessor
                      walletAddress={userAddress}
                      walletType={walletType}
                      paymentData={{
                        amount: 2500,
                        currency: 'MXN',
                        description: 'Pago de viaje de estudio',
                        studentId: userAddress,
                      }}
                      onSuccess={handlePaymentSuccess}
                    />
                  </div>
                )}

                {/* Authenticate Button */}
                {onAuthenticate && !userAddress && (
                  <button
                    onClick={onAuthenticate}
                    className="w-full group relative px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-gray-900 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verificar Identidad</span>
                  </button>
                )}

                {/* Info Cards */}
                <div className="grid grid-cols-1 gap-4 mt-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-blue-300 font-medium text-sm">Información de Seguridad</h4>
                        <p className="text-gray-300 text-sm mt-1">
                          Tu identidad está protegida por biometría y nunca se comparte con terceros.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-green-300 font-medium text-sm">Transacciones Blockchain</h4>
                        <p className="text-gray-300 text-sm mt-1">
                          Todos los pagos se registran en Stellar Testnet de forma inmutable.
                        </p>
                      </div>
                    </div>
                  </div>

                  {userAddress && (
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <div>
                          <h4 className="text-cyan-300 font-medium text-sm">Wallet Conectado</h4>
                          <p className="text-gray-300 text-sm mt-1">
                            Puedes pagar directamente desde tu cartera de {walletType}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EBAS Button */}
                  <a
                    href="/ebas-dashboard"
                    className="block bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 rounded-lg p-6 text-center transform transition-all hover:scale-105 shadow-lg"
                  >
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="text-gray-900 font-bold text-lg mb-1">Mi Solicitud de Financiamiento</h4>
                    <p className="text-gray-900 text-sm font-medium">
                      Gestiona tu solicitud de financiamiento para viajes de estudio
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default Dashboard;