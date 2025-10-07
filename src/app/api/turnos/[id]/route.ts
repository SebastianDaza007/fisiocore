import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idTurno = Number(id);

    const turno = await prisma.turnos.findUnique({
      where: { id_turno: idTurno },
      include: {
        pacientes: {
          select: {
            id_paciente: true,
            nombre_paciente: true,
            apellido_paciente: true,
            dni_paciente: true,
            email_paciente: true,
            telefono_paciente: true,
            obras_sociales: {
              select: {
                nombre_obra_social: true
              }
            }
          }
        },
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
        tipos_consulta: {
          select: {
            nombre_tipo_consulta: true
          }
        }
      }
    });

    if (!turno) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    }

    return NextResponse.json(turno);
  } catch (error) {
    console.error("Error al obtener turno:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await context.params;
        const idTurno = Number(id);
        const { estado } = await req.json();

        // buscar id_estado_turno según nombre
        const estadoDB = await prisma.estados_turno.findFirst({
        where: { nombre_estado_turno: estado },
        });

        if (!estadoDB) {
        return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
        }

        const turno = await prisma.turnos.update({
        where: { id_turno: idTurno },
        data: { estado_turno_id: estadoDB.id_estado_turno },
        include: { estados_turno: true },
        });

        return NextResponse.json({
        id: turno.id_turno,
        estado: turno.estados_turno.nombre_estado_turno,
        });
    } catch (error) {
        console.error("PATCH turno error:", error);
        return NextResponse.json({ error: "Error actualizando estado" }, { status: 500 });
    }
}
