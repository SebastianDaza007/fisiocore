// app/api/listado_profesionales/route.ts
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
            dni_usuario: true,
            email_usuario: true,
          },
        },
        especialidades: {
          select: {
            nombre_especialidad: true,
          },
        },
        horarios_profesionales: {
          include: {
            dias_semana: {
              select: {
                id_dia: true,
                nombre_dia: true,
              },
            },
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

    // Formato completo para ver_profesional
    const profesionalesCompletos = profesionales.map((p) => ({
      id_profesional: p.id_profesional,
      matricula_profesional: p.matricula_profesional,
      estado: "Activo", // Ajustar según lógica de negocio
      usuarios: {
        nombre_usuario: p.usuarios.nombre_usuario,
        apellido_usuario: p.usuarios.apellido_usuario,
        dni_usuario: p.usuarios.dni_usuario,
        email_usuario: p.usuarios.email_usuario,
      },
      especialidades: {
        nombre_especialidad: p.especialidades.nombre_especialidad,
      },
      horarios_profesionales: p.horarios_profesionales.map((h) => ({
        id_horario: h.id_horario,
        dias_semana: {
          id_dia: h.dias_semana.id_dia,
          nombre_dia: h.dias_semana.nombre_dia,
        },
        hora_inicio: h.hora_inicio.toISOString(),
        hora_fin: h.hora_fin.toISOString(),
        duracion_turno: h.duracion_turno,
      })),
      profesionales_por_obras_sociales: p.profesionales_por_obras_sociales.map((po) => ({
        id_profesional_obra: po.id_profesional_obra,
        obra_social_id: po.obra_social_id,
        obras_sociales: {
          id_obra_social: po.obras_sociales.id_obra_social,
          nombre_obra_social: po.obras_sociales.nombre_obra_social,
        },
      })),
    }));

    return NextResponse.json(profesionalesCompletos);
  } catch (error) {
    console.error("Error al traer profesionales:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al traer profesionales" },
      { status: 500 }
    );
  }
}
