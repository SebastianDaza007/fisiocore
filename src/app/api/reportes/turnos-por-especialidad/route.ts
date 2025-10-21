import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profesionalId = searchParams.get("profesionalId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtros dinámicos
    const where: {
      profesional_id?: number;
      fecha_turno?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (profesionalId) {
      where.profesional_id = parseInt(profesionalId);
    }

    if (startDate && endDate) {
      where.fecha_turno = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Obtener turnos con especialidad
    const turnos = await prisma.turnos.findMany({
      where,
      include: {
        profesionales: {
          include: {
            especialidades: true,
          },
        },
      },
    });

    // Agrupar por especialidad
    const turnosPorEspecialidad = turnos.reduce((acc, turno) => {
      const especialidad = turno.profesionales?.especialidades?.nombre_especialidad || "Sin especialidad";
      acc[especialidad] = (acc[especialidad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convertir a array y ordenar por cantidad descendente
    const resultado = Object.entries(turnosPorEspecialidad)
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10 especialidades

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener turnos por especialidad:", error);
    return NextResponse.json(
      { error: "Error al obtener turnos por especialidad" },
      { status: 500 }
    );
  }
}
