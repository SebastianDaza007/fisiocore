import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [especialidades, profesionales, tipos, estados] = await Promise.all([
      prisma.especialidades.findMany({ orderBy: { nombre_especialidad: "asc" } }),
      prisma.profesionales.findMany({
        include: { usuarios: true },
        orderBy: { id_profesional: "asc" },
      }),
      prisma.tipos_consulta.findMany({ orderBy: { nombre_tipo_consulta: "asc" } }),
      prisma.estados_turno.findMany({ orderBy: { nombre_estado_turno: "asc" } }),
    ]);

    const especialidadesOptions = especialidades.map((e) => ({
      label: e.nombre_especialidad,
      value: String(e.id_especialidad),
    }));

    const profesionalesOptions = profesionales.map((p) => {
      const nombre = `${p.usuarios?.nombre_usuario ?? ""} ${p.usuarios?.apellido_usuario ?? ""}`.trim();
      return {
        label: nombre || `Profesional #${p.id_profesional}`,
        value: String(p.id_profesional),
      };
    });

    const tiposOptions = tipos.map((t) => ({
      label: t.nombre_tipo_consulta,
      value: String(t.id_tipo_consulta),
    }));

    const estadosOptions = estados.map((e) => ({
      label: e.nombre_estado_turno,
      value: String(e.id_estado_turno),
    }));

    return NextResponse.json({
      especialidades: especialidadesOptions,
      profesionales: profesionalesOptions,
      tipos: tiposOptions,
      estados: estadosOptions,
    });
  } catch (error) {
    console.error("/api/ver_turnos/meta error", error);
    return NextResponse.json(
      { error: "Error obteniendo metadatos" },
      { status: 500 }
    );
  }
}
