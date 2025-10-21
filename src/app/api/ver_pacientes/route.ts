import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

// Prisma singleton para evitar crear múltiples conexiones en dev
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Tipo del paciente de Prisma
type PacienteWithRelations = {
  id_paciente: number;
  dni_paciente: string;
  nombre_paciente: string;
  apellido_paciente: string;
  sexo_paciente: string | null;
  fecha_nacimiento_paciente: Date;
  obras_sociales: { nombre_obra_social: string } | null;
  registros_clinicos: { id_registro: number }[];
};

// Utilidad para mapear paciente a la forma esperada por la UI
function mapPaciente(p: PacienteWithRelations) {
  return {
    id_paciente: p.id_paciente,
    dni_paciente: p.dni_paciente,
    nombre_paciente: p.nombre_paciente,
    apellido_paciente: p.apellido_paciente,
    sexo: p.sexo_paciente ?? null,
    fecha_nacimiento_paciente: p.fecha_nacimiento_paciente,
    obra_social: p.obras_sociales?.nombre_obra_social ?? null,
    numero_historial_clinico: p.registros_clinicos?.[0]?.id_registro ?? null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const sexo = searchParams.get('sexo');
    const especialidad = searchParams.get('especialidad');
    const tipoConsulta = searchParams.get('tipoConsulta');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10', 10), 1), 100);

    // Construcción dinámica del where usando tipo de Prisma
    const where: Prisma.pacientesWhereInput = { AND: [] };

    if (q) {
      (where.AND as Prisma.pacientesWhereInput[]).push({
        OR: [
          { nombre_paciente: { contains: q, mode: 'insensitive' } },
          { apellido_paciente: { contains: q, mode: 'insensitive' } },
          { dni_paciente: { contains: q } },
        ],
      });
    }

    if (sexo) {
      (where.AND as Prisma.pacientesWhereInput[]).push({ sexo_paciente: sexo });
    }

    if (especialidad) {
      // Paciente con algún turno cuyo profesional tenga esa especialidad
      (where.AND as Prisma.pacientesWhereInput[]).push({
        turnos: {
          some: {
            profesionales: {
              especialidades: {
                nombre_especialidad: { contains: especialidad, mode: 'insensitive' },
              },
            },
          },
        },
      });
    }

    if (tipoConsulta) {
      (where.AND as Prisma.pacientesWhereInput[]).push({
        turnos: {
          some: {
            tipos_consulta: {
              nombre_tipo_consulta: { contains: tipoConsulta, mode: 'insensitive' },
            },
          },
        },
      });
    }

    // Si no se agregaron condiciones, quitar AND vacío para que Prisma no falle
    if (Array.isArray(where.AND) && where.AND.length === 0) delete where.AND;

    const [total, pacientes] = await Promise.all([
      prisma.pacientes.count({ where }),
      prisma.pacientes.findMany({
        where,
        select: {
          id_paciente: true,
          dni_paciente: true,
          nombre_paciente: true,
          apellido_paciente: true,
          sexo_paciente: true,
          fecha_nacimiento_paciente: true,
          obras_sociales: { select: { nombre_obra_social: true } },
          registros_clinicos: {
            select: { id_registro: true },
            orderBy: { id_registro: 'asc' }, // primer registro como nro historial
            take: 1,
          },
        },
        orderBy: { id_paciente: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const items = pacientes.map(mapPaciente);

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (error) {
    console.error('Error en /api/ver_pacientes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
