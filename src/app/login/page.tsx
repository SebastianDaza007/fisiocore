'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

// Posiciones predefinidas para evitar problemas de hidratación
const iconPositions = [
  { x1: 20, y1: 10, x2: 80, y2: 30, x3: 40, y3: 90 },
  { x1: 70, y1: 20, x2: 30, y2: 70, x3: 85, y3: 15 },
  { x1: 45, y1: 80, x2: 75, y2: 40, x3: 15, y3: 60 },
  { x1: 15, y1: 45, x2: 60, y2: 85, x3: 90, y3: 25 },
  { x1: 85, y1: 70, x2: 25, y2: 15, x3: 55, y3: 85 },
  { x1: 35, y1: 25, x2: 90, y2: 65, x3: 10, y3: 45 },
  { x1: 60, y1: 90, x2: 40, y2: 20, x3: 80, y3: 75 },
  { x1: 25, y1: 60, x2: 85, y2: 90, x3: 45, y3: 30 },
  { x1: 75, y1: 35, x2: 15, y2: 75, x3: 95, y3: 50 },
  { x1: 50, y1: 15, x2: 70, y2: 55, x3: 30, y3: 95 },
  { x1: 90, y1: 50, x2: 20, y2: 90, x3: 65, y3: 20 },
  { x1: 40, y1: 75, x2: 80, y2: 10, x3: 10, y3: 80 },
  { x1: 65, y1: 40, x2: 35, y2: 80, x3: 85, y3: 60 },
  { x1: 30, y1: 85, x2: 75, y2: 25, x3: 50, y3: 70 },
  { x1: 80, y1: 60, x2: 45, y2: 95, x3: 20, y3: 35 },
  { x1: 55, y1: 30, x2: 90, y2: 70, x3: 35, y3: 10 },
  { x1: 10, y1: 70, x2: 60, y2: 40, x3: 85, y3: 85 },
  { x1: 75, y1: 85, x2: 25, y2: 50, x3: 95, y3: 15 },
  { x1: 45, y1: 55, x2: 85, y2: 85, x3: 15, y3: 25 },
  { x1: 95, y1: 25, x2: 40, y2: 75, x3: 70, y3: 95 },
  { x1: 20, y1: 95, x2: 85, y2: 35, x3: 50, y3: 65 },
  { x1: 70, y1: 65, x2: 30, y2: 95, x3: 90, y3: 40 },
  { x1: 35, y1: 75, x2: 80, y2: 45, x3: 25, y3: 85 },
  { x1: 85, y1: 40, x2: 50, y2: 80, x3: 75, y3: 20 },
  { x1: 60, y1: 20, x2: 15, y2: 60, x3: 95, y3: 90 }
]

// Array de iconos SVG de fisioterapia (solo los de la carpeta svgs + calendario y check)
const customIcons = [
  // Icono de corazón (heart-svgrepo-com.svg)
  {
    type: 'path',
    viewBox: '0 0 16 16',
    paths: ['M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z']
  },
  // Icono de reloj (clock-ten-svgrepo-com.svg)
  {
    type: 'path',
    viewBox: '0 0 24 24',
    paths: ['M12 7V12L9.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z']
  },
  // Icono de flor de loto (flower-lotus-bold-svgrepo-com.svg)
  {
    type: 'path',
    viewBox: '0 0 256 256',
    paths: ['M253.32227,119.28906a19.78829,19.78829,0,0,0-12.315-9.35058,82.35031,82.35031,0,0,0-23.65478-2.353,88.67788,88.67788,0,0,0-3.40479-37.68506,19.956,19.956,0,0,0-23.18017-13.38281,85.34118,85.34118,0,0,0-23.69629,9.04931,97.67861,97.67861,0,0,0-27.08008-31.96826,19.91926,19.91926,0,0,0-23.98242.001A97.66711,97.66711,0,0,0,88.92871,65.56689a85.3566,85.3566,0,0,0-23.69336-9.04931A19.95461,19.95461,0,0,0,42.05176,69.90039a88.68024,88.68024,0,0,0-3.4043,37.68506,82.39112,82.39112,0,0,0-23.65527,2.353A19.95839,19.95839,0,0,0,.7373,134.62891c3.70264,13.24023,14.99122,38.38281,48.99024,58.01269C83.20312,211.96777,112.26465,212,127.91992,212c.02295,0,.04541.00293.06836.00293L128,212.00244l.01172.00049c.023,0,.04541-.00293.06836-.00293,15.65478,0,44.7168-.03223,78.19238-19.3584,33.999-19.62988,45.2876-44.77246,48.99024-58.01172A19.79061,19.79061,0,0,0,253.32227,119.28906ZM192.15039,80.89355c2.08936,8.30323,3.32568,21.084-1.3584,37.00977-.09912.29688-.189.59668-.26465.90137a100.52915,100.52915,0,0,1-9.207,20.84179c-1.24414,2.15577-2.55761,4.23487-3.916,6.25391A126.12764,126.12764,0,0,0,180,120a122.4842,122.4842,0,0,0-4.03955-31.82568A64.21211,64.21211,0,0,1,192.15039,80.89355ZM128,54.69336C137.97656,62.94922,156,82.99609,156,120c0,37.42969-18.30469,57.40723-28,65.3623-9.69531-7.95507-28-27.93261-28-65.3623C100,82.99316,118.02441,62.94727,128,54.69336ZM63.84961,80.89355a64.21735,64.21735,0,0,1,16.18994,7.28077A122.4842,122.4842,0,0,0,76,120a126.12764,126.12764,0,0,0,2.5957,25.90039c-1.3584-2.019-2.67187-4.09814-3.916-6.25391a100.51226,100.51226,0,0,1-9.207-20.84326c-.07569-.30322-.165-.60156-.26416-.897C60.52393,101.97852,61.76025,89.19678,63.84961,80.89355ZM25.19971,132.292a63.91376,63.91376,0,0,1,19.48193-.0957,128.53727,128.53727,0,0,0,9.21289,19.45019,139.43272,139.43272,0,0,0,19.79883,26.28711,124.14157,124.14157,0,0,1-11.96582-6.07714C38.49854,158.44531,29.03955,142.57617,25.19971,132.292Zm169.07275,39.56446a124.16138,124.16138,0,0,1-11.91308,6.05371,139.11847,139.11847,0,0,0,19.74609-26.26368,128.52828,128.52828,0,0,0,9.21338-19.45117,63.85844,63.85844,0,0,1,19.48144.09668C226.96045,142.57617,217.50146,158.44531,194.27246,171.85645Z']
  },
  // Icono médico de fisioterapia
  {
    type: 'path',
    viewBox: '0 0 64 64',
    paths: ['M55.549.311H8.765C4.181.311.451 4.041.451 8.627v46.78c0 4.586 3.729 8.317 8.314 8.317h46.784c4.584 0 8.315-3.731 8.315-8.317V8.627c0-4.586-3.731-8.316-8.315-8.316zM30.992 10.667a4.631 4.631 0 0 1 4.638 4.627a4.633 4.633 0 0 1-4.638 4.629a4.635 4.635 0 0 1-4.638-4.629a4.632 4.632 0 0 1 4.638-4.627zm-6.826 11.552c.404-.401 1.328-1.065 3.069-1.065h6.257c3.554 0 4.239 3.544 3.511 5.377l-3.272 7.935c-.201.456-.58.822-1.053.993l-7.167 2.639c-.919.4-1.99-.016-2.392-.933c-.404-.92.014-1.99.934-2.392l6.612-2.483l2.044-4.873l-1.331-.492l-1.737 4.173l-5.033 1.854V27.85l-4.92 5.374l-5.568-.006s9.744-10.68 10.048-11zM37.21 39.503h-6.281l-1.373-1.362l3.721-1.38a2.97 2.97 0 0 0 1.786-1.857c.012-.021.031-.034.042-.058l2.102-4.956l.004 9.614zM8.964 45.159l15.862-1.275l-3.073-4.65h-7.748c-1.266 0-2.295-.989-2.295-2.254a2.287 2.287 0 0 1 2.295-2.281s7.61-.012 7.877 0c-.597.812-.647 1.925-.289 2.923c.607 1.607 2.575 2.489 4.192 1.911l2.18-.803l3.131 3.057h12.987a3.952 3.952 0 0 1 3.959 3.952a3.947 3.947 0 0 1-3.929 3.946l-14.088-.002a1.715 1.715 0 0 1 .035-3.432h7.282l5.929-1.239l-.32-1.533l-5.771 1.205h-7.12a3.287 3.287 0 0 0-3.284 3.284c0 .63.187 1.213.496 1.713l-17.795-.002a2.29 2.29 0 0 1-.512-4.522zm46.271 10.008H8.94c-1.818 0-1.724-1.77-1.724-1.77v-1.362s-.107-.819.934-.819h36.974c2.946 0 4.225-2.744 5.771-2.744h4.512c1.404 0 1.559 1.193 1.559 1.193v3.773s.099 1.729-1.731 1.729zm-2.338-8.143a4.175 4.175 0 0 1-4.178-4.168a4.171 4.171 0 0 1 4.178-4.17a4.175 4.175 0 0 1 4.182 4.17c0 2.3-1.877 4.168-4.182 4.168z']
  },
  // Icono de calendario
  {
    type: 'path',
    viewBox: '0 0 24 24',
    paths: ['M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z']
  },
  // Icono de check en círculo
  {
    type: 'path',
    viewBox: '0 0 24 24',
    paths: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z']
  }
]

export default function LoginPage() {
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { login, isAuthenticated, user } = useAuth()

  // Solo mostrar animaciones después del montaje del cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = {
        ADMIN: '/admin',
        GERENTE: '/gerente',
        PROFESIONAL: '/profesional',
        ADMINISTRATIVO: '/administrativo'
      }

      const redirectTo = roleRoutes[user.rol as keyof typeof roleRoutes] || '/administrativo'
      window.location.href = redirectTo
    }
  }, [isAuthenticated, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(dni, password)

    if (!result.success) {
      setError(result.error || 'Error de login')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Background minimalista animado - solo en 1/4 izquierdo */}
      <div className="absolute inset-0 w-1/4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Círculos flotantes minimalistas */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-[#0C645A]/5 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-32 w-96 h-96 bg-[#0C645A]/3 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        <motion.div
          className="absolute bottom-32 left-2/4 w-80 h-80 bg-[#0C645A]/4 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 3.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />

        {/* Líneas geométricas sutiles */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-1/4 left-0 w-px h-40 bg-gradient-to-b from-transparent via-[#0C645A]/10 to-transparent"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-3/4 right-2/4 w-32 h-px bg-gradient-to-r from-transparent via-[#0C645A]/10 to-transparent"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          />
        </div>
      </div>

      {/* Panel verde que ocupa 3/4 de la pantalla */}
      <div className="absolute inset-0 w-3/4 ml-auto bg-gradient-to-br from-[#0C645A] to-[#0a5249]">
        {/* Animación de iconos flotantes del SVG - por todo el fondo derecho */}
        {mounted && (
          <div className="absolute inset-0 w-full h-full opacity-15 hidden lg:block">
            {/* Grid de iconos animados - usando todas las posiciones */}
            {iconPositions.map((pos, i) => {
              // Selecciona un icono del array customIcons de forma cíclica
              const iconData = customIcons[i % customIcons.length];
              
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${pos.x1}%`,
                    top: `${pos.y1}%`,
                  }}
                  animate={{
                    x: [`0%`, `${(pos.x2 - pos.x1) * 0.8}%`, `${(pos.x3 - pos.x1) * 0.8}%`, `0%`],
                    y: [`0%`, `${(pos.y2 - pos.y1) * 0.8}%`, `${(pos.y3 - pos.y1) * 0.8}%`, `0%`],
                    opacity: [0, 0.5, 1, 0.5, 0],
                    scale: [0.5, 1, 1.5, 1, 0.5],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 15 + (i % 4) * 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (i % 6) * 1.2
                  }}
                >
                  {/* Renderizado dinámico de iconos */}
                  <svg width="80" height="80" viewBox={iconData.viewBox} fill="currentColor" className="text-white">
                    {(iconData.type === 'path' || iconData.type === 'multiPath') && 'paths' in iconData && (
                      iconData.paths.map((pathData, pathIndex) => (
                        <path key={pathIndex} d={pathData} />
                      ))
                    )}
                  </svg>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contenido de texto e iconos - 1/4 izquierdo */}
      <motion.div
        className="hidden lg:flex lg:w-1/4 relative z-20 items-center justify-center p-8 bg-white"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center text-[#0C645A]">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <img
              src="/isologo-fc-teal.png"
              alt="FisioCore"
              className="h-100 w-auto mx-auto mb-4 object-contain"
            />
            <motion.div
              className="w-16 h-1 bg-[#0C645A] mx-auto mb-4"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <p className="text-lg text-gray-600 leading-relaxed">
              Sistema de Gestión Integral para Centros de Rehabilitación Física
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4 mt-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {[
              { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Gestión de Pacientes" },
              { icon: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z", label: "Agenda de Turnos" },
              { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", label: "Historia Clínica" },
              { icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z", label: "Reportes" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-[#0C645A]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={item.icon}/>
                  </svg>
                </div>
                <p className="text-xs text-gray-600">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Formulario - 3/4 derecho */}
      <div className="w-full lg:w-3/4 lg:ml-auto relative z-10">
        {/* Formulario centrado con efecto glass */}
        <motion.div
          className="flex items-center justify-center h-full p-6 lg:p-12"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Contenedor del formulario con fondo glass */}
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
              <div className="w-full">
                {/* Logo móvil */}
                <motion.div
                  className="lg:hidden text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2">FisioCore</h1>
                  <p className="text-green-100">Sistema de Gestión Médica</p>
                </motion.div>

                {/* Encabezado del formulario */}
                <motion.div
                  className="text-center lg:text-left mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    Iniciar Sesión
                  </h2>
                  <p className="text-green-100">
                    Ingresa tus credenciales para acceder al sistema
                  </p>
                </motion.div>

                {/* Formulario */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className='inputsdellogin'>
                    <label htmlFor="dni" className="block text-sm font-medium text-white mb-2">
                      DNI
                    </label>
                    <input
                      id="dni"
                      name="dni"
                      type="text"
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-white placeholder-white backdrop-blur-sm"
                      placeholder="Ingresa tu DNI"
                    />
                  </div>

                  <div className='inputsdellogin'>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-white placeholder-white placeholder-opacity-100 backdrop-blur-sm"
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 p-4 rounded-lg backdrop-blur-sm">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-200">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Iniciando sesión...
                      </div>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </motion.button>
                </motion.form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}