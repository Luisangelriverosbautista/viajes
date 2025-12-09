'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

export default function InspectStoragePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const userRegistry = localStorage.getItem('user_registry');
      const parsed = userRegistry ? JSON.parse(userRegistry) : null;

      setData({
        userRegistry: {
          raw: userRegistry,
          count: parsed ? parsed.length : 0,
          users: parsed
            ? parsed.map((u: any) => ({
                name: u.companyName || u.name,
                type: u.userType,
                wallet: u.publicKey,
              }))
            : [],
        },
      });
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8 font-mono text-sm">
      <h1 className="text-3xl font-bold text-white mb-8">🔍 Inspeccionar Storage</h1>

      {error && <div className="text-red-400 mb-4">Error: {error}</div>}

      {data && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-green-400 mb-2">user_registry</h2>
            <div className="text-yellow-400 mb-2">
              Total de usuarios: <span className="text-2xl font-bold">{data.userRegistry.count}</span>
            </div>
            <div className="space-y-2">
              {data.userRegistry.users.map((u: any, i: number) => (
                <div key={i} className="bg-slate-700 p-3 rounded">
                  {i + 1}. <span className="text-cyan-400">{u.name}</span> ({u.type}) - {u.wallet.substring(0, 10)}...
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-purple-400 mb-2">Raw JSON:</h3>
            <pre className="bg-slate-900 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(data.userRegistry.raw, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}





