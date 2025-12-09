'use client';

import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function FreighterSetupBanner() {
  const [dismissed, setDismissed] = require('react').useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-950/95 border-b border-amber-700 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-100 mb-2">
              ⚙️ Configuración Requerida para Producción
            </h3>
            <div className="text-sm text-amber-200 space-y-1">
              <p>
                Esta es una instalación de demostración con Testnet. Antes de ir a producción:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">1.</span>
                  <span>Cambiar dirección del operador en <code className="bg-black/30 px-2 py-1 rounded text-xs">useFreighterWallet.ts</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">2.</span>
                  <span>Actualizar precios en XLM según cotización</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">3.</span>
                  <span>Ver: <code className="bg-black/30 px-2 py-1 rounded text-xs">FREIGHTER-INTEGRATION-GUIDE.md</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">4.</span>
                  <span>Ver: <code className="bg-black/30 px-2 py-1 rounded text-xs">CONFIGURATION.js</code></span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <a
                href="https://stellar.org/developers/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-amber-700 hover:bg-amber-600 px-3 py-1 rounded inline-flex items-center gap-1"
              >
                Crear Cuenta Testnet
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setDismissed(true)}
                className="text-sm text-amber-400 hover:text-amber-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
