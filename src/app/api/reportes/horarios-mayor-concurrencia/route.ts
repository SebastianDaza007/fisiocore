import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type PuntoHora = { hora: string; cantidad: number };

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // ✅ Tipado correcto (sin any) + filtro relacional con `is`
        const whereClause: Prisma.turnosWhereInput = {
        estados_turno: {
            is: {
            nombre_estado_turno: {
                in: ["CONFIRMADO", "COMPLETADO"], // en mayúsculas como en tu DB
            },
            },
        },
        };

        if (startDate && endDate) {
        whereClause.fecha_turno = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
        }

        const turnos = await prisma.turnos.findMany({
        where: whereClause,
        select: { hora_turno: true },
        });

        // Agrupar por hora (usar UTC para evitar corrimientos)
        const conteoPorHora: Record<string, number> = {};
        for (const t of turnos) {
        if (t.hora_turno) {
            const h = t.hora_turno.getUTCHours();          // 0..23
            const key = `${String(h).padStart(2, "0")}:00`; // "08:00"
            conteoPorHora[key] = (conteoPorHora[key] ?? 0) + 1;
        }
        }

        const resultado: PuntoHora[] = Object.entries(conteoPorHora)
        .map(([hora, cantidad]) => ({ hora, cantidad }))
        .sort((a, b) => Number(a.hora.slice(0, 2)) - Number(b.hora.slice(0, 2)));

        return NextResponse.json(resultado);
    } catch (error) {
        console.error("Error al generar reporte:", error);
        return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
    }
}
