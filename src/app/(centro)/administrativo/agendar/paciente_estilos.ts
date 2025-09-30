// Solo exporta estilos y configuraciones de diseño
export const formStyles = {
  container: "bg-white rounded-lg shadow border border-gray-200 p-6",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  fullWidth: "md:col-span-2",
  
  label: "block text-sm font-medium text-gray-700 mb-2",
  input: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white",
  textarea: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white",
  select: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white",
  
  button: {
    // Severity según el equipo
    primary: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed", // Azul
    secondary: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200", // Gris
    success: "px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed", // Verde
    info: "px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed", // Celeste
    help: "px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed", // Morado
    warning: "px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed", // Naranja
    danger: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200" // Rojo
  },
  
  message: {
    success: "bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6",
    error: "bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6"
  }
};

export const layoutStyles = {
  page: "p-6",
  title: "text-2xl font-bold mb-4 text-gray-700",
  description: "text-gray-700 mb-6",
  footer: "mt-6 p-4 bg-gray-100 rounded-lg text-gray-600 text-sm"
};

export const obrasSociales = [
  'OSDE',
  'Swiss Medical', 
  'Galeno',
  'Omint',
  'Medifé',
  'Sancor Salud',
  'OSPJN',
  'Otra'
];