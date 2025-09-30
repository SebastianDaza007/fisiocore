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
    const pacientes = await prisma.turnos.findMany({
      where: {
        fecha_turno: new Date(fecha),
        profesional_id: Number(profesionalId),
      },
      select: {
        pacientes: {
          select: {
            id_paciente: true,
            nombre_paciente: true,
            apellido_paciente: true,
          }
        }
      },
      distinct: ["paciente_id"] // para que no se repitan pacientes
    });

    // Transformamos para el dropdown
    const opciones = pacientes.map(t => ({
      value: t.pacientes.id_paciente,
      label: `${t.pacientes.nombre_paciente} ${t.pacientes.apellido_paciente}`
    }));

    return NextResponse.json(opciones);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 });
  }
}
