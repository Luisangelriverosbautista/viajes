'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

interface StorageData {
  user_registry: any[];
  current_user: any;
  company_trips: Record<string, any[]>;
}

export default function DebugRegistryPage() {
  const [data, setData] = useState<StorageData>({
    user_registry: [],
    current_user: null,
    company_trips: {},
  });
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshData = () => {
    try {
      // Read user_registry
      const registryData = localStorage.getItem('user_registry');
      const registry = registryData ? JSON.parse(registryData) : [];

      // Read current_user
      const currentData = localStorage.getItem('current_user');
      const current = currentData ? JSON.parse(currentData) : null;

      // Read all company_trips_* keys
      const companyTrips: Record<string, any[]> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('company_trips_')) {
          const tripsData = localStorage.getItem(key);
          if (tripsData) {
            companyTrips[key] = JSON.parse(tripsData);
          }
        }
      }

      setData({
        user_registry: registry,
        current_user: current,
        company_trips: companyTrips,
      });

      setRefreshCount(c => c + 1);
    } catch (error) {
      console.error('Error reading storage:', error);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">📊 Registry Debug</h1>
          <p className="text-gray-400">Refreshes every second (count: {refreshCount})</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Registry */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              👥 user_registry ({data.user_registry.length} users)
            </h2>
            {data.user_registry.length === 0 ? (
              <p className="text-gray-500">Empty registry</p>
            ) : (
              <div className="space-y-3">
                {data.user_registry.map((user, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded border border-slate-600">
                    <p className="text-green-400 font-bold">
                      {user.companyName || user.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Type: <span className="text-yellow-400">{user.userType}</span>
                    </p>
                    <p className="text-gray-400 text-sm break-all">
                      Wallet: <span className="text-blue-400">{user.publicKey.substring(0, 16)}...</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current User */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">👤 current_user</h2>
            {data.current_user ? (
              <div className="bg-slate-900 p-4 rounded border border-slate-600">
                <p className="text-green-400 font-bold mb-2">
                  {data.current_user.companyName || data.current_user.name}
                </p>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>Type: <span className="text-yellow-400">{data.current_user.userType}</span></p>
                  <p>Email: <span className="text-gray-400">{data.current_user.email}</span></p>
                  <p className="break-all">Wallet: <span className="text-blue-400">{data.current_user.publicKey}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No user logged in</p>
            )}
          </div>

          {/* Company Trips */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">
              ✈️ Company Trips ({Object.keys(data.company_trips).length} companies)
            </h2>
            {Object.keys(data.company_trips).length === 0 ? (
              <p className="text-gray-500">No trips found</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.company_trips).map(([key, trips]) => (
                  <div key={key} className="bg-slate-900 p-4 rounded border border-slate-600">
                    <p className="text-cyan-400 font-bold mb-2">
                      {key.replace('company_trips_', '')}
                    </p>
                    <p className="text-gray-400 text-sm mb-3">
                      {(trips as any[]).length} viaje(s)
                    </p>
                    {(trips as any[]).map((trip, idx) => (
                      <div key={idx} className="bg-slate-800 p-2 rounded ml-2 mb-2 text-sm">
                        <p className="text-green-300 font-semibold">{trip.name}</p>
                        <p className="text-gray-400">{trip.destination} • {trip.priceXLM} XLM</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-green-600 bg-green-900/20">
            <h2 className="text-2xl font-bold text-green-400 mb-4">✅ Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-900 p-4 rounded">
                <p className="text-4xl font-bold text-cyan-400">{data.user_registry.length}</p>
                <p className="text-gray-400">Total Users</p>
              </div>
              <div className="bg-slate-900 p-4 rounded">
                <p className="text-4xl font-bold text-orange-400">
                  {Object.keys(data.company_trips).length}
                </p>
                <p className="text-gray-400">Companies</p>
              </div>
              <div className="bg-slate-900 p-4 rounded">
                <p className="text-4xl font-bold text-yellow-400">
                  {Object.values(data.company_trips).reduce((sum, trips) => sum + (trips as any[]).length, 0)}
                </p>
                <p className="text-gray-400">Total Trips</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





