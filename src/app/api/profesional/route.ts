// app/api/profesional/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


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
        profesionales_por_obras_sociales: {
          include: {
            obras_sociales: {
              select: {
                id_obra_social: true,
                nombre_obra_social: true,
              },
            },
          },
        },
      },
    });

    // Formateamos para el front
    const profesionalesFormateados = profesionales.map((p) => ({
      id: p.id_profesional,
      nombre: `${p.usuarios.nombre_usuario} ${p.usuarios.apellido_usuario}`,
      especialidad: p.especialidades.nombre_especialidad,
      obras_sociales: p.profesionales_por_obras_sociales.map(
        (pos) => pos.obras_sociales
      ),
    }));

    return NextResponse.json(profesionalesFormateados);
  } catch (error) {
    console.error("Error al traer profesionales:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al traer profesionales" },
      { status: 500 }
    );
  } finally {
  }
}
