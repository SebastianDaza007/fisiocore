import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const obrasSociales = await prisma.obras_sociales.findMany({
      select: {
        id_obra_social: true,
        nombre_obra_social: true,
      },
      orderBy: {
        nombre_obra_social: 'asc',
      },
    });

    return NextResponse.json(obrasSociales);
  } catch (error) {
    console.error('Error fetching obras sociales:', error);
    return NextResponse.json(
      { error: 'Error al obtener las obras sociales' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
