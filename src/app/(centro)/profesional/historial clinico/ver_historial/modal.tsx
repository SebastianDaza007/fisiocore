'use client';

import { useState, useEffect } from 'react';
import { IdentificationIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Accordion, AccordionTab } from 'primereact/accordion';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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

interface RegistroClinicoHistorico {
  id_registro: number;
  fecha_registro: string;
  texto_comentario: string;
  texto_indicacion: string;
  profesionales: ProfesionalInfo;
  turnos: {
    fecha_turno: string;
    tipos_consulta: {
      nombre_tipo_consulta: string;
    };
  };
}

interface VerHistorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  pacienteInfo: PacienteInfo;
}

export const VerHistorialDialog: React.FC<VerHistorialDialogProps> = ({
  isOpen,
  onClose,
  pacienteId,
  pacienteInfo
}) => {
  const [registros, setRegistros] = useState<RegistroClinicoHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | number[]>(0);

  // Función para obtener el color de la obra social
  const getObraSocialClass = (obraSocial: string | undefined) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white";
    
    if (!obraSocial) {
      return `${baseClasses} bg-gray-500`;
    }
    
    const obraSocialLower = obraSocial.toLowerCase();
    
    if (obraSocialLower.includes('osde')) {
      return `${baseClasses} bg-yellow-500`;
    } else if (obraSocialLower.includes('particular') || obraSocialLower.includes('privada')) {
      return `${baseClasses} bg-blue-500`;
    } else if (obraSocialLower.includes('swiss')) {
      return `${baseClasses} bg-red-500`;
    } else if (obraSocialLower.includes('galeno')) {
      return `${baseClasses} bg-green-500`;
    } else {
      return `${baseClasses} bg-indigo-500`;
    }
  };

  // Fetch historial del paciente
  useEffect(() => {
    const fetchHistorial = async () => {
      if (!isOpen || !pacienteId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/historial_clinico/ver_historial/${pacienteId}`);
        if (!response.ok) throw new Error('Error al cargar el historial');
        
        const datosHistorial = await response.json();
        setRegistros(datosHistorial);
      } catch (err) {
        console.error('Error fetching historial:', err);
        setError('Error al cargar el historial clínico');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [isOpen, pacienteId]);

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

  // ✅ FUNCIONES DE FORMATO CORREGIDAS (VERSIÓN RECOMENDADA)
  const formatFecha = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString);
      
      // Extraer componentes en UTC y formatear manualmente
      const dia = String(fecha.getUTCDate()).padStart(2, '0');
      const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
      const año = fecha.getUTCFullYear();
      const hora = String(fecha.getUTCHours()).padStart(2, '0');
      const minuto = String(fecha.getUTCMinutes()).padStart(2, '0');
      
      return `${dia}/${mes}/${año} ${hora}:${minuto}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatFechaCorta = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString);
      
      // Extraer componentes en UTC
      const dia = String(fecha.getUTCDate()).padStart(2, '0');
      const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
      const año = fecha.getUTCFullYear();
      
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      return 'Fecha inválida';
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
          className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Historial Clínico</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
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
                    {pacienteInfo.nombre_paciente} {pacienteInfo.apellido_paciente}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI
                  </label>
                  <p className="text-gray-900">{pacienteInfo.dni_paciente}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {pacienteInfo.email_paciente || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <p className="text-gray-900">{pacienteInfo.telefono_paciente}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Obra Social
                  </label>
                  <div className={getObraSocialClass(pacienteInfo.obras_sociales?.nombre_obra_social)}>
                    {pacienteInfo.obras_sociales?.nombre_obra_social || 'No especificada'}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                <p>{error}</p>
              </div>
            )}

            {/* SEGUNDO BOX: Historial Clínico con Accordion */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                 <ClipboardDocumentIcon className="w-5 h-5" />
                Registros Clínicos
                {registros.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {registros.length} registros
                  </span>
                )}
              </h3>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="flex items-center gap-2 text-gray-500">
                    <i className="pi pi-spin pi-spinner"></i>
                    Cargando historial...
                  </div>
                </div>
              ) : registros.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <i className="pi pi-file text-3xl mb-2 block"></i>
                  No hay registros clínicos para este paciente
                </div>
              ) : (
                <div className="space-y-4">
                  <Accordion 
                    activeIndex={activeIndex} 
                    onTabChange={(e) => setActiveIndex(e.index)}
                    multiple={false}
                  >
                    {registros.map((registro, index) => (
                      <AccordionTab 
                        key={registro.id_registro}
                        header={
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                              <div className="flex items-center gap-2">
                                <i className="pi pi-calendar text-blue-500"></i>
                                <span className="font-semibold text-gray-900">
                                  {formatFechaCorta(registro.turnos.fecha_turno)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="pi pi-tag text-green-500"></i>
                                <span className="text-gray-600">
                                  {registro.turnos.tipos_consulta.nombre_tipo_consulta}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="pi pi-user text-purple-500"></i>
                                <span className="text-gray-500">
                                   {registro.profesionales.usuarios.nombre_usuario} {registro.profesionales.usuarios.apellido_usuario}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 hidden md:block">
                                {activeIndex === index ? 'Ocultar' : 'Ver detalles'}
                              </span>
                              <i className={`pi pi-chevron-down transition-transform ${activeIndex === index ? 'rotate-180' : ''}`}></i>
                            </div>
                          </div>
                        }
                      >
                        <div className="p-4 space-y-4 bg-white rounded-lg">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <i className="pi pi-comment text-blue-500"></i>
                              <h4 className="font-semibold text-gray-700">Observaciones</h4>
                            </div>
                            <p className="text-gray-800 bg-blue-50 p-4 rounded-lg border border-blue-100">
                              {registro.texto_comentario}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <i className="pi pi-info-circle text-green-500"></i>
                              <h4 className="font-semibold text-gray-700">Indicaciones</h4>
                            </div>
                            <p className="text-gray-800 bg-green-50 p-4 rounded-lg border border-green-100">
                              {registro.texto_indicacion}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                              <i className="pi pi-clock mr-1"></i>
                               Fecha de la consulta: {formatFecha(registro.turnos.fecha_turno)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{registro.id_registro}
                            </div>
                          </div>
                        </div>
                      </AccordionTab>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};