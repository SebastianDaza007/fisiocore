"use client";

import { useState } from 'react';
import { RegistrarPacienteDialog } from './Modal';

export default function GestionPacientesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePacienteRegistrado = () => {
    console.log('Paciente registrado exitosamente');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Solo el botón centrado */}
      <button 
        onClick={() => setIsDialogOpen(true)}
        className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <span className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Nuevo Paciente
        </span>
      </button>

      {/* Modal */}
      <RegistrarPacienteDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onPacienteRegistrado={handlePacienteRegistrado}
      />
    </div>
  );
}