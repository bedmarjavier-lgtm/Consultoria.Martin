import { useState, useEffect, useCallback, Suspense, lazy, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import './index.css'

// ── Core components ──────────────────────────────────────────────────────────
import AdminDashboard from './components/AdminDashboard'
import { Terms, Privacy } from './components/Legal'
import { calculateSolarImpact } from './utils/SolarCalculator'
import UserDashboard from './components/UserDashboard'
import ResetPassword from './components/ResetPassword'
import { Search, User as UserIcon, Briefcase, X, MapPin } from 'lucide-react'
import { supabase } from './lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

// ── Landing sections ─────────────────────────────────────────────────────────
import HeroSection from './components/landing/HeroSection'
import HowWeWork from './components/landing/HowWeWork'
import TrustCards from './components/landing/TrustCards'
import FaqSection from './components/landing/FaqSection'
import LandingFooter from './components/landing/LandingFooter'

// ── Lazy-loaded heavy components ─────────────────────────────────────────────
const MapComponent = lazy(() => import('./components/MapComponent'))
const ResultCard = lazy(() => import('./components/ResultCard'))
const ConsumptionChart = lazy(() => import('./components/ConsumptionChart'))
const SmartInsights = lazy(() => import('./components/SmartInsights'))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  // ── Mini-router ──────────────────────────────────────────────────────────
  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />
  }

  // ── State ────────────────────────────────────────────────────────────────
  const [showApp, setShowApp] = useState(false)       // false = landing, true = mapa/herramienta
  const [showAdmin, setShowAdmin] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const SPAIN_CENTER = [40.4165, -3.7026]
  const SPAIN_ZOOM = 6
  const [mapCenter, setMapCenter] = useState(SPAIN_CENTER)
  const [mapZoom, setMapZoom] = useState(SPAIN_ZOOM)
  const [markerPos, setMarkerPos] = useState(null)
  const [results, setResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUserDashboard, setShowUserDashboard] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [session, setSession] = useState(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
    const urlType = hashParams.get('type')
    if (urlType === 'recovery') {
      setIsRecovery(true)
      window.history.replaceState(null, '', window.location.pathname)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (urlType === 'recovery' && session) {
        setIsRecovery(true)
        setSession(session)
      } else {
        setSession(session)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
        setSession(session)
      } else if (event === 'SIGNED_IN' && isRecovery) {
        // No salimos del recovery por un SIGNED_IN durante recuperación
      } else {
        setIsRecovery(false)
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Admin shortcut (Cmd+Opt+A / Alt+L) ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      const isAltKey = e.altKey
      const key = e.key.toLowerCase()
      if ((isCmdOrCtrl && isAltKey && key === 'a') || (isAltKey && key === 'l')) {
        e.preventDefault()
        setShowAdmin(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ── Resize ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Snap to building (Overpass) ──────────────────────────────────────────
  const snapToBuilding = async (lat, lon, houseNumber = null) => {
    const processPolygon = (nodes) => {
      const cLat = nodes.reduce((s, n) => s + n.lat, 0) / nodes.length
      const cLon = nodes.reduce((s, n) => s + n.lon, 0) / nodes.length
      const DEG_LAT = 111320
      const DEG_LON = 111320 * Math.cos(cLat * Math.PI / 180)
      let area = 0
      for (let i = 0; i < nodes.length; i++) {
        const j = (i + 1) % nodes.length
        const xi = (nodes[i].lon - cLon) * DEG_LON
        const yi = (nodes[i].lat - cLat) * DEG_LAT
        const xj = (nodes[j].lon - cLon) * DEG_LON
        const yj = (nodes[j].lat - cLat) * DEG_LAT
        area += xi * yj - xj * yi
      }
      return { cLat, cLon, areaMq: Math.round(Math.abs(area) / 2) }
    }

    const OVERPASS_SERVERS = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    ]
    const queryOverpass = async (radius) => {
      const q = `[out:json][timeout:10];(way(around:${radius},${lat},${lon})["building"];relation(around:${radius},${lat},${lon})["building"];);out body geom;`
      for (const server of OVERPASS_SERVERS) {
        try {
          const r = await fetch(server, {
            method: 'POST', body: q,
            headers: { 'Content-Type': 'text/plain' },
            signal: AbortSignal.timeout(11000)
          })
          if (!r.ok) continue
          const d = await r.json()
          return d.elements || []
        } catch { continue }
      }
      return []
    }

    try {
      let elements = await queryOverpass(80)
      if (elements.length === 0) elements = await queryOverpass(150)
      if (elements.length === 0) return { lat, lon, areaMq: null, found: false }

      const valid = elements.filter(el => el.geometry && el.geometry.length >= 3)
      if (valid.length === 0) return { lat, lon, areaMq: null, found: false }

      const buildings = valid.map(el => {
        const { cLat, cLon, areaMq } = processPolygon(el.geometry)
        const dist = Math.hypot(cLat - lat, cLon - lon)
        const hn = el.tags?.['addr:housenumber'] || el.tags?.['addr:street_number'] || null
        return { cLat, cLon, areaMq, dist, houseNumberOSM: hn, el }
      })

      let best = null
      if (houseNumber) {
        best = buildings.filter(b => b.houseNumberOSM === String(houseNumber)).sort((a, b) => a.dist - b.dist)[0] || null
      }
      if (!best) best = buildings.filter(b => b.areaMq < 8000).sort((a, b) => a.dist - b.dist)[0] || null
      if (!best) best = buildings.sort((a, b) => a.dist - b.dist)[0]

      return { lat: best.cLat, lon: best.cLon, areaMq: best.areaMq, found: true }
    } catch {
      return { lat, lon, areaMq: null, found: false }
    }
  }

  // ── Search & Autocomplete ────────────────────────────────────────────────
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (debounceTimeout) clearTimeout(debounceTimeout)

    if (value.trim().length > 3) {
      setDebounceTimeout(setTimeout(async () => {
        try {
          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=5&lat=37.3891&lon=-4.7678`
          const r = await fetch(url)
          if (r.ok) {
            const data = await r.json()
            const features = data.features.filter(f => f.properties.country === 'España' || f.properties.countrycode === 'ES' || f.properties.state)
            setSuggestions(features)
            setShowSuggestions(true)
          }
        } catch (err) {
          console.error('Error fetching suggestions', err)
        }
      }, 250)) // Reducido para mayor velocidad en móvil
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = async (feature) => {
    const props = feature.properties
    const coords = feature.geometry.coordinates // Photon devuelve [lon, lat]
    const addressString = [props.street, props.housenumber, props.city || props.town || props.state].filter(Boolean).join(', ')
    setSearchQuery(addressString)
    setShowSuggestions(false)

    // Ruta ultrarrápida (salta comprobaciones lentas de Nominatim)
    setLoading(true)
    setResults(null)

    try {
      const lat = coords[1]
      const lon = coords[0]
      const numberPart = props.housenumber || null

      toast.loading('Localizando tejado del edificio...', { id: 'snap' })
      const snap = await snapToBuilding(lat, lon, numberPart)
      toast.dismiss('snap')

      const finalLat = snap.lat
      const finalLon = snap.lon

      setMarkerPos([finalLat, finalLon])
      setMapCenter([finalLat, finalLon])
      setMapZoom(20)

      const randomPrice = 0.14 + (Math.random() * 0.05)
      let detectedArea
      if (snap.found && snap.areaMq && snap.areaMq > 20) {
        detectedArea = Math.round(snap.areaMq * 0.70)
      } else {
        const seed = (Math.abs(Math.round(finalLat * 10000) / 10000) * 1000 + Math.abs(Math.round(finalLon * 10000) / 10000) * 1000) % 1
        detectedArea = Math.floor(40 + seed * 90)
      }
      const impact = calculateSolarImpact(detectedArea, randomPrice)
      const finalResult = { ...impact, area: detectedArea, address: addressString, buildingSnapped: snap.found }

      setTimeout(() => {
        setResults(finalResult)
        setShowSearch(false)
        if (!numberPart) {
          toast('Ajuste el pin manualmente sobre su tejado.', {
            icon: '⚠️',
            duration: 6000,
            style: { background: '#2d1b00', color: '#ffb340', border: '1px solid #ffb34050' }
          })
        } else {
          toast.success(
            snap.found
              ? `Tejado Nº${props.housenumber || ''} · ${detectedArea}m² reales`
              : `Portal Nº${props.housenumber} Localizado`
          )
        }
      }, 300)

      if (session) saveAnalysis(finalResult)
    } catch (error) {
      console.error('Fast-path geocoding failure', error)
      toast.error('Error inesperado. Reintenta.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e, forcedQuery = null) => {
    if (e) e.preventDefault()
    const query = (forcedQuery || searchQuery).trim().replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ')
    if (!query) return

    setShowSuggestions(false)

    setLoading(true)
    setResults(null)

    try {
      const streetMatch = query.match(/^(.+?)[,\s]+(\d+)[,\s]*(.*)$/)
      let streetPart = null, numberPart = null, postalCode = null, cityPart = null

      if (streetMatch) {
        streetPart = streetMatch[1].trim()
        numberPart = streetMatch[2].trim()
        const rest = streetMatch[3].trim()
        if (rest) {
          const cpMatch = rest.match(/^(\d{5})[,\s]+(.+)$/)
          if (cpMatch) {
            postalCode = cpMatch[1]
            cityPart = cpMatch[2].split(',')[0].trim()
          } else if (/^\d{5}$/.test(rest.split(/[,\s]/)[0])) {
            postalCode = rest.split(/[,\s]/)[0]
          } else {
            cityPart = rest.split(',')[0].trim()
          }
        }
      }

      const stripStreetPrefix = (s) => {
        if (!s) return s
        return s.replace(/^(calle|c\/|avda?\.?|avenida|paseo|plaza|ronda|carretera|camino|travess?[íi]a|rambla|via|vía|boulevard|bulevar)\s+(de\s+(la\s+|las\s+|el\s+|los\s+|l[ao]\s+)?|del\s+|de\s+)?/i, '').trim()
      }
      const strippedStreet = streetPart ? stripStreetPrefix(streetPart) : null

      const nominatimSearch = async (q, extraParams = '') => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10${extraParams}&q=${encodeURIComponent(q)}`
        try {
          const r = await fetch(url, { headers: { 'Accept-Language': 'es' } })
          if (!r.ok) return []
          return await r.json()
        } catch { return [] }
      }

      const nominatimStructured = async (street, number, city, cp) => {
        let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=es&street=${encodeURIComponent(number + ' ' + street)}&viewbox=-4.82,37.42,-4.70,37.35`
        if (city) url += `&city=${encodeURIComponent(city)}`
        if (cp) url += `&postalcode=${encodeURIComponent(cp)}`
        try {
          const r = await fetch(url, { headers: { 'Accept-Language': 'es' } })
          if (!r.ok) return []
          return await r.json()
        } catch { return [] }
      }

      let data = []
      const variants = [
        ...(streetPart && numberPart ? [() => nominatimStructured(streetPart, numberPart, cityPart, postalCode)] : []),
        ...(strippedStreet && strippedStreet !== streetPart && numberPart ? [() => nominatimStructured(strippedStreet, numberPart, cityPart, postalCode)] : []),
        ...(streetPart && numberPart ? [() => { const parts = [numberPart + ' ' + streetPart]; if (postalCode) parts.push(postalCode); if (cityPart) parts.push(cityPart); return nominatimSearch(parts.join(', '), '&countrycodes=es') }] : []),
        ...(strippedStreet && strippedStreet !== streetPart && numberPart ? [() => { const parts = [numberPart + ' ' + strippedStreet]; if (postalCode) parts.push(postalCode); if (cityPart) parts.push(cityPart); return nominatimSearch(parts.join(', '), '&countrycodes=es') }] : []),
        () => nominatimSearch(query, '&countrycodes=es'),
        () => nominatimSearch(query, ''),
        ...(strippedStreet && (cityPart || postalCode) ? [() => { const parts = [strippedStreet]; if (postalCode) parts.push(postalCode); if (cityPart) parts.push(cityPart); return nominatimSearch(parts.join(', '), '') }] : []),
      ]

      for (const variant of variants) {
        if (data.length > 0) break
        const result = await variant()
        if (result.length > 0) data = result
      }

      if (data && data.length > 0) {
        const preciseResult =
          (numberPart && data.find(item => item.class === 'building' && item.address?.house_number === numberPart)) ||
          data.find(item => item.class === 'building') ||
          (numberPart && data.find(item => item.address?.house_number === numberPart)) ||
          data.find(item => item.address?.house_number) ||
          data.find(item => item.type !== 'administrative') ||
          data[0]

        const nominatimLat = parseFloat(preciseResult.lat)
        const nominatimLon = parseFloat(preciseResult.lon)

        toast.loading('Localizando tejado del edificio...', { id: 'snap' })
        const snap = await snapToBuilding(nominatimLat, nominatimLon, numberPart || null)
        toast.dismiss('snap')

        const lat = snap.lat
        const lon = snap.lon

        setMarkerPos([lat, lon])
        setMapCenter([lat, lon])
        setMapZoom(20)

        const randomPrice = 0.14 + (Math.random() * 0.05)
        let detectedArea
        if (snap.found && snap.areaMq && snap.areaMq > 20) {
          detectedArea = Math.round(snap.areaMq * 0.70)
        } else {
          const seed = (Math.abs(Math.round(lat * 10000) / 10000) * 1000 + Math.abs(Math.round(lon * 10000) / 10000) * 1000) % 1
          detectedArea = Math.floor(40 + seed * 90)
        }
        const impact = calculateSolarImpact(detectedArea, randomPrice)
        const foundHouseNumber = preciseResult.address?.house_number
        const finalResult = { ...impact, area: detectedArea, address: preciseResult.display_name, buildingSnapped: snap.found }

        setTimeout(() => {
          setResults(finalResult)
          setShowSearch(false)
          if (!foundHouseNumber && !numberPart) {
            toast('Ajuste el pin manualmente sobre su tejado.', {
              icon: '⚠️',
              duration: 6000,
              style: { background: '#2d1b00', color: '#ffb340', border: '1px solid #ffb34050' }
            })
          } else {
            toast.success(
              snap.found
                ? `Tejado Nº${foundHouseNumber || numberPart || ''} · ${detectedArea}m² reales`
                : foundHouseNumber ? `Portal Nº${foundHouseNumber} Localizado` : 'Ubicación Encontrada'
            )
          }
        }, 300)

        if (session) saveAnalysis(finalResult)
      } else {
        toast.error('Sin resultados. Prueba a incluir ciudad o código postal.')
      }
    } catch (error) {
      console.error('Geocoding failure', error)
      toast.error('Error inesperado. Reintenta.')
    } finally {
      setLoading(false)
    }
  }

  // ── Map click ────────────────────────────────────────────────────────────
  const handleMapClick = async (coords) => {
    const [clickLat, clickLon] = coords;
    setMarkerPos([clickLat, clickLon]); // Instantaneous placement
    setLoading(true);
    try {
      const snap = await snapToBuilding(clickLat, clickLon);
      const lat = clickLat; // Use exact coords instead of snapping back
      const lon = clickLon;

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const address = data.display_name || `Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      const randomPrice = 0.14 + (Math.random() * 0.05);
      let detectedArea;
      if (snap.found && snap.areaMq && snap.areaMq > 20) {
        detectedArea = Math.round(snap.areaMq * 0.70);
      } else {
        const seed = (Math.abs(Math.round(lat * 10000) / 10000) * 1000 + Math.abs(Math.round(lon * 10000) / 10000) * 1000) % 1;
        detectedArea = Math.floor(40 + seed * 90);
      }
      const impact = calculateSolarImpact(detectedArea, randomPrice);
      const finalResult = { ...impact, area: detectedArea, address, buildingSnapped: snap.found };
      setResults(finalResult);
      if (session) saveAnalysis(finalResult);
    } catch (error) {
      console.error('Reverse geocoding failure', error);
    } finally {
      setLoading(false);
    }
  }

  // ── Reset view ───────────────────────────────────────────────────────────
  const handleLogoClick = () => {
    setShowApp(false)
    setResults(null)
    setMarkerPos(null)
    setMapCenter(SPAIN_CENTER)
    setMapZoom(SPAIN_ZOOM)
    setSearchQuery('')
    setLoading(false)
    setShowSearch(false)
    setShowUserDashboard(false)
    setShowAdmin(false)
    setShowTerms(false)
    setShowPrivacy(false)
  }

  // ── Save analysis ────────────────────────────────────────────────────────
  const saveTimeoutRef = useRef(null)

  const saveAnalysis = useCallback(async (data) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (!session) return
        const userId = session.user.id
        const { error: analysisError } = await supabase
          .from('solar_analysis')
          .insert({
            user_id: userId,
            address: data.address,
            roof_area_m2: data.area,
            panels_count: data.numPanels,
            annual_savings_eur: data.annualSavings
          })
          .select()
          .single()
        if (analysisError) throw analysisError
        await supabase.from('profiles').upsert({
          id: userId,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || ''
        }, { onConflict: 'id' })
        toast.success(`Sincronización Completa: ${data.address.split(',')[0]}`, { id: 'sync' })
      } catch (error) {
        console.error('Error in unified sync:', error)
      }
    }, 500)
  }, [session])

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      setSession(null)
      setShowApp(false)
      setShowUserDashboard(false)
      setResults(null)
      setMarkerPos(null)
      toast.success('Sesión finalizada correctamente')
    }
  }

  // ── Enter experience (desde Globe o botón CTA) ───────────────────────────
  const handleEnterExperience = () => {
    if (!session) return   // Seguridad: solo si está autenticado
    setShowApp(true)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#00050a] flex flex-col">
      <Helmet>
        <title>Consultoría.Martin | Expertos en Ahorro Energético y Placas Solares</title>
        <meta name="description" content="Consultoría.Martin: análisis LiDAR gratuito de tu tejado, simulación 3D de autoconsumo solar y optimización de tarifas eléctricas. Ahorra hasta 2.100€/año en tu factura de luz." />
        <meta name="keywords" content="autoconsumo solar, eficiencia energética, ahorro en factura de luz, simulación 3D, placas solares, consultoría energética, auditoría factura luz" />
        <meta property="og:title" content="Consultoría.Martin | Expertos en Ahorro Energético y Placas Solares" />
        <meta property="og:description" content="Análisis LiDAR gratuito de tu tejado y simulación real de ahorro energético basada en precios de mercado actuales." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://consultoriamartin.com/" />
        <link rel="canonical" href="https://consultoriamartin.com/" />
      </Helmet>

      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0a1628', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />

      {/* ── MODO LANDING ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!showApp && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            {/* Hero + Globe + Login */}
            <HeroSection
              session={session}
              isRecovery={isRecovery}
              isAuthenticating={isAuthenticating}
              onShowTerms={() => setShowTerms(true)}
              onShowPrivacy={() => setShowPrivacy(true)}
              onEnterExperience={handleEnterExperience}
              onLogin={() => {
                setIsRecovery(false)
                setIsAuthenticating(true)
                setTimeout(() => {
                  setIsAuthenticating(false)
                  setShowApp(true)
                }, 1800)
              }}
            />

            {/* Resto de secciones — visibles para cualquier visitante no-logueado */}
            {!isRecovery && (
              <>
                <HowWeWork />

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <TrustCards />

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <FaqSection />
              </>
            )}

            {/* Footer */}
            <LandingFooter
              onShowTerms={() => setShowTerms(true)}
              onShowPrivacy={() => setShowPrivacy(true)}
            />
          </motion.div>
        )}

        {/* ── MODO HERRAMIENTA (MAPA) ──────────────────────────────────────── */}
        {showApp && (
          <motion.main
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col relative w-full min-h-screen lg:h-screen lg:overflow-hidden overflow-y-auto overflow-x-hidden scroll-smooth"
          >
            {/* Header */}
            <header className="fixed top-0 left-0 w-full p-4 md:px-12 md:py-8 z-[2000] grid grid-cols-3 items-center bg-transparent border-none backdrop-blur-sm lg:backdrop-blur-none">
              {/* Izquierda: Buscador */}
              <div className="flex items-center justify-start">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`transition-all hover:scale-110 active:scale-95 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] ${showSearch ? 'text-cyan-400' : 'text-white/70 hover:text-cyan-400'}`}
                  aria-label="Abrir buscador"
                >
                  <Search size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* Centro: Logo */}
              <div
                onClick={handleLogoClick}
                className="text-center cursor-pointer hover:scale-105 transition-transform flex flex-col items-center justify-center"
              >
                <div className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter uppercase font-montserrat leading-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Consultoría.<span className="text-[#ff8c42]">Martin</span>
                </div>

              </div>

              {/* Derecha: Usuario y Admin */}
              <div className="flex items-center justify-end gap-6 md:gap-10">
                <button
                  onClick={() => setShowUserDashboard(true)}
                  className="text-white/70 hover:text-cyan-400 transition-all hover:scale-110 active:scale-95"
                  aria-label="Panel de usuario"
                >
                  <UserIcon size={22} strokeWidth={2.5} />
                </button>

                {session?.user?.email === 'bedmarjavier@gmail.com' && (
                  <button
                    onClick={() => setShowAdmin(true)}
                    className="text-white/70 hover:text-orange-400 transition-all hover:scale-110 active:scale-95"
                    aria-label="Panel de administración"
                  >
                    <Briefcase size={22} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </header>

            {/* Search overlay */}
            <AnimatePresence>
              {showSearch && (
                <div
                  className={isMobile
                    ? "fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    : "fixed top-32 left-1/2 -translate-x-1/2 w-[600px] z-[5000]"
                  }
                >
                  <motion.div
                    initial={isMobile ? { opacity: 0, scale: 0.9, y: 30 } : { opacity: 0, y: -20 }}
                    animate={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 }}
                    exit={isMobile ? { opacity: 0, scale: 0.9, y: 30 } : { opacity: 0, y: -20 }}
                    className="bg-black/95 backdrop-blur-3xl p-10 md:p-14 rounded-[3.5rem] border-2 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)] w-full relative pointer-events-auto"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase mb-8 text-center animate-pulse">SISTEMA DE ESCANEO ACTIVO</div>
                      <div className="relative w-full mb-10">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Calle y Número, Ciudad..."
                          className="w-full bg-transparent border-b-2 border-white/5 px-0 py-6 text-2xl md:text-5xl font-black tracking-tighter text-white placeholder:text-white/10 uppercase focus:outline-none focus:border-cyan-400 transition-all text-center"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(e)
                            if (e.key === 'Escape') setShowSuggestions(false)
                          }}
                        />

                        {/* Dropdown de Sugerencias */}
                        <AnimatePresence>
                          {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 w-full mt-2 bg-[#000810]/98 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 text-left"
                            >
                              {suggestions.map((s, i) => {
                                const p = s.properties
                                const mainText = [p.street, p.housenumber].filter(Boolean).join(' ') || p.name
                                const subText = [p.city || p.town || p.village, p.state].filter(Boolean).join(', ')
                                return (
                                  <div
                                    key={i}
                                    onClick={() => handleSuggestionClick(s)}
                                    className="px-6 py-4 cursor-pointer hover:bg-white/5 border-b border-white/5 flex items-center gap-4 transition-colors group"
                                  >
                                    <MapPin className="text-white/20 group-hover:text-cyan-400 transition-colors shrink-0" size={18} />
                                    <div className="truncate">
                                      <p className="text-white text-sm font-bold uppercase tracking-wider truncate">{mainText}</p>
                                      {subText && <p className="text-white/40 text-[10px] uppercase tracking-widest truncate">{subText}</p>}
                                    </div>
                                  </div>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-12 py-5 bg-cyan-400 text-black rounded-full text-[12px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                      >
                        {loading ? 'PROCESANDO...' : 'INICIAR AUDITORÍA'}
                      </button>
                      <button
                        onClick={() => { setShowSearch(false); setShowSuggestions(false); }}
                        className="mt-8 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        CERRAR PANEL
                      </button>
                      <button
                        onClick={() => { setShowSearch(false); setShowSuggestions(false); }}
                        className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all backdrop-blur-xl"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Map + Overlays */}
            <div className="relative w-full h-full flex-1 overflow-x-hidden">
              {/* Mapa (fondo) */}
              <section className="fixed inset-0 z-0 h-[100svh] w-full">
                <Suspense fallback={<div className="w-full h-full bg-[#00050a]" />}>
                  <MapComponent center={mapCenter} zoom={mapZoom} markerPos={markerPos} onMapClick={handleMapClick} isMobile={isMobile} onMarkerDragEnd={handleMapClick} />
                </Suspense>
              </section>

              {/* Contenido sobre el mapa */}
              <div className="relative z-10 w-full min-h-[100svh] pointer-events-none flex flex-col">
                <div className="h-[65vh] lg:h-[20vh] shrink-0 pointer-events-none" />

                <div className="flex flex-col lg:flex-row justify-between w-full flex-1 relative px-4 md:px-10 pb-24 md:pb-10 gap-6">
                  <aside className="w-full lg:w-[400px] pointer-events-auto flex flex-col gap-6">
                    <Suspense fallback={<LazyFallback />}>
                      <SmartInsights results={results} />
                      <ConsumptionChart />
                    </Suspense>
                  </aside>

                  <div className="w-full lg:w-auto pointer-events-auto">
                    <AnimatePresence>
                      {results && (
                        <Suspense fallback={<LazyFallback />}>
                          <ResultCard results={results} onClose={() => setResults(null)} userId={session?.user?.id} />
                        </Suspense>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* ── Modales globales ─────────────────────────────────────────────── */}
      <AdminDashboard isOpen={showAdmin} onClose={() => setShowAdmin(false)} session={session} />
      <UserDashboard isOpen={showUserDashboard} onClose={() => setShowUserDashboard(false)} onLogout={handleLogout} session={session} />
      <Terms isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <Privacy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s forwards; }
      `}</style>
    </div>
  )
}

export default App
