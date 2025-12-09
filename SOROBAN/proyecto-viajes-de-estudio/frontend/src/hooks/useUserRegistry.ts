/**
 * Hook para gestionar el registro de usuarios en el sistema
 * Vincula wallet con información de usuario (Cliente o Empresa)
 */

import { useCallback } from 'react';

export type UserType = 'client' | 'company';

export interface UserRegistration {
  id: string;
  publicKey: string;
  userType: UserType;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  // Para empresas
  companyName?: string;
  businessLicense?: string;
  bankAccount?: string;
  // Para clientes
  studentId?: string;
  school?: string;
  // Estado
  verified: boolean;
  status: 'active' | 'inactive' | 'suspended';
}

/**
 * Lee user_registry DIRECTAMENTE de localStorage
 * Esta función NUNCA depende de otro estado y siempre lee lo más actual
 */
const readUserRegistry = (): UserRegistration[] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem('user_registry');
    if (!data) return [];
    
    return JSON.parse(data);
  } catch (e) {
    console.error('[REGISTRY] Error leyendo:', e);
    return [];
  }
};

/**
 * Escribe user_registry DIRECTAMENTE en localStorage
 * NUNCA falla silenciosamente - lanza error si hay problema
 */
const writeUserRegistry = (users: UserRegistration[]): void => {
  if (typeof window === 'undefined') return;
  
  const json = JSON.stringify(users);
  localStorage.setItem('user_registry', json);
  
  // Verificar inmediatamente que se escribió
  const verify = localStorage.getItem('user_registry');
  if (!verify) {
    throw new Error('localStorage write verification failed');
  }
  
  const verifyCount = JSON.parse(verify).length;
  if (verifyCount !== users.length) {
    throw new Error(`Write count mismatch: expected ${users.length}, got ${verifyCount}`);
  }
};

export const useUserRegistry = () => {
  /**
   * Registra un nuevo usuario en el sistema
   */
  const registerUser = useCallback(
    async (data: Omit<UserRegistration, 'id' | 'registrationDate'>) => {
      try {
        console.log('\n🟦 === INICIANDO REGISTRO ===');
        console.log('📥 Datos recibidos:', data);

        // Llamar a la API en lugar de guardar en localStorage
        console.log('\n1️⃣ ENVIANDO A API...');
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            verified: data.verified ?? false,
            status: data.status ?? 'active',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error registrando en API');
        }

        const result = await response.json();
        const newUser = result.user;

        console.log('✅ Usuario registrado en API');
        console.log(`📊 Total usuarios en servidor: ${result.totalUsers}`);

        // Guardar en localStorage local también (para usar en la sesión actual)
        console.log('\n2️⃣ GUARDANDO EN SESIÓN LOCAL...');
        localStorage.setItem('current_user', JSON.stringify(newUser));
        localStorage.setItem('user_wallet', data.publicKey);
        localStorage.setItem('user_type', data.userType);
        console.log('✅ Datos de sesión guardados');

        console.log('✅ REGISTRO COMPLETADO EXITOSAMENTE');
        console.log('🟩 === FIN REGISTRO ===\n');

        return newUser;
      } catch (error: any) {
        console.error('❌ Error registrando usuario:', error.message);
        throw error;
      }
    },
    []
  );

  /**
   * Obtiene todos los usuarios registrados (desde la API/Soroban)
   */
  const getAllUsers = useCallback(async (): Promise<UserRegistration[]> => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Error obteniendo usuarios');
      
      const data = await response.json();
      const users = data.users || [];
      
      console.log('📊 [REGISTRY] getAllUsers() retornando:', users.length, 'usuarios');
      if (users.length > 0) {
        console.log('📊 [REGISTRY] Nombres:', users.map((u: any) => u.companyName || u.name).join(', '));
      }
      return users;
    } catch (error: any) {
      console.error('❌ Error obteniendo usuarios:', error.message);
      return [];
    }
  }, []);

  /**
   * Busca un usuario por su wallet (desde la API)
   */
  const getUserByWallet = useCallback(async (publicKey: string): Promise<UserRegistration | null> => {
    const users = await getAllUsers();
    return users.find(u => u.publicKey === publicKey) || null;
  }, [getAllUsers]);

  /**
   * Verifica si una wallet está registrada
   */
  const isWalletRegistered = useCallback(async (publicKey: string): Promise<boolean> => {
    const user = await getUserByWallet(publicKey);
    return user !== null;
  }, [getUserByWallet]);

  /**
   * Obtiene el usuario actual de la sesión
   */
  const getCurrentUser = useCallback((): UserRegistration | null => {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem('current_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error leyendo usuario actual:', e);
      return null;
    }
  }, []);

  /**
   * Actualiza información del usuario
   */
  const updateUser = useCallback((publicKey: string, updates: Partial<UserRegistration>) => {
    try {
      if (typeof window === 'undefined') return null;
      const users = readUserRegistry();
      const index = users.findIndex(u => u.publicKey === publicKey);

      if (index === -1) {
        throw new Error('Usuario no encontrado');
      }

      users[index] = { ...users[index], ...updates };
      writeUserRegistry(users);
      localStorage.setItem('current_user', JSON.stringify(users[index]));

      console.log('✅ Usuario actualizado:', users[index].name || users[index].companyName);
      return users[index];
    } catch (error: any) {
      console.error('❌ Error actualizando usuario:', error.message);
      throw error;
    }
  }, []);

  /**
   * Desvincula un usuario de su sesión
   */
  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_wallet');
    localStorage.removeItem('user_type');
    console.log('✅ Sesión cerrada');
  }, []);

  /**
   * Obtiene estadísticas del registro
   */
  const getStats = useCallback(async () => {
    const users = await getAllUsers();
    const clients = users.filter(u => u.userType === 'client');
    const companies = users.filter(u => u.userType === 'company');

    return {
      totalUsers: users.length,
      totalClients: clients.length,
      totalCompanies: companies.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      verifiedUsers: users.filter(u => u.verified).length,
    };
  }, [getAllUsers]);

  return {
    registerUser,
    getAllUsers,
    getUserByWallet,
    isWalletRegistered,
    getCurrentUser,
    updateUser,
    logout,
    getStats,
  };
};
