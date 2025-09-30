// app/api/turnos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


// -------------------- GET: lista de turnos --------------------
export async function GET() {
  try {
    const turnos = await prisma.turnos.findMany({
      include: {
        pacientes: {
          select: {
            nombre_paciente: true,
            apellido_paciente: true,
            dni_paciente: true,
          },
        },
        profesionales: {
          include: {
            usuarios: {
              select: {
                nombre_usuario: true,
                apellido_usuario: true,
              },
            },
            especialidades: {
              select: {
                nombre_especialidad: true,
              },
            },
          },
        },
        estados_turno: {
          select: { nombre_estado_turno: true },
        },
      },
      orderBy: { fecha_turno: "desc" },
    });

    return NextResponse.json(turnos);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    return NextResponse.json(
      { error: "Error interno al obtener los turnos" },
      { status: 500 }
    );
  } finally {
  }
}

// -------------------- POST: crear turno --------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, profesional_id, fecha_turno, hora_turno, tipo_consulta_id, creado_por_usuario_id } = body;

    if (!paciente_id || !profesional_id || !fecha_turno || !hora_turno || !tipo_consulta_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const fecha = new Date(fecha_turno);
    const horaIso = `1970-01-01T${
      hora_turno.length <= 5 ? hora_turno + ":00" : hora_turno
    }Z`;
    const hora = new Date(horaIso);

    const nuevoTurno = await prisma.turnos.create({
      data: {
        paciente_id,
        profesional_id,
        fecha_turno: fecha,
        hora_turno: hora,
        estado_turno_id: 2, // Confirmado por defecto
        tipo_consulta_id,
        fecha_agendamiento_turno: new Date(),
        creado_por_usuario_id: creado_por_usuario_id || null,
      },
    });

    return NextResponse.json(
      { success: true, turno: nuevoTurno },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear turno:", error);
    return NextResponse.json(
      { error: "Error interno al crear el turno" },
      { status: 500 }
    );
  } finally {
  }
}

// -------------------- PUT: actualizar estado de un turno --------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { turno_id, nuevo_estado_id } = body;

    if (!turno_id || !nuevo_estado_id) {
      return NextResponse.json(
        { error: "Faltan turno_id o nuevo_estado_id" },
        { status: 400 }
      );
    }

    const turnoActualizado = await prisma.turnos.update({
      where: { id_turno: turno_id },
      data: { estado_turno_id: nuevo_estado_id },
    });

    return NextResponse.json({
      success: true,
      message: "Estado del turno actualizado",
      turno: turnoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el turno" },
      { status: 500 }
    );
  } finally {
  }
}
