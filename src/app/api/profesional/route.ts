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

    return NextResponse.json(profesionales);
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