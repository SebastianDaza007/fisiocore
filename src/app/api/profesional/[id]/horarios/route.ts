import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profesionalId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const diaId = searchParams.get('diaId');

    if (!diaId) {
      return NextResponse.json(
        { error: 'Falta el parámetro diaId' },
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
