/**
 * Login Page with Freighter Wallet Authentication
 * Enhanced authentication flow with Freighter wallet
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { account, freighterAvailable, isConnecting, connectWallet, error } = useWallet();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showFreighterWarning, setShowFreighterWarning] = useState(false);

  // Verificar estado inicial de Freighter
  useEffect(() => {
    setIsInitialized(true);
    if (!freighterAvailable && !isConnecting) {
      setShowFreighterWarning(true);
    }
  }, [freighterAvailable, isConnecting]);

  // Si ya está conectado, guardar sesión y redirigir
  useEffect(() => {
    if (account) {
      // Guardar sesión en localStorage
      localStorage.setItem('walletAddress', account.publicKey);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('loginTime', new Date().toISOString());
      
      // Pequeño delay para mostrar éxito
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  }, [account, router]);

  const handleConnectClick = async () => {
    if (!freighterAvailable) {
      router.push('/wallet-setup');
      return;
    }
    await connectWallet();
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop")',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 z-0"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-stellar to-cyan-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m5.506 0C15.009 17.799 16 14.517 16 11m-6-1a4 4 0 11-8 0 4 4 0 018 0zm0 0a4 4 0 110 8 4 4 0 010-8zm-7 4a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">¡Bienvenido!</h1>
          <p className="text-white font-semibold drop-shadow-md text-lg">
            Viajes de Estudio MX
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Success State - Connected */}
          {account && (
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-8 border border-green-400/40 shadow-xl text-center animate-in fade-in">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Sesión Iniciada!</h2>
              <p className="text-green-200 mb-4">Tu wallet está conectada correctamente</p>
              <p className="text-sm text-gray-300 break-all font-mono bg-black/30 rounded-lg p-3 mb-4">
                {account.publicKey.slice(0, 10)}...{account.publicKey.slice(-8)}
              </p>
              <p className="text-sm text-gray-300">Redirigiendo al dashboard...</p>
              <div className="mt-4">
                <Loader className="w-5 h-5 animate-spin mx-auto text-stellar" />
              </div>
            </div>
          )}

          {/* Warning - Freighter Not Available */}
          {!account && showFreighterWarning && !isConnecting && (
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-8 border border-amber-400/40 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Freighter No Detectada</h3>
                  <p className="text-gray-200 mb-4">
                    Para iniciar sesión necesitas tener instalada la extensión Freighter. 
                    Es una wallet segura que protege tus activos en Stellar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/wallet-setup')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Configurar Freighter
              </button>
            </div>
          )}

          {/* Main Login Section */}
          {!account && (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Conectar con Freighter
              </h2>
              <p className="text-gray-300 text-sm mb-6">
                Inicia sesión de forma segura usando tu wallet Freighter. Tu dirección será tu identificador único.
              </p>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnectClick}
                disabled={isConnecting}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg ${
                  isConnecting
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : freighterAvailable
                    ? 'bg-gradient-to-r from-stellar to-cyan-500 hover:from-stellar/90 hover:to-cyan-600 text-white shadow-lg hover:shadow-stellar/50'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg'
                }`}
              >
                {isConnecting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Conectando...
                  </>
                ) : freighterAvailable ? (
                  <>
                    <Wallet className="w-5 h-5" />
                    Conectar Wallet Freighter
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Instalar Freighter
                  </>
                )}
              </button>

              {/* Info Box */}
              <div className="mt-6 bg-blue-500/20 backdrop-blur-md rounded-xl p-4 border border-blue-300/40">
                <p className="text-blue-200 text-sm font-semibold mb-2">💡 ¿Cómo funciona?</p>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>✓ Conecta tu wallet Freighter</li>
                  <li>✓ Tu dirección será tu cuenta</li>
                  <li>✓ Paga viajes directamente desde tu wallet</li>
                  <li>✓ Sin contraseñas, 100% seguro</li>
                </ul>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/40 transition-colors">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-white font-bold text-sm mb-1">Seguro</h3>
              <p className="text-gray-300 text-xs">Autenticación descentralizada con tu wallet</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/40 transition-colors">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-white font-bold text-sm mb-1">Instantáneo</h3>
              <p className="text-gray-300 text-xs">Acceso inmediato sin verificaciones</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/40 transition-colors">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="text-white font-bold text-sm mb-1">Pagos XLM</h3>
              <p className="text-gray-300 text-xs">Paga viajes con Stellar XLM</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-3">
            <p className="text-gray-300 text-sm">
              ¿Primera vez aquí?{' '}
              <Link href="/wallet-setup" className="text-stellar hover:text-cyan-400 font-semibold">
                Configurar Freighter
              </Link>
            </p>
            <p className="text-gray-400 text-xs">
              Al conectar tu wallet aceptas nuestros{' '}
              <Link href="/terms" className="text-stellar hover:text-cyan-400">
                términos de servicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
