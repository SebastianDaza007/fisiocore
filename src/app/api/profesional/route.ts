import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// -------------------- GET: lista de profesionales --------------------
export async function GET() {
  try {
    const profesionales = await prisma.profesionales.findMany({
      select: {
        id_profesional: true,
        matricula_profesional: true,
        usuarios: {
          select: {
            nombre_usuario: true,
            apellido_usuario: true,
            dni_usuario: true,
            email_usuario: true,
          },
        },
        especialidades: {
          select: {
            nombre_especialidad: true,
          },
        },
        horarios_profesionales: {
          select: {
            dias_semana: {
              select: {
                nombre_dia: true,
              },
            },
            hora_inicio: true,
            hora_fin: true,
            duracion_turno: true,
          },
        },
        profesionales_por_obras_sociales: {
          select: {
            obras_sociales: {
              select: {
                nombre_obra_social: true,
              },
            },
          },
        },
      },
      orderBy: { id_profesional: 'desc' },
    });

    // Agregar estado computado y convertir horas a string
    const profesionalesConEstado = profesionales.map(profesional => ({
      ...profesional,
      estado: profesional.horarios_profesionales.length > 0 ? 'Activo' : 'Inactivo',
      horarios_profesionales: profesional.horarios_profesionales.map(horario => {
        // Extraer solo la parte de tiempo en formato HH:mm:ss
        const formatTimeToString = (time: Date | string): string => {
          if (typeof time === 'string') return time;
          if (time instanceof Date) {
            const hours = time.getUTCHours().toString().padStart(2, '0');
            const minutes = time.getUTCMinutes().toString().padStart(2, '0');
            const seconds = time.getUTCSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
          }
          return '00:00:00';
        };

        return {
          ...horario,
          hora_inicio: formatTimeToString(horario.hora_inicio),
          hora_fin: formatTimeToString(horario.hora_fin),
        };
      })
    }));

    return NextResponse.json(profesionalesConEstado);
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}