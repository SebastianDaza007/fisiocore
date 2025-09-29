import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parseDateRange(dateStr?: string) {
  if (!dateStr) return undefined;
  // Expecting YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map((v) => Number(v));
  if (!y || !m || !d) return undefined;
  const start = new Date(y, (m - 1), d, 0, 0, 0);
  const end = new Date(y, (m - 1), d + 1, 0, 0, 0);
  return { start, end };
}

function toHHmm(date: Date) {
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

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

    const whereClause: any = {
        ...(range
          ? {
              fecha_hora_turno: {
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

    let items;
    try {
      items = await prisma.turnos.findMany({
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
        },
        orderBy: {
          // Prefer order by fecha_hora_turno if exists in DB
          // @ts-ignore
          fecha_hora_turno: "asc",
        },
      });
    } catch (e: any) {
      // Fallback if DB column doesn't exist
      if (String(e?.message || e).includes("fecha_hora_turno")) {
        console.warn("/api/ver_turnos fallback: removing fecha_hora_turno filters/order");
        const { fecha_hora_turno, ...whereNoDate } = whereClause as any;
        items = await prisma.turnos.findMany({
          where: whereNoDate,
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
          },
          orderBy: {
            id_turno: "asc",
          },
        });
      } else {
        throw e;
      }
    }

    const data = items.map((t) => {
      const pac = t.pacientes as any;
      const prof = t.profesionales as any;
      const user = prof?.usuarios as any;
      const esp = prof?.especialidades as any;
      const os = pac?.obras_sociales as any;

      const pacienteDni = pac?.dni_paciente ?? "";
      const pacienteNombre = `${pac?.nombre_paciente ?? ""} ${pac?.apellido_paciente ?? ""}`.trim();
      const profesionalNombre = `${user?.nombre_usuario ?? ""} ${user?.apellido_usuario ?? ""}`.trim();

      return {
        id: String(t.id_turno),
        pacienteDni,
        pacienteNombre,
        hora: toHHmm(new Date(t.fecha_hora_turno)),
        especialidad: esp?.nombre_especialidad ?? "",
        profesional: profesionalNombre || "",
        tipoConsulta: t.tipos_consulta?.nombre_tipo_consulta ?? "",
        obraSocial: os?.nombre_obra_social ?? "",
      };
    });

    return NextResponse.json({ items: data });
  } catch (error: any) {
    console.error("/api/ver_turnos error", error?.message ?? error, error);
    const body: any = { error: "Error obteniendo turnos" };
    if (process.env.NODE_ENV !== "production") {
      body.details = String(error?.message ?? error);
    }
    return NextResponse.json(body, { status: 500 });
  }
}
