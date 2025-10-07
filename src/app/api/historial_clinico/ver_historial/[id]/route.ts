import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idPaciente = Number(id);

    if (isNaN(idPaciente)) {
      return NextResponse.json(
        { error: "ID de paciente no válido" },
        { status: 400 }
      );
    }

    const registros = await prisma.registros_clinicos.findMany({
      where: { 
        paciente_id: idPaciente 
      },
      include: {
        profesionales: {
          include: {
            usuarios: {
              select: {
                nombre_usuario: true,
                apellido_usuario: true
              }
            }
          }
        },
        turnos: {
          select: {
            fecha_turno: true,
            tipos_consulta: {
              select: {
                nombre_tipo_consulta: true
              }
            }
          }
        }
      },
      orderBy: {
        turnos: {
          fecha_turno: 'desc'
        }
      }
    });

    return NextResponse.json(registros || []);
    
  } catch (error) {
    console.error("Error al obtener historial clínico:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}