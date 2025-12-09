'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

export default function TestStoragePage() {
  const [storageData, setStorageData] = useState<any>({});

  useEffect(() => {
    const data: any = {};

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        } catch (error) {
          console.error(`Error reading key ${key}:`, error);
        }
      }
    }

    setStorageData(data);

    // Also log to console
    console.log('📦 LocalStorage Debug:');
    Object.entries(data).forEach(([key, value]: any) => {
      if (key.includes('user') || key.includes('register')) {
        console.log(`${key}:`, value);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">LocalStorage Debug</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* User Registry */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">user_registry</h2>
          <pre className="bg-slate-900 p-4 rounded text-green-400 text-sm overflow-auto max-h-64">
            {JSON.stringify(storageData['user_registry'], null, 2)}
          </pre>
        </div>

        {/* Registered Users */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">registered_users</h2>
          <pre className="bg-slate-900 p-4 rounded text-cyan-400 text-sm overflow-auto max-h-64">
            {JSON.stringify(storageData['registered_users'], null, 2)}
          </pre>
        </div>

        {/* Current User */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">current_user</h2>
          <pre className="bg-slate-900 p-4 rounded text-yellow-400 text-sm overflow-auto max-h-64">
            {JSON.stringify(storageData['current_user'], null, 2)}
          </pre>
        </div>

        {/* Company Trips */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Company Trips (All Keys)</h2>
          <div className="space-y-4">
            {Object.entries(storageData)
              .filter(([key]) => key.startsWith('company_trips_'))
              .map(([key, value]: any) => (
                <div key={key} className="bg-slate-900 p-4 rounded">
                  <p className="text-purple-400 font-bold mb-2">{key}</p>
                  <pre className="text-sm text-gray-300 overflow-auto max-h-64">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
          <ul className="text-white space-y-2">
            <li>
              user_registry count:{' '}
              <span className="font-bold text-cyan-400">
                {Array.isArray(storageData['user_registry'])
                  ? storageData['user_registry'].length
                  : 0}
              </span>
            </li>
            <li>
              registered_users count:{' '}
              <span className="font-bold text-cyan-400">
                {Array.isArray(storageData['registered_users'])
                  ? storageData['registered_users'].length
                  : 0}
              </span>
            </li>
            <li>
              company_trips_* keys:{' '}
              <span className="font-bold text-purple-400">
                {
                  Object.keys(storageData).filter(k => k.startsWith('company_trips_'))
                    .length
                }
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}





