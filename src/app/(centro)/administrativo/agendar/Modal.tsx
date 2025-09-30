'use client';

import { useState, useEffect } from 'react';
import { formStyles } from './paciente_estilos';

interface ObraSocial {
  id_obra_social: number;
  nombre_obra_social: string;
}

interface RegistrarPacienteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPacienteRegistrado: () => void;
}


export const RegistrarPacienteDialog: React.FC<RegistrarPacienteDialogProps> = ({
  isOpen,
  onClose,
  onPacienteRegistrado
}) => {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    email: '',
    direccion: '',
    telefono: '',
    obraSocial: '',
  });

  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [loadingObras, setLoadingObras] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch obras sociales desde la base de datos
  useEffect(() => {
    const fetchObrasSociales = async () => {
      if (!isOpen) return;
      
      setLoadingObras(true);
      try {
        const response = await fetch('/api/obras_sociales');
        
        if (response.ok) {
          const data = await response.json();
          setObrasSociales(data);
        } else {
          console.error('Error fetching obras sociales:', response.status);
        }
      } catch (error) {
        console.error('Error fetching obras sociales:', error);
      } finally {
        setLoadingObras(false);
      }
    };

    fetchObrasSociales();
  }, [isOpen]);

  // Resetear form cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setFormData({
        dni: '', nombre: '', apellido: '', fechaNacimiento: '', 
        email: '', direccion: '', telefono: '', obraSocial: ''
      });
      setMessage(null);
    }
  }, [isOpen]);

  // Cerrar con ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getMinDate = () => '1900-01-01';
  const getMaxDate = () => new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'direccion' && value.length > 50) return;
    if (name === 'telefono' && value.length > 25) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    if (!formData.telefono.trim()) {
      setMessage({ type: 'error', text: 'El teléfono es requerido' });
      setLoading(false);
      return;
    }

    if (!formData.dni.trim()) {
      setMessage({ type: 'error', text: 'El DNI es requerido' });
      setLoading(false);
      return;
    }

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setMessage({ type: 'error', text: 'El nombre y apellido son requeridos' });
      setLoading(false);
      return;
    }

    if (!formData.fechaNacimiento) {
      setMessage({ type: 'error', text: 'La fecha de nacimiento es requerida' });
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/paciente', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: formData.dni,
          nombre: formData.nombre,
          apellido: formData.apellido,
          fechaNacimiento: formData.fechaNacimiento,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          obraSocial: formData.obraSocial
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: result.message || 'Paciente registrado exitosamente' 
        });
        
        setTimeout(() => {
          onPacienteRegistrado();
          onClose();
          window.location.reload();
        }, 2000);
        return;
      } 
      
      const clientError = response.status >= 400 && response.status < 500;
      const errorText = result?.error || (clientError
         ? 'Error de validación. Verifique los datos ingresados.' : `Error ${response.status}: ${response.statusText}`);
      
      setMessage({ type: 'error', text: errorText });
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error de conexión' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay que bloquea el fondo */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        {/* Contenedor del modal */}
        <div 
          className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // evita cerrar si hago click dentro
        >
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Paciente</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Complete todos los campos para registrar un nuevo paciente en el sistema.
            </p>
          </div>

          <div className="p-6">
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <p className="font-medium">{message.text}</p>
                {message.type === 'success' && (
                  <p className="text-sm mt-1 opacity-90">El modal se cerrará automáticamente...</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Línea 1: DNI */}
              <div>
                <label htmlFor="dni" className={formStyles.label}>
                  DNI *
                </label>
                <input 
                  type="text" 
                  id="dni" 
                  name="dni" 
                  value={formData.dni} 
                  onChange={handleChange} 
                  required 
                  className={formStyles.input}
                  placeholder="Ingrese el DNI (7-8 dígitos)"
                  maxLength={8}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 8);
                  }}
                />
                {formData.dni && (formData.dni.length < 7 || formData.dni.length > 8) && (
                  <p className="text-red-500 text-sm mt-1">El DNI debe tener 7 u 8 dígitos</p>
                )}
              </div>

              {/* Línea 2: Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className={formStyles.label}>Nombre *</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                    className={formStyles.input} 
                    placeholder="Ingrese el nombre" 
                    maxLength={40}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.nombre.length}/40
                  </div>
                </div>
                <div>
                  <label htmlFor="apellido" className={formStyles.label}>Apellido *</label>
                  <input 
                    type="text" 
                    id="apellido" 
                    name="apellido" 
                    value={formData.apellido} 
                    onChange={handleChange} 
                    required 
                    className={formStyles.input} 
                    placeholder="Ingrese el apellido" 
                    maxLength={40}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.apellido.length}/40
                  </div>
                </div>
              </div>

              {/* Línea 3: Fecha de Nacimiento */}
              <div>
                <label htmlFor="fechaNacimiento" className={formStyles.label}>
                  Fecha de Nacimiento *
                </label>
                <input 
                  type="date" 
                  id="fechaNacimiento" 
                  name="fechaNacimiento" 
                  value={formData.fechaNacimiento} 
                  onChange={handleChange} 
                  required 
                  min={getMinDate()} 
                  max={getMaxDate()} 
                  className={formStyles.input} 
                />
                {formData.fechaNacimiento && new Date(formData.fechaNacimiento) > new Date() && (
                  <p className="text-red-500 text-sm mt-1">La fecha no puede ser futura</p>
                )}
              </div>

              {/* Línea 4: Email */}
              <div>
                <label htmlFor="email" className={formStyles.label}>
                  Email <span className="text-gray-500 text-sm">(opcional)</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={formStyles.input} 
                  placeholder="paciente@email.com" 
                  maxLength={150}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.email.length}/150
                </div>
              </div>

              {/* Línea 5: Domicilio y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="direccion" className={formStyles.label}>
                    Domicilio
                  </label>
                  <input 
                    type="text" 
                    id="direccion" 
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange} 
                    className={formStyles.input} 
                    placeholder="Ingrese la dirección" 
                    maxLength={50}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.direccion.length}/50
                  </div>
                </div>
                <div>
                  <label htmlFor="telefono" className={formStyles.label}>
                    Teléfono * <span className="text-gray-500 text-sm">(max. 20 caracteres)</span>
                  </label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange} 
                    required 
                    className={formStyles.input} 
                    placeholder="Ingrese el teléfono" 
                    maxLength={20}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+-\s]/g, '');
                    }}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.telefono.length}/20
                  </div>
                </div>
              </div>

              {/* Línea 6: Obra Social desde Base de Datos */}
              <div>
                <label htmlFor="obraSocial" className={formStyles.label}>
                  Obra Social <span className="text-gray-500 text-sm">(opcional)</span>
                </label>
                <select 
                  id="obraSocial" 
                  name="obraSocial" 
                  value={formData.obraSocial} 
                  onChange={handleChange} 
                  className={formStyles.select}
                  disabled={loadingObras}
                >
                  <option value="">
                    {loadingObras ? 'Cargando obras sociales...' : 'Seleccione una obra social'}
                  </option>
                  {obrasSociales.map((obra) => ( 
                    <option key={obra.id_obra_social} value={obra.nombre_obra_social}>
                      {obra.nombre_obra_social}
                    </option> 
                  ))}
                </select>
                {loadingObras && (
                  <p className="text-sm text-gray-500 mt-1">Cargando opciones desde la base de datos...</p>
                )}
              </div>

              {/* Línea 7: Botones */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    'Registrar Paciente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
