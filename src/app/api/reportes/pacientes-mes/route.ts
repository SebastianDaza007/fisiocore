import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

    export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const profesionalId = searchParams.get("profesionalId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const where: Prisma.turnosWhereInput = {
        estado_turno_id: 3, // ✅ Completado
        };

        if (profesionalId) {
        where.profesional_id = Number(profesionalId);
        }

        if (startDate && endDate) {
        where.fecha_turno = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
        }

        // ✅ Agrupar por mes (PostgreSQL con Prisma)
        const data = await prisma.turnos.groupBy({
        by: ["fecha_turno"],
        where,
        _count: { id_turno: true },
        });

        // 🔹 Convertimos los datos a formato mensual (YYYY-MM)
        const result: Record<string, number> = {};
        data.forEach((item) => {
        const mes = item.fecha_turno.toISOString().slice(0, 7); // ej. "2025-10"
        result[mes] = (result[mes] || 0) + item._count.id_turno;
        });

        // Ordenamos cronológicamente
        const chartData = Object.entries(result)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([mes, cantidad]) => ({
            mes,
            cantidad,
        }));

        return NextResponse.json(chartData);
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
    }
}
