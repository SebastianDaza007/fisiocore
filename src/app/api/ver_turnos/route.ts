import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function parseDateRange(dateStr?: string) {
  if (!dateStr) return undefined;
  // Expecting YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map((v) => Number(v));
  if (!y || !m || !d) return undefined;
  const start = new Date(y, (m - 1), d, 0, 0, 0);
  const end = new Date(y, (m - 1), d + 1, 0, 0, 0);
  return { start, end };
}

/*
function toHHmm(date: Date) {
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}*/ 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date") ?? undefined; // YYYY-MM-DD
    const q = searchParams.get("q") ?? undefined; // DNI contains
    const especialidadId = searchParams.get("especialidadId")
      ? Number(searchParams.get("especialidadId"))
      : undefined;
    const profesionalId = searchParams.get("profesionalId")
      ? Number(searchParams.get("profesionalId"))
      : undefined;
    const tipoId = searchParams.get("tipoId")
      ? Number(searchParams.get("tipoId"))
      : undefined;
    const estadoTurnoId = searchParams.get("estadoTurnoId")
      ? Number(searchParams.get("estadoTurnoId"))
      : undefined;

    const range = parseDateRange(date);

    const whereClause: Prisma.turnosWhereInput = {
      ...(range
        ? {
            fecha_turno: {
              gte: range.start,
              lt: range.end,
            },
          }
        : {}),
      ...(q
        ? {
            pacientes: {
              is: {
                dni_paciente: {
                  contains: q,
                },
              },
            },
          }
        : {}),
      ...(especialidadId
        ? {
            profesionales: {
              is: {
                especialidad_id: especialidadId,
              },
            },
          }
        : {}),
      ...(profesionalId ? { profesional_id: profesionalId } : {}),
      ...(tipoId ? { tipo_consulta_id: tipoId } : {}),
      ...(estadoTurnoId ? { estado_turno_id: estadoTurnoId } : {}),
    };

    // Log where clause to help diagnose filters
    console.warn("/api/ver_turnos where:", JSON.stringify(whereClause));

    const items = await prisma.turnos.findMany({
      where: whereClause,
      include: {
        pacientes: {
          include: {
            obras_sociales: true,
          },
        },
        profesionales: {
          include: {
            especialidades: true,
            usuarios: true,
          },
        },
        tipos_consulta: true,
        estados_turno: true,
      },
      orderBy: [
        { fecha_turno: "asc" },
        { hora_turno: "asc" },
      ],
    });

    const data = items.map((t) => {
      const pac = t.pacientes;
      const prof = t.profesionales;
      const user = prof?.usuarios;
      const esp = prof?.especialidades;
      const os = pac?.obras_sociales;

      const pacienteDni = pac?.dni_paciente ?? "";
      const pacienteNombre = `${pac?.nombre_paciente ?? ""} ${pac?.apellido_paciente ?? ""}`.trim();
      const profesionalNombre = `${user?.nombre_usuario ?? ""} ${user?.apellido_usuario ?? ""}`.trim();

      // 🔹 Arreglo clave: combinar fecha_turno + hora_turno
      //const fecha = t.fecha_turno; 
      //const hora = t.hora_turno;  
      // Devuelve siempre la hora exacta guardada en Postgres
      const horaLocal = t.hora_turno.toISOString().substring(11, 16);

      return {
        id:t.id_turno,
        pacienteDni,
        pacienteNombre,
        hora: horaLocal,
        especialidad: esp?.nombre_especialidad ?? "",
        profesional: profesionalNombre || "",
        tipoConsulta: t.tipos_consulta?.nombre_tipo_consulta ?? "",
        obraSocial: os?.nombre_obra_social ?? "",
        estado: t.estados_turno?.nombre_estado_turno ?? "CONFIRMADO", // 👈 devolvemos estado
      };
    });

    return NextResponse.json({ items: data });
  } catch (error) {
    console.error("/api/ver_turnos error", (error as Error)?.message ?? error, error);
    const body: Record<string, unknown> = { error: "Error obteniendo turnos" };
    if (process.env.NODE_ENV !== "production") {
      body.details = String((error as Error)?.message ?? error);
    }
    return NextResponse.json(body, { status: 500 });
  }
}
