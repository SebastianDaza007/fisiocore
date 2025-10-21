import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Función helper para formatear hora desde DateTime
function formatearHora(horaTurno: Date): string {
  const hora = new Date(horaTurno);
  const horas = hora.getHours().toString().padStart(2, '0');
  const minutos = hora.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

// Función helper para combinar fecha y hora
function combinarFechaHora(fecha: Date, hora: Date): Date {
  const horaTurno = new Date(hora);
  const fechaHoraTurno = new Date(fecha);
  fechaHoraTurno.setHours(horaTurno.getHours(), horaTurno.getMinutes(), 0, 0);
  return fechaHoraTurno;
}

export async function GET() {
  try {
    // Obtener fecha actual (solo día, sin hora)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Turnos del día
    const turnosHoy = await prisma.turnos.findMany({
      where: {
        fecha_turno: {
          gte: hoy,
          lt: manana,
        },
      },
      include: {
        pacientes: true,
        estados_turno: true,
        profesionales: {
          include: {
            usuarios: true,
          },
        },
      },
    });

    // Total de turnos hoy
    const totalTurnosHoy = turnosHoy.length;

    // Pacientes únicos hoy
    const pacientesUnicos = new Set(turnosHoy.map(t => t.paciente_id));
    const totalPacientesHoy = pacientesUnicos.size;

    // Turnos cancelados o en espera
    const canceladosOPendientes = turnosHoy.filter(
      t => t.estados_turno?.nombre_estado_turno === "CANCELADO" ||
           t.estados_turno?.nombre_estado_turno === "EN ESPERA"
    ).length;

    // Alertas: turnos próximos en los próximos 30 minutos que aún no están atendidos
    const ahora = new Date();
    const en30Minutos = new Date(ahora.getTime() + 30 * 60 * 1000);

    const alertas = turnosHoy.filter(t => {
      if (!t.hora_turno ||
          t.estados_turno?.nombre_estado_turno === "ATENDIDO" ||
          t.estados_turno?.nombre_estado_turno === "CANCELADO") {
        return false;
      }

      // Combinar fecha y hora del turno
      const fechaHoraTurno = combinarFechaHora(t.fecha_turno, t.hora_turno);

      // Verificar si está en los próximos 30 minutos
      return fechaHoraTurno >= ahora && fechaHoraTurno <= en30Minutos;
    }).length;

    // Recordatorios: próximos 3 turnos del día
    const proximosTurnos = turnosHoy
      .filter(t => {
        if (!t.hora_turno ||
            t.estados_turno?.nombre_estado_turno === "ATENDIDO" ||
            t.estados_turno?.nombre_estado_turno === "CANCELADO") {
          return false;
        }

        const fechaHoraTurno = combinarFechaHora(t.fecha_turno, t.hora_turno);
        return fechaHoraTurno >= ahora;
      })
      .sort((a, b) => {
        if (!a.hora_turno || !b.hora_turno) return 0;
        return new Date(a.hora_turno).getTime() - new Date(b.hora_turno).getTime();
      })
      .slice(0, 3)
      .map(t => ({
        id: t.id_turno,
        texto: `Turno ${formatearHora(t.hora_turno!)} - ${t.pacientes.nombre_paciente} ${t.pacientes.apellido_paciente}`,
        icon: "pi pi-clock",
      }));

    // Sala de espera: todos los pacientes en estado EN_ESPERA del día
    // (sin filtro de hora - para fines demostrativos)
    const pacientesEnEspera = turnosHoy
      .filter(t => t.estados_turno?.nombre_estado_turno === "EN ESPERA" && t.hora_turno)
      .sort((a, b) => {
        if (!a.hora_turno || !b.hora_turno) return 0;
        return new Date(a.hora_turno).getTime() - new Date(b.hora_turno).getTime();
      });

    const alertasImportantes = pacientesEnEspera.length > 0
      ? pacientesEnEspera.map((t, index) => ({
          id: t.id_turno,
          texto: `${index + 1}. ${t.pacientes.nombre_paciente} ${t.pacientes.apellido_paciente} - Turno ${formatearHora(t.hora_turno!)}`,
          icon: "pi pi-user",
        }))
      : [];

    // Profesionales disponibles hoy (que tienen turnos hoy)
    const profesionalesHoy = Array.from(
      new Set(
        turnosHoy
          .filter(t => t.profesionales)
          .map(t => `${t.profesionales?.usuarios?.nombre_usuario} ${t.profesionales?.usuarios?.apellido_usuario}`)
      )
    );

    return NextResponse.json({
      resumen: {
        turnosHoy: totalTurnosHoy,
        pacientesHoy: totalPacientesHoy,
        canceladosOPendientes,
        alertas,
      },
      recordatorios: proximosTurnos,
      alertasImportantes,
      profesionalesHoy,
    });

  } catch (error) {
    console.error("Error al obtener resumen del día:", error);
    return NextResponse.json(
      { error: "Error al obtener resumen del día" },
      { status: 500 }
    );
  }
}
