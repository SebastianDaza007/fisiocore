'use client';

import { useState, useEffect } from 'react';
import { IdentificationIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface PacienteInfo {
  id_paciente: number;
  nombre_paciente: string;
  apellido_paciente: string;
  dni_paciente: string;
  email_paciente?: string;
  telefono_paciente: string;
  obras_sociales: {
    nombre_obra_social: string;
  };
}

interface UsuarioInfo {
  nombre_usuario: string;
  apellido_usuario: string;
}

interface ProfesionalInfo {
  id_profesional: number;
  usuarios: UsuarioInfo;
}

interface TurnoParaCompletar {
  id_turno: number;
  pacientes: PacienteInfo;
  profesionales: ProfesionalInfo;
}

interface CompletarTurnoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: number | null;
  onTurnoCompletado: () => void;
}

export const CompletarTurnoDialog: React.FC<CompletarTurnoDialogProps> = ({
  isOpen,
  onClose,
  turnoId,
  onTurnoCompletado
}) => {
  const [turno, setTurno] = useState<TurnoParaCompletar | null>(null);
  const [formData, setFormData] = useState({
    texto_comentario: '',
    texto_indicacion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const getObraSocialClass = (obraSocial: string | undefined) => {
  const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white";
  
  if (!obraSocial) {
    return `${baseClasses} bg-gray-500`;
  }
  
  const obraSocialLower = obraSocial.toLowerCase();
  
  if (obraSocialLower.includes('osde')) {
    return `${baseClasses} bg-yellow-500`; // OSDE - Amarillo
  } else if (obraSocialLower.includes('particular') || obraSocialLower.includes('privada')) {
    return `${baseClasses} bg-blue-500`; // Particular - Azul
  } else if (obraSocialLower.includes('swiss')) {
    return `${baseClasses} bg-red-500`; // Swiss Medical - Rojo
  } else if (obraSocialLower.includes('galeno')) {
    return `${baseClasses} bg-green-500`; // Galeno - Verde
  } else if (obraSocialLower.includes('omint')) {
    return `${baseClasses} bg-purple-500`; // Omint - Púrpura
  } else if (obraSocialLower.includes('medifé')) {
    return `${baseClasses} bg-orange-500`; // Medifé - Naranja
  } else if (obraSocialLower.includes('sancor')) {
    return `${baseClasses} bg-teal-500`; // Sancor - Verde azulado
  } else {
    return `${baseClasses} bg-indigo-500`; // Otras - Azul índigo
  }
};
  // Fetch datos del turno
  useEffect(() => {
    const fetchTurno = async () => {
      if (!isOpen || !turnoId) return;
      
      setFetching(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/turnos/${turnoId}`);
        if (!response.ok) throw new Error('Error al cargar datos del turno');
        
        const turnoData = await response.json();
        setTurno(turnoData);
      } catch (err) {
        console.error('Error fetching turno:', err);
        setError('Error al cargar los datos del turno');
      } finally {
        setFetching(false);
      }
    };

    fetchTurno();
  }, [isOpen, turnoId]);

  // Resetear form cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setFormData({
        texto_comentario: '',
        texto_indicacion: ''
      });
      setError(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación - ambos campos requeridos
    if (!formData.texto_comentario.trim() || !formData.texto_indicacion.trim()) {
      setError('Ambos campos son obligatorios');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 1. Completando turno ID:', turnoId);
      
      // 1. Completar el turno
      const resCompletar = await fetch(`/api/turnos/${turnoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_turno_id: 3 })  
      });

      console.log('🔍 2. Status respuesta turno:', resCompletar.status);
      
      if (!resCompletar.ok) {
        const errorText = await resCompletar.text();
        console.error('🔍 3. Error respuesta turno:', errorText);
        throw new Error('Error al completar el turno');
      }

      console.log('🔍 4. Turno completado OK');

      // 2. Crear registro clínico
      console.log('🔍 5. Creando registro clínico con:', {
        paciente_id: turno?.pacientes.id_paciente,
        turno_id: turnoId,
        profesional_id: turno?.profesionales.id_profesional,
        texto_comentario: formData.texto_comentario.trim(),
        texto_indicacion: formData.texto_indicacion.trim()
      });

      const resRegistro = await fetch('/api/historial_clinico/finalizar_turno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: turno?.pacientes.id_paciente,
          turno_id: turnoId,
          profesional_id: turno?.profesionales.id_profesional,
          texto_comentario: formData.texto_comentario.trim(),
          texto_indicacion: formData.texto_indicacion.trim()
        })
      });

      console.log('🔍 6. Status registro clínico:', resRegistro.status);

      if (!resRegistro.ok) {
        const errorText = await resRegistro.text();
        console.error('🔍 7. Error registro clínico:', errorText);
        throw new Error('Error al guardar el registro clínico');
      }

      console.log('🔍 8. Registro clínico creado OK');

      // Éxito - cerrar modal y notificar
      onTurnoCompletado();
      onClose();
      
    } catch (err) {
      console.error('❌ Error completo al completar turno:', err);
      setError('Error al completar el turno. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <div 
          className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Completar Turno</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            {fetching ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Cargando datos del turno...</div>
              </div>
            ) : error && !turno ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>{error}</p>
              </div>
            ) : turno ? (
              <>
                {/* PRIMER BOX: Información Personal */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <IdentificationIcon className="w-5 h-5" />
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <p className="text-gray-900 font-medium">
                        {turno.pacientes.nombre_paciente} {turno.pacientes.apellido_paciente}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DNI
                      </label>
                      <p className="text-gray-900">{turno.pacientes.dni_paciente}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {turno.pacientes.email_paciente || 'No especificado'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <p className="text-gray-900">{turno.pacientes.telefono_paciente}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Obra Social
                      </label>
                      <p className={getObraSocialClass(turno.pacientes.obras_sociales?.nombre_obra_social)}>
                        {turno.pacientes.obras_sociales?.nombre_obra_social || 'No especificada'}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                    <p>{error}</p>
                  </div>
                )}

                {/* SEGUNDO BOX: Registro Clínico */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                     <ClipboardDocumentIcon className="w-5 h-5" />
                    Registro Clínico
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Observaciones */}
                    <div>
                      <label htmlFor="texto_comentario" className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones de la Consulta *
                      </label>
                      <div className="flex gap-4">
                        <textarea
                          id="texto_comentario"
                          name="texto_comentario"
                          value={formData.texto_comentario}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                          placeholder="Paciente llegó tarde, presenta mejorías de movilidad con dolor en la zona lumbar..."
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {formData.texto_comentario.length} caracteres
                      </div>
                    </div>

                    {/* Indicaciones */}
                    <div>
                      <label htmlFor="texto_indicacion" className="block text-sm font-medium text-gray-700 mb-2">
                        Indicaciones al Paciente *
                      </label>
                      <div className="flex gap-4">
                        <textarea
                          id="texto_indicacion"
                          name="texto_indicacion"
                          value={formData.texto_indicacion}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                          placeholder="Realizar ejercicios de rotación 3 veces al día y aplicar hielo 15 minutos después de cada sesión..."
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {formData.texto_indicacion.length} caracteres
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.texto_comentario.trim() || !formData.texto_indicacion.trim()}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Completando...
                          </span>
                        ) : (
                          'Completar Turno'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No se pudo cargar la información del turno
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};