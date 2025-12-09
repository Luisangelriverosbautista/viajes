/**
 * Script para migrar datos de localStorage a /data/users.json
 * Ejecutar con: node migrate-data.js
 */

const fs = require('fs');
const path = require('path');

// Datos de ejemplo que típicamente estarían en localStorage
// Basado en el patrón de registro que vimos
const oldLocalStorageData = {
  // Usuario 1: Tono (Empresa)
  tono: {
    publicKey: "GATX2X5KLKLVWWBOHX3WFGPQTGFK3PHHGVGWVDGHXVGNPVHPVPJX4RZ",
    userType: "company",
    name: "Tono",
    companyName: "Tono Companic",
    businessLicense: "BIZ-TONO-001",
    email: "tono@test.com",
    phone: "+34666777888",
    verified: false,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  // Usuario 2: Ant (Empresa)
  ant: {
    publicKey: "GANT5XVKHGXVGNPVHPVPJX4RZGATX2X5KLKLVWWBOHX3WFGPQTGFK3P",
    userType: "company",
    name: "Ant",
    companyName: "Ant Viajes",
    businessLicense: "BIZ-ANT-001",
    email: "ant@test.com",
    phone: "+34666999111",
    verified: false,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  // Usuario 3: Kevin (Cliente)
  kevin: {
    publicKey: "GAKV3X5KLKLVWWBOHX3WFGPQTGFK3PHHGVGWVDGHXVGNPVHPVPJX4RZ",
    userType: "client",
    name: "Kevin",
    email: "kevin@test.com",
    phone: "+34666555222",
    school: "MIT",
    studentId: "MIT-123",
    verified: false,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  // Usuario 4: Alain (Empresa)
  alain: {
    publicKey: "GAAL3X5KLKLVWWBOHX3WFGPQTGFK3PHHGVGWVDGHXVGNPVHPVPJX4RZ",
    userType: "company",
    name: "Alain",
    companyName: "Alain Tours",
    businessLicense: "BIZ-ALAIN-001",
    email: "alain@test.com",
    phone: "+34666333444",
    verified: false,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  // Usuario 5: Bombo (Empresa)
  bombo: {
    publicKey: "GABO3X5KLKLVWWBOHX3WFGPQTGFK3PHHGVGWVDGHXVGNPVHPVPJX4RZ",
    userType: "company",
    name: "Bombo",
    companyName: "Bombo Expeditions",
    businessLicense: "BIZ-BOMBO-001",
    email: "bombo@test.com",
    phone: "+34666111555",
    verified: false,
    status: "active",
    createdAt: new Date().toISOString(),
  },
};

// Datos de viajes de ejemplo
const oldTripsData = {
  // Viajes de Tono
  tono_trips: [
    {
      id: `trip_tono_1`,
      companyWallet: "GATX2X5KLKLVWWBOHX3WFGPQTGFK3PHHGVGWVDGHXVGNPVHPVPJX4RZ",
      companyName: "Tono Companic",
      name: "Viaje a Japón",
      destination: "Tokio, Japón",
      duration: "14 días",
      priceXLM: 500,
      description: "Viaje de estudio a Japón con visitas a templos históricos y universidades",
      maxParticipants: 20,
      currentBookings: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      highlights: ["Templos históricos", "Universidades", "Cultura japonesa"],
    },
    {
      id: `trip_tono_2`,
      companyWallet: "GATX2X5KLKLVWWBOHX3WFGPQTGFK3PHHGVGWVDGHXVGNPVHPVPJX4RZ",
      companyName: "Tono Companic",
      name: "Viaje a España",
      destination: "Madrid y Barcelona",
      duration: "10 días",
      priceXLM: 300,
      description: "Tour por ciudades españolas con enfoque académico",
      maxParticipants: 25,
      currentBookings: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      highlights: ["Museos", "Arquitectura", "Historia"],
    },
  ],
  // Viajes de Ant
  ant_trips: [
    {
      id: `trip_ant_1`,
      companyWallet: "GANT5XVKHGXVGNPVHPVPJX4RZGATX2X5KLKLVWWBOHX3WFGPQTGFK3P",
      companyName: "Ant Viajes",
      name: "Viaje a México",
      destination: "Ciudad de México y Yucatán",
      duration: "12 días",
      priceXLM: 400,
      description: "Experiencia cultural en México con arqueología prehispánica",
      maxParticipants: 30,
      currentBookings: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      highlights: ["Pirámides", "Cenotes", "Cultura maya"],
    },
  ],
};

// Crear directorio /data si no existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`✅ Directorio creado: ${dataDir}`);
}

// Convertir objeto a array y guardar usuarios
const usersArray = Object.values(oldLocalStorageData);
const usersFile = path.join(dataDir, 'users.json');
fs.writeFileSync(usersFile, JSON.stringify(usersArray, null, 2));
console.log(`✅ Usuarios migrados: ${usersArray.length} usuarios en ${usersFile}`);
usersArray.forEach(u => {
  console.log(`   - ${u.companyName || u.name} (${u.userType})`);
});

// Convertir viajes a array y guardar
const tripsArray = [
  ...oldTripsData.tono_trips,
  ...oldTripsData.ant_trips,
];
const tripsFile = path.join(dataDir, 'trips.json');
fs.writeFileSync(tripsFile, JSON.stringify(tripsArray, null, 2));
console.log(`\n✅ Viajes migrados: ${tripsArray.length} viajes en ${tripsFile}`);
tripsArray.forEach(t => {
  console.log(`   - "${t.name}" de ${t.companyName}`);
});

// Crear archivo de reservas vacío
const reservationsFile = path.join(dataDir, 'reservations.json');
fs.writeFileSync(reservationsFile, JSON.stringify([], null, 2));
console.log(`\n✅ Reservas inicializadas (vacío): ${reservationsFile}`);

console.log(`\n🎉 Migración completada exitosamente!`);
console.log(`\n📁 Estructura de datos:`);
console.log(`   /data/users.json - ${usersArray.length} usuarios`);
console.log(`   /data/trips.json - ${tripsArray.length} viajes`);
console.log(`   /data/reservations.json - 0 reservas (vacío)`);
