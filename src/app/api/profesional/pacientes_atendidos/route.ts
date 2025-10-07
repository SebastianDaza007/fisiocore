import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha");
  const profesionalId = searchParams.get("profesionalId");

  if (!fecha || !profesionalId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  try {
    const countAtendidos = await prisma.turnos.count({
      where: {
        fecha_turno: new Date(fecha),
        profesional_id: Number(profesionalId),
        estado_turno_id: 3, // Solo turnos atendidos
      },
    });

    return NextResponse.json({ atendidosHoy: countAtendidos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al contar turnos atendidos" }, { status: 500 });
  }
}

// Este POST sirve para marcar un turno como atendido (estado 3) cuando se hace click en el tilde
export async function POST(req: Request) {
  try {
    // Parseamos el body JSON enviado desde el front
    const body = await req.json();
    const { idTurno } = body;

    if (!idTurno) {
      return NextResponse.json({ error: "Falta el id del turno" }, { status: 400 });
    }

    // Actualizamos el estado del turno a 3
    await prisma.turnos.update({
      where: { id_turno: idTurno },
      data: { estado_turno_id: 3 },
    });

    // Respondemos al front con éxito
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al atender turno" }, { status: 500 });
  }
}
