'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState({
    freighterWindow: false,
    freighterLowercase: false,
    freighterExtensionEnabled: false,
    windowKeys: [] as string[],
    console: [] as string[],
  });

  useEffect(() => {
    const logs: string[] = [];

    console.log('🔍 Iniciando diagnóstico de Freighter...');
    logs.push('🔍 Iniciando diagnóstico de Freighter...');

    // Verificar window.Freighter
    const hasFreighterUppercase = !!(window as any).Freighter;
    const hasFreighterLowercase = !!(window as any).freighter;

    console.log(`window.Freighter: ${hasFreighterUppercase ? '✅ Encontrado' : '❌ No encontrado'}`);
    console.log(`window.freighter: ${hasFreighterLowercase ? '✅ Encontrado' : '❌ No encontrado'}`);
    
    logs.push(`window.Freighter: ${hasFreighterUppercase ? '✅ Encontrado' : '❌ No encontrado'}`);
    logs.push(`window.freighter: ${hasFreighterLowercase ? '✅ Encontrado' : '❌ No encontrado'}`);

    // Buscar todas las keys relacionadas
    const freightRelated = Object.keys(window as any).filter(
      k => k.toLowerCase().includes('stellar') || k.toLowerCase().includes('freight') || k.toLowerCase().includes('wallet')
    );

    console.log(`Keys en window relacionadas: ${freightRelated.length > 0 ? freightRelated.join(', ') : 'Ninguna'}`);
    logs.push(`Keys en window relacionadas: ${freightRelated.length > 0 ? freightRelated.join(', ') : 'Ninguna'}`);

    // Verificar si hay métodos de Freighter
    if (hasFreighterUppercase) {
      const methods = Object.keys((window as any).Freighter).slice(0, 10);
      console.log(`Métodos disponibles en window.Freighter: ${methods.join(', ')}`);
      logs.push(`Métodos disponibles en window.Freighter: ${methods.join(', ')}`);
    }

    setDiagnostics({
      freighterWindow: hasFreighterUppercase || hasFreighterLowercase,
      freighterLowercase: hasFreighterLowercase,
      freighterExtensionEnabled: hasFreighterUppercase,
      windowKeys: freightRelated,
      console: logs,
    });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔍 Diagnóstico de Freighter</h1>
          <p className="text-purple-200">Verifica si Freighter está correctamente instalada</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Detectada */}
          <div className={`p-6 rounded-lg border-2 ${
            diagnostics.freighterWindow 
              ? 'border-green-500 bg-green-500/10' 
              : 'border-red-500 bg-red-500/10'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {diagnostics.freighterWindow ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
              <h3 className={`font-bold ${diagnostics.freighterWindow ? 'text-green-400' : 'text-red-400'}`}>
                Freighter Detectada
              </h3>
            </div>
            <p className="text-sm text-slate-300">
              {diagnostics.freighterWindow 
                ? '✅ La extensión está inyectada en window'
                : '❌ Freighter no se detecta en window'}
            </p>
          </div>

          {/* Card 2: Mayúscula */}
          <div className={`p-6 rounded-lg border-2 ${
            diagnostics.freighterExtensionEnabled 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-amber-500 bg-amber-500/10'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {diagnostics.freighterExtensionEnabled ? (
                <CheckCircle className="w-6 h-6 text-blue-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-500" />
              )}
              <h3 className={`font-bold ${diagnostics.freighterExtensionEnabled ? 'text-blue-400' : 'text-amber-400'}`}>
                window.Freighter
              </h3>
            </div>
            <p className="text-sm text-slate-300">
              {diagnostics.freighterExtensionEnabled 
                ? '✅ API disponible' 
                : '❌ No disponible'}
            </p>
          </div>

          {/* Card 3: Minúscula */}
          <div className={`p-6 rounded-lg border-2 ${
            diagnostics.freighterLowercase 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-slate-600 bg-slate-600/10'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {diagnostics.freighterLowercase ? (
                <CheckCircle className="w-6 h-6 text-purple-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-slate-400" />
              )}
              <h3 className={`font-bold ${diagnostics.freighterLowercase ? 'text-purple-400' : 'text-slate-400'}`}>
                window.freighter
              </h3>
            </div>
            <p className="text-sm text-slate-300">
              {diagnostics.freighterLowercase 
                ? '✅ Alias disponible'
                : '❌ No disponible'}
            </p>
          </div>
        </div>

        {/* Solutions */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🛠️ Qué hacer</h2>

          {diagnostics.freighterWindow ? (
            <div className="space-y-3 text-slate-300">
              <p>✅ <strong>¡Excelente!</strong> Freighter está correctamente instalada.</p>
              <p>Ahora puedes volver a <a href="/register" className="text-purple-400 hover:text-purple-300 underline">Registro</a> e intentar conectar de nuevo.</p>
            </div>
          ) : (
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="font-bold text-white mb-2">Paso 1: Verificar instalación</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Abre <code className="bg-slate-900 px-2 py-1 rounded">chrome://extensions</code></li>
                  <li>Busca "Freighter" en la lista</li>
                  <li>Si no está, <a href="https://freighter.app" target="_blank" className="text-purple-400 hover:text-purple-300 underline">instálala aquí</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">Paso 2: Verificar habilitación</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Si Freighter está en la lista, asegúrate de que el toggle esté <strong>activado</strong></li>
                  <li>Recarga la página (F5 o Ctrl+R)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">Paso 3: Verificar dominios permitidos</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Haz click en Freighter en chrome://extensions</li>
                  <li>Ve a "Detalles"</li>
                  <li>Asegúrate de que tiene permiso para <code className="bg-slate-900 px-2 py-1 rounded">localhost:3002</code></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Info */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-600/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Información Técnica</h2>

          {/* Window Keys */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">
              Keys en window relacionadas ({diagnostics.windowKeys.length}):
            </h3>
            {diagnostics.windowKeys.length > 0 ? (
              <div className="bg-slate-900/50 rounded-lg p-4 overflow-auto">
                <code className="text-sm text-amber-300">
                  {diagnostics.windowKeys.join(', ')}
                </code>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No hay keys relacionadas encontradas</p>
            )}
          </div>

          {/* Console Output */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Salida del diagnóstico:</h3>
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 max-h-96 overflow-auto">
              {diagnostics.console.map((line, idx) => (
                <div key={idx} className="text-sm text-slate-300 font-mono">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            ← Volver a Registro
          </a>
        </div>
      </div>
    </div>
  );
}





