import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const especialidades = await prisma.especialidades.findMany({
      select: {
        id_especialidad: true,
        nombre_especialidad: true,
      },
      orderBy: {
        nombre_especialidad: 'asc',
      },
    });

    return NextResponse.json(especialidades);
  } catch (error) {
    console.error('Error fetching especialidades:', error);
    return NextResponse.json(
      { error: 'Error al obtener las especialidades' },
      { status: 500 }
    );
  } finally {
  }
}
