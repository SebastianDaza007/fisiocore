import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para generar slots de horarios
function generarSlots(horaInicio: Date, horaFin: Date, duracion: number): string[] {
  const slots: string[] = [];
  const inicio = new Date(horaInicio);
  const fin = new Date(horaFin);

  while (inicio < fin) {
    const hh = inicio.getHours().toString().padStart(2, '0');
    const mm = inicio.getMinutes().toString().padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    inicio.setMinutes(inicio.getMinutes() + duracion);
  }

  return slots;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profesionalId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const diaId = searchParams.get('diaId');
    const fecha = searchParams.get('fecha'); // YYYY-MM-DD

    // Si viene fecha, generar horarios disponibles para ese día
    if (fecha) {
      const [year, month, day] = fecha.split('-').map(Number);
      const fechaSeleccionada = new Date(year, month - 1, day);
      const diaSemana = fechaSeleccionada.getDay(); // 0 = domingo, 1 = lunes, etc.

      // Convertir domingo (0) a 7 para coincidir con la BD
      const diaIdCalc = diaSemana === 0 ? 7 : diaSemana;

      // Buscar el horario del profesional para el día de la semana
      const horario = await prisma.horarios_profesionales.findFirst({
        where: {
          profesional_id: profesionalId,
          dia_semana_id: diaIdCalc,
        },
        select: {
          hora_inicio: true,
          hora_fin: true,
          duracion_turno: true,
        },
      });

      if (!horario) {
        return NextResponse.json({
          horarios: [],
          mensaje: 'El profesional no atiende este día'
        });
      }

      // Generar slots de horarios
      const slots = generarSlots(
        horario.hora_inicio,
        horario.hora_fin,
        horario.duracion_turno
      );

      // Obtener turnos ocupados para esta fecha
      const turnosOcupados = await prisma.turnos.findMany({
        where: {
          profesional_id: profesionalId,
          fecha_turno: fechaSeleccionada,
          estado_turno_id: { not: 4 }, // Excluir cancelados
        },
        select: {
          hora_turno: true,
        },
      });

      // Crear set de horas ocupadas
      const horasOcupadas = new Set(
        turnosOcupados.map(t => {
          const h = t.hora_turno.getHours().toString().padStart(2, '0');
          const m = t.hora_turno.getMinutes().toString().padStart(2, '0');
          return `${h}:${m}`;
        })
      );

      // Marcar disponibilidad
      const horarios = slots.map(hora => ({
        hora,
        disponible: !horasOcupadas.has(hora)
      }));

      return NextResponse.json({ horarios });
    }

    // Si viene diaId (modo legacy), devolver solo rangos
    if (!diaId) {
      return NextResponse.json(
        { error: 'Falta el parámetro diaId o fecha' },
        { status: 400 }
      );
    }

    // Buscar el horario del profesional para el día especificado
    const horario = await prisma.horarios_profesionales.findFirst({
      where: {
        profesional_id: profesionalId,
        dia_semana_id: parseInt(diaId),
      },
      select: {
        hora_inicio: true,
        hora_fin: true,
        duracion_turno: true,
      },
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'No hay horarios configurados para este día' },
        { status: 404 }
      );
    }

    return NextResponse.json(horario);
  } catch (error) {
    console.error('Error al obtener horarios del profesional:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
