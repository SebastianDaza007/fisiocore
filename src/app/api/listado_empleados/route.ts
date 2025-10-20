import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener empleados (usuarios que NO son profesionales)
    // Un usuario es empleado si NO tiene registro en la tabla profesionales
    const empleados = await prisma.usuarios.findMany({
      where: {
        profesionales: null  // Filtrar usuarios que NO tienen relación con profesionales
      },
      include: {
        roles: true,
        turnos: {
          select: {
            id_turno: true,
            fecha_turno: true,
          },
          take: 5,
          orderBy: {
            fecha_turno: 'desc'
          }
        }
      },
      orderBy: [
        { apellido_usuario: 'asc' },
        { nombre_usuario: 'asc' }
      ]
    });

    // Mapear datos para incluir estado (activo por defecto, podría mejorarse)
    const empleadosConEstado = empleados.map(empleado => ({
      ...empleado,
      estado: 'Activo', // Por defecto activo, se puede agregar campo a la BD después
      cantidadTurnos: empleado.turnos.length
    }));

    return NextResponse.json(empleadosConEstado);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return NextResponse.json(
      { error: 'Error al obtener la lista de empleados' },
      { status: 500 }
    );
  }
}
