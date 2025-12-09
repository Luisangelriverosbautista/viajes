'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useUserRegistry } from '@/hooks/useUserRegistry';
import { Play, RotateCcw, Eye, AlertCircle } from 'lucide-react';

export default function TestRegistrationPage() {
  const { registerUser, getAllUsers } = useUserRegistry();
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testStep, setTestStep] = useState<'idle' | 'registering-1' | 'registering-2' | 'registering-3' | 'checking'>('idle');

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    console.clear();
  };

  const checkStorage = () => {
    addLog('\n🔍 === VERIFICANDO STORAGE ===');
    const userRegistry = localStorage.getItem('user_registry');
    if (!userRegistry) {
      addLog('❌ user_registry está VACÍO o NULL');
      return;
    }
    try {
      const parsed = JSON.parse(userRegistry);
      addLog(`✅ user_registry contiene ${parsed.length} usuarios`);
      parsed.forEach((user: any, idx: number) => {
        addLog(`  ${idx + 1}. ${user.companyName || user.name} (${user.userType})`);
      });
    } catch (e) {
      addLog('❌ JSON inválido en user_registry');
    }
  };

  const runTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTestStep('registering-1');
    setLogs([]);

    try {
      addLog('🟦 === TEST DE REGISTRO DE 3 USUARIOS ===\n');

      // Usuario 1: Ant (Empresa)
      addLog('👤 USUARIO 1: Registrando "Ant" (Empresa)...');
      setTestStep('registering-1');
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await registerUser({
          publicKey: 'GAP' + Math.random().toString(36).substring(2, 15).toUpperCase(),
          userType: 'company',
          name: 'Ant',
          companyName: 'Ant Viajes',
          businessLicense: 'BIZ-ANT-001',
          email: 'ant@test.com',
          verified: false,
          status: 'active',
        });
        addLog('✅ Ant registrado correctamente\n');
      } catch (e: any) {
        addLog(`❌ Error registrando Ant: ${e.message}\n`);
      }

      // Usuario 2: Tono (Empresa)
      addLog('👤 USUARIO 2: Registrando "Tono" (Empresa)...');
      setTestStep('registering-2');
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await registerUser({
          publicKey: 'GAT' + Math.random().toString(36).substring(2, 15).toUpperCase(),
          userType: 'company',
          name: 'Tono',
          companyName: 'Tono Companic',
          businessLicense: 'BIZ-TONO-001',
          email: 'tono@test.com',
          verified: false,
          status: 'active',
        });
        addLog('✅ Tono registrado correctamente\n');
      } catch (e: any) {
        addLog(`❌ Error registrando Tono: ${e.message}\n`);
      }

      // Usuario 3: Kevin (Cliente)
      addLog('👤 USUARIO 3: Registrando "Kevin" (Cliente)...');
      setTestStep('registering-3');
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await registerUser({
          publicKey: 'GAK' + Math.random().toString(36).substring(2, 15).toUpperCase(),
          userType: 'client',
          name: 'Kevin',
          email: 'kevin@test.com',
          school: 'MIT',
          studentId: 'MIT-123',
          verified: false,
          status: 'active',
        });
        addLog('✅ Kevin registrado correctamente\n');
      } catch (e: any) {
        addLog(`❌ Error registrando Kevin: ${e.message}\n`);
      }

      // Verificación final
      addLog('\n🔍 === VERIFICACIÓN FINAL ===');
      setTestStep('checking');
      await new Promise((resolve) => setTimeout(resolve, 500));

      checkStorage();

      const allUsers = await getAllUsers();
      addLog(`\n📊 getAllUsers() retorna: ${allUsers.length} usuarios`);

      if (allUsers.length === 3) {
        addLog('\n🎉 ✅ ¡ÉXITO! Los 3 usuarios se guardaron correctamente');
      } else if (allUsers.length === 2) {
        addLog('\n⚠️ ⚠️ PROBLEMA: Solo 2 usuarios se guardaron, Tono está FALTANDO');
      } else {
        addLog(`\n❌ ERROR: Se esperaban 3 usuarios pero hay ${allUsers.length}`);
      }
    } finally {
      setIsRunning(false);
      setTestStep('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧪 Test de Registro</h1>
          <p className="text-purple-200">Prueba automática de registro de 3 usuarios</p>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 flex gap-3">
          <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-blue-200">
            Este test registra 3 usuarios de prueba (Ant, Tono, Kevin) y verifica si todos se guardan correctamente en localStorage. Si Tono desaparece, tenemos un problema de persistencia.
          </div>
        </div>

        {/* Controles */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={runTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition font-semibold"
          >
            <Play size={20} /> {isRunning ? 'Ejecutando...' : 'Ejecutar Test'}
          </button>

          <button
            onClick={checkStorage}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition font-semibold"
          >
            <Eye size={20} /> Verificar Ahora
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              clearLogs();
              addLog('✅ localStorage.clear() ejecutado');
            }}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg transition font-semibold"
          >
            <RotateCcw size={20} /> Limpiar Storage
          </button>

          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
          >
            Limpiar Logs
          </button>
        </div>

        {/* Estado */}
        {isRunning && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-200">
                {testStep === 'registering-1'
                  ? 'Registrando Ant...'
                  : testStep === 'registering-2'
                  ? 'Registrando Tono...'
                  : testStep === 'registering-3'
                  ? 'Registrando Kevin...'
                  : 'Verificando...'}
              </span>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 font-mono text-xs">
          <div className="max-h-96 overflow-auto space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-500">Haz clic en "Ejecutar Test" para comenzar...</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('✅')
                      ? 'text-green-400'
                      : log.includes('❌')
                      ? 'text-red-400'
                      : log.includes('🎉')
                      ? 'text-yellow-400'
                      : log.includes('===')
                      ? 'text-purple-400 font-bold'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





