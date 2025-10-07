import { NextResponse } from "next/server";
// Si ya tenés un helper de Prisma, mejor reutilizarlo:
import prisma from "@/lib/prisma";
// 👇 Importá los tipos
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const profesionalId = searchParams.get("profesionalId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // ✅ Filtro tipado
        const where: Prisma.turnosWhereInput = {};

        if (profesionalId) {
        where.profesional_id = Number(profesionalId);
        }

        if (startDate && endDate) {
        where.fecha_turno = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
        }

        const estados = [1, 3, 4, 5]; // NO ASISTIDO, COMPLETADO, CANCELADO, EN ESPERA

        const resultados = await prisma.turnos.groupBy({
        by: ["estado_turno_id"],
        _count: { id_turno: true },
        where: {
            ...where,
            estado_turno_id: { in: estados },
        },
        });

        const resumen = {
        completados:
            resultados.find((r) => r.estado_turno_id === 3)?._count.id_turno ?? 0,
        cancelados:
            resultados.find((r) => r.estado_turno_id === 4)?._count.id_turno ?? 0,
        enEspera:
            resultados.find((r) => r.estado_turno_id === 5)?._count.id_turno ?? 0,
        noAsistidos:
            resultados.find((r) => r.estado_turno_id === 1)?._count.id_turno ?? 0,
        };

        return NextResponse.json(resumen);
    } catch (error) {
        console.error("Error al obtener resumen:", error);
        return NextResponse.json(
        { error: "Error al obtener resumen" },
        { status: 500 }
        );
    }
}
