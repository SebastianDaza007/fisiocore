import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profesionalId = parseInt(id);

    if (isNaN(profesionalId)) {
      return NextResponse.json(
        { error: 'ID de profesional inválido' },
        { status: 400 }
      );
    }

    // Obtener todos los días laborables del profesional
    const horarios = await prisma.horarios_profesionales.findMany({
      where: {
        profesional_id: profesionalId,
      },
      select: {
        dia_semana_id: true,
      },
      distinct: ['dia_semana_id'],
    });

    // Extraer los IDs de días únicos
    const dias = horarios.map(h => h.dia_semana_id);

    return NextResponse.json({ dias });
  } catch (error) {
    console.error('Error al obtener días laborables del profesional:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
