import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const turnoId = Number(id);

    if (isNaN(turnoId)) {
      return NextResponse.json({ error: "ID de turno inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { fecha, hora } = body;

    if (!fecha || !hora) {
      return NextResponse.json(
        { error: "Fecha y hora son requeridos" },
        { status: 400 }
      );
    }

    // Validar que el turno exista
    const turnoExistente = await prisma.turnos.findUnique({
      where: { id_turno: turnoId },
    });

    if (!turnoExistente) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    }

    // Parsear fecha (YYYY-MM-DD)
    const [year, month, day] = fecha.split("-").map(Number);
    const nuevaFecha = new Date(year, month - 1, day);

    // Parsear hora (HH:mm)
    const [hours, minutes] = hora.split(":").map(Number);
    const nuevaHora = new Date(1970, 0, 1, hours, minutes);

    // Verificar disponibilidad del horario
    const turnoConflicto = await prisma.turnos.findFirst({
      where: {
        profesional_id: turnoExistente.profesional_id,
        fecha_turno: nuevaFecha,
        hora_turno: nuevaHora,
        id_turno: { not: turnoId }, // Excluir el turno actual
        estado_turno_id: { not: 4 }, // Excluir turnos cancelados (asumiendo que 4 es CANCELADO)
      },
    });

    if (turnoConflicto) {
      return NextResponse.json(
        { error: "El horario seleccionado ya está ocupado" },
        { status: 409 }
      );
    }

    // Actualizar el turno
    const turnoActualizado = await prisma.turnos.update({
      where: { id_turno: turnoId },
      data: {
        fecha_turno: nuevaFecha,
        hora_turno: nuevaHora,
      },
      include: {
        pacientes: true,
        profesionales: {
          include: {
            usuarios: true,
            especialidades: true,
          },
        },
        tipos_consulta: true,
        estados_turno: true,
      },
    });

    return NextResponse.json({
      success: true,
      turno: {
        id: turnoActualizado.id_turno,
        fecha: turnoActualizado.fecha_turno,
        hora: turnoActualizado.hora_turno.toISOString().substring(11, 16),
        paciente: `${turnoActualizado.pacientes?.nombre_paciente} ${turnoActualizado.pacientes?.apellido_paciente}`,
        profesional: `${turnoActualizado.profesionales?.usuarios?.nombre_usuario} ${turnoActualizado.profesionales?.usuarios?.apellido_usuario}`,
      },
    });
  } catch (error) {
    console.error("Error al reprogramar turno:", error);
    return NextResponse.json(
      {
        error: "Error al reprogramar el turno",
        details: process.env.NODE_ENV !== "production" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
