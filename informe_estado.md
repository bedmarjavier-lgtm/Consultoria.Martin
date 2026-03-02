# 📋 Estado del Proyecto — Consultoria.Martin
**Última actualización:** 03/03/2026 00:44  
**Commit:** `7bc6072` — `feat: snap al edificio real con Overpass + motor de búsqueda 7 variantes`

---

## ✅ Lo que funciona hoy

### 🗺️ Geolocalización — RESUELTO HOY
El mayor bug de la plataforma: el marcador caía en medio de la carretera en vez de sobre el edificio.

**Solución implementada en `src/App.jsx`:**

1. **`snapToBuilding(lat, lon, houseNumber)`** — nueva función:
   - Consulta **Overpass API** (OpenStreetMap) para obtener el polígono del edificio real
   - Calcula el **centroide geométrico** del tejado (no la calle)
   - Calcula el **área real en m²** con la fórmula de Shoelace/Gauss
   - **3 servidores de respaldo**: overpass-api.de → kumi.systems → maps.mail.ru
   - **2 radios**: 80m → 150m si no encuentra nada

2. **Motor de búsqueda en cascada** — 7 variantes en orden:
   - Estructurada con nombre completo de calle
   - Estructurada con nombre simplificado (sin "Calle de la…")
   - Libre con nombre completo + CP + ciudad (España)
   - Libre con nombre simplificado + CP + ciudad (España)
   - Query completa normalizada (España)
   - Query completa sin restricción de país
   - Solo calle simplificada + ciudad (sin número)

3. **`stripStreetPrefix()`**: Elimina prefijos automáticamente:
   - "Calle de la Rúa Mayor" → "Rúa Mayor"
   - "Avenida de la Constitución" → "Constitución"
   - "Paseo de la Castellana" → "Castellana"

4. **Parsing de dirección universal**: extrae código postal español (5 dígitos)
   separado de ciudad, soporta formatos multilinea (copiado de Google Maps, email, etc.)

5. **Área de tejado real**: el `SolarCalculator` recibe el área OSM × 0.70
   (factor de aprovechamiento real) en vez de un valor pseudoaleatorio.

6. **Zoom 20** (máximo satelital) al localizar un edificio.

---

### 🖥️ Frontend (Vite + React)
- **URL:** http://localhost:5173
- **Arranque:** `npm run dev` desde la raíz del proyecto
- Login/registro con Supabase funcionando
- Globe 3D de entrada → zoom → pantalla principal con mapa
- Dashboard de usuario (perfil, facturas, historial)
- Reset de contraseña por email

### 🔧 Backend (Node/Express)
- **URL:** http://localhost:5001
- **Arranque:** `node index.js` desde `./server/`
- Recibe leads con factura adjunta (multer)
- Guarda en Supabase tabla `leads`
- Sirve archivos de `./uploads/`

---

## 🔜 Pendiente / Ideas para mañana

- [ ] Testear el snap en más direcciones de ciudades pequeñas
- [ ] Mostrar el polígono del edificio en el mapa (overlay de tejado)
- [ ] Afinar el factor de aprovechamiento (0.70) según orientación del tejado
- [ ] Integrar precio real de electricidad desde ESIOS/REE API
- [ ] OCR automático de facturas en el backend
- [ ] Panel Admin: ver leads en tiempo real

---

## 🏗️ Arquitectura de archivos clave

```
src/
  App.jsx              ← Motor de búsqueda + snapToBuilding + mapa
  components/
    MapComponent.jsx   ← Leaflet + Google Satellite tiles
    ResultCard.jsx     ← Tarjeta de resultados solares
    SmartInsights.jsx  ← Panel de anomalías e insights
    UserDashboard.jsx  ← Dashboard usuario (facturas, historial)
    GlobeDiscovery.jsx ← Globe 3D de entrada (Three.js)
    Login.jsx          ← Autenticación Supabase
  utils/
    SolarCalculator.js ← Cálculos Geo-Architect (@1.7m²/panel, 4.75kWh/m²/día)
  lib/
    supabase.js        ← Cliente Supabase

server/
  index.js             ← API Express (leads, uploads)
  .env                 ← SUPABASE_URL, SUPABASE_KEY, PORT=5001
```
