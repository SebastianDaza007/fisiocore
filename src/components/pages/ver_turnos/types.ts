export type Turno = {
  id: number;
  pacienteDni: string;
  pacienteNombre: string;
  pacienteId?: number;
  profesionalId?: number;
  hora: string; // HH:mm
  especialidad: string;
  profesional: string;
  tipoConsulta: string;
  obraSocial: string;
  estado: string; // 👈 agregado
};
