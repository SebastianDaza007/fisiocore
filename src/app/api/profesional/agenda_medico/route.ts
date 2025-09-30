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
    const turnos = await prisma.turnos.findMany({
      where: {
        fecha_turno: new Date(fecha),
        profesional_id: Number(profesionalId),
        estado_turno_id: 5
      },
      include: {
        pacientes: { 
          include: {
            obras_sociales: true,
          } 
        },
        tipos_consulta: true,
      },
      orderBy: { hora_turno: "asc" },
    });

    // 🔹 Convertimos hora_turno a HH:mm para evitar problemas de zona horaria
    const turnosFormateados = turnos.map(t => ({
      ...t,
      hora_turno: t.hora_turno.getUTCHours().toString().padStart(2,'0') 
                  + ':' + t.hora_turno.getUTCMinutes().toString().padStart(2,'0')
    }));

    return NextResponse.json(turnosFormateados);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener turnos" }, { status: 500 });
  }
}
