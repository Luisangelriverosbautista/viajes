# 🧪 PLAN DE PRUEBA - SINCRONIZACIÓN EN TIEMPO REAL

**Objetivo**: Validar que pagos y viajes nuevos se reflejan en tiempo real (máximo 2 segundos).

---

## 📋 PREREQUISITOS

✅ Sistema deployed en: `https://viajes-escolares.netlify.app`  
✅ Freighter wallet conectado (Testnet)  
✅ Soroban contract activo (verificar en `CONFIGURATION.js`)  
✅ Archivos JSON listos: `trips.json`, `reservations.json`, `users.json`

---

## 🧪 TEST 1: SINCRONIZACIÓN DE VIAJES NUEVOS

**Escenario**: Empresa crea viaje → Debe aparecer en lista de estudiantes en ~2 segundos.

### Pasos:

1. **Abrir 2 ventanas del navegador:**
   - Ventana A: Empresa conectada → `/company-dashboard`
   - Ventana B: Estudiante conectado → `/available-trips`

2. **Desde Ventana A (Empresa):**
   - Click en "Crear nuevo viaje"
   - Rellenar formulario:
     - Nombre: "Test Viaje 123"
     - Destino: "Testlandia"
     - Duración: "3" días
     - Precio: "50" XLM
     - Participantes: "10"
   - Click "Crear viaje"
   - Esperar confirmación: "✅ Viaje creado exitosamente"
   - **ANOTAR HORA EXACTA** (Timestamp A)

3. **Verificar en Ventana B:**
   - Ir a la consola (F12)
   - Buscar log: `[HOOK] 📡 Total de viajes en API: X`
   - Esperar a que el número de viajes incremente en 1
   - **ANOTAR HORA EXACTA** (Timestamp B)
   - **Calcular**: `Timestamp B - Timestamp A` debe ser ≤ 2 segundos

### ✅ ESPERADO:
```
[AVAILABLE-TRIPS] 🔄 Sincronizando (polling)...
[HOOK] 📡 Total de viajes en API: 7  ← Aumentó de 6 a 7
[HOOK] 🟢 Viajes activos: 7
[AVAILABLE-TRIPS] ✅ Sincronización completada
```

### ❌ SI FALLA:
- Log de POST en API: Revisar `/api/trips` logs
- trips.json no actualizado: Verificar permisos de archivo
- Intervalo no ejecutándose: Revisar consola de Ventana B

---

## 🧪 TEST 2: SINCRONIZACIÓN DE PAGOS

**Escenario**: Estudiante paga por viaje → Debe aparecer en su lista de reservas en ~2 segundos.

### Pasos:

1. **Abrir 2 ventanas del navegador:**
   - Ventana A: Estudiante A conectado → `/available-trips`
   - Ventana B: Estudiante B o Empresa → `/available-trips` (para ver cambios de otros)

2. **Desde Ventana A:**
   - Hacer scroll a viaje con lugares disponibles
   - Click "Reservar viaje"
   - En modal: Click "Confirmar reserva y pagar"
   - Esperar confirmación en Freighter
   - Esperar: "✅ Viaje reservado exitosamente"
   - **ANOTAR HORA EXACTA** (Timestamp A)

3. **Verificar en Ventana A (mismo estudiante):**
   - Ir a consola (F12)
   - Buscar log: `[HOOK] 📡 Total de viajes en API`
   - Scroll hacia arriba para ver "MIS RESERVAS"
   - **Debe aparecer la reserva con estado "Completado"**
   - **ANOTAR HORA EXACTA** (Timestamp B)

4. **Verificar currentBookings actualizados:**
   - El viaje debe mostrar `currentBookings` incrementado en 1
   - En consola: Buscar el tripId
   - Comparar logs antes/después

### ✅ ESPERADO:
```
[AVAILABLE-TRIPS] 🔄 Sincronizando (polling)...
[API GET] trips.json tiene 7 viajes
[HOOK] 📡 Total de viajes en API: 7
[AVAILABLE-TRIPS] ✅ Sincronización completada

// En la UI:
// "MIS RESERVAS" muestra la nueva reserva
// El viaje ahora tiene currentBookings = (anterior + 1)
```

### ❌ SI FALLA:
- Pago no aparece: Revisar `/api/reservations` logs
- reservations.json vacío: Verificar POST funcionando
- currentBookings no actualiza: Verificar trips.json escritura

---

## 🧪 TEST 3: MULTI-USUARIO EN TIEMPO REAL

**Escenario**: 2 estudiantes simultáneamente ven actualizaciones de pagos.

### Pasos:

1. **Abrir 3 ventanas:**
   - Ventana A: Empresa → `/company-dashboard` (crear viajes)
   - Ventana B: Estudiante 1 → `/available-trips`
   - Ventana C: Estudiante 2 → `/available-trips`

2. **Desde Empresa (Ventana A):**
   - Crear viaje "MultiTest 1"
   - Anotar hora (T0)

3. **Desde Estudiante 1 (Ventana B):**
   - En consola, buscar nuevo viaje
   - Anotar hora (T1) cuando vea el viaje
   - Pagar por el viaje
   - Anotar hora (T2) cuando aparezca en "MIS RESERVAS"

4. **Desde Estudiante 2 (Ventana C):**
   - En consola, verificar que ve:
     - El viaje nuevo de Empresa (T0 + 2s max)
     - El cambio de currentBookings cuando Estudiante 1 paga (T2 + 2s max)

### ✅ ESPERADO:
- Ambos estudiantes ven los cambios casi simultáneamente
- Máximo 2-3 segundos de latencia entre eventos
- Los números de viajes activos son consistentes en ambas ventanas

---

## 🧪 TEST 4: SESSION PERSISTENCE

**Escenario**: Cerrar ventana y volver → Sesión se mantiene, sin logout forzado.

### Pasos:

1. **Estudiante en `/available-trips`**
   - Verificar que localStorage tiene:
     - `walletAddress` ✅
     - `isAuthenticated` = "true" ✅
     - `current_user` con datos ✅

2. **Hacer click en "Volver al dashboard":**
   - Debe redirigir a `/available-trips` (NO a `/login`)

3. **Cerrar pestaña y abrir nuevo tab:**
   - Ir a https://viajes-escolares.netlify.app
   - Si localStorage persiste:
     - Debe ir a `/available-trips` automáticamente
     - NO debe pedir login de nuevo

### ✅ ESPERADO:
```
localStorage.walletAddress = "GA..."
localStorage.isAuthenticated = "true"
// Redirige a /available-trips automáticamente
```

---

## 📊 MÉTRICAS A REGISTRAR

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Latencia Viaje Nuevo | ≤ 2s | ? |
| Latencia Pago | ≤ 2s | ? |
| Consistencia Multi-Usuario | ≤ 3s drift | ? |
| Session Persistence | 0 logouts inesperados | ? |
| Errores API | 0 errores 500 | ? |

---

## 🔍 DEBUGGING - Si algo falla

### Ver logs del API server:
```bash
npm run dev  # En local
# Ver consola de terminal
```

### Revisar archivos de datos:
```bash
cat frontend/data/trips.json        # Viajes guardados
cat frontend/data/reservations.json # Reservas guardadas
cat frontend/data/users.json        # Usuarios registrados
```

### Limpiar estado (solo si es necesario):
```bash
rm frontend/data/trips.json
rm frontend/data/reservations.json
# El sistema los recreará con datos nuevos
```

### Ver cookies y storage en el navegador:
- F12 → Storage → localStorage
- Buscar: `walletAddress`, `isAuthenticated`, `current_user`

---

## ✅ CHECKLIST FINAL

- [ ] Test 1: Viajes nuevos aparecen en < 2s
- [ ] Test 2: Pagos aparecen en < 2s
- [ ] Test 3: Multi-usuario sincronizado
- [ ] Test 4: Session persiste sin logout
- [ ] Todos los logs visibles en consola
- [ ] Sin errores 500 en API
- [ ] currentBookings actualiza correctamente
- [ ] Reservas marcadas como "Completado"

---

**Fecha de prueba**: [Completar]  
**Usuario de prueba**: [Completar]  
**Resultado**: ✅ PASÓ / ❌ FALLÓ  
**Notas**: [Agregar observaciones]
