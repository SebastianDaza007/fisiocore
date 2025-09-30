// app/api/profesional/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const profesionales = await prisma.profesionales.findMany({
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
    });

    // Formateamos para el front
    const profesionalesFormateados = profesionales.map((p) => ({
      id: p.id_profesional,
      nombre: `${p.usuarios.nombre_usuario} ${p.usuarios.apellido_usuario}`,
      especialidad: p.especialidades.nombre_especialidad,
    }));

    return NextResponse.json(profesionalesFormateados);
  } catch (error) {
    console.error("Error al traer profesionales:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al traer profesionales" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
