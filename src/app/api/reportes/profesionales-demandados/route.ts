import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const whereClause: Prisma.turnosWhereInput = {
        estados_turno: {
            nombre_estado_turno: {
            in: ["CONFIRMADO", "COMPLETADO"],
            },
        },
        };

        if (startDate && endDate) {
        whereClause.fecha_turno = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
        }

        const resultados = await prisma.turnos.groupBy({
        by: ["profesional_id"],
        where: whereClause,
        _count: {
            profesional_id: true,
        },
        orderBy: {
            _count: {
            profesional_id: "desc",
            },
        },
        });

        if (resultados.length === 0) return NextResponse.json([]);

        const profesionalesIds = resultados.map((r) => r.profesional_id);
        const profesionales = await prisma.profesionales.findMany({
        where: { id_profesional: { in: profesionalesIds } },
        select: {
            id_profesional: true,
            usuarios: {
            select: {
                nombre_usuario: true,
                apellido_usuario: true,
            },
            },
        },
        });

        const data = resultados.map((r) => {
        const prof = profesionales.find(
            (p) => p.id_profesional === r.profesional_id
        );
        const nombre = prof
            ? `${prof.usuarios.nombre_usuario} ${prof.usuarios.apellido_usuario}`
            : "Profesional desconocido";
        return {
            nombre,
            cantidad: r._count.profesional_id,
        };
        });

        return NextResponse.json(data);
    } catch (err) {
        console.error("Error en /api/reportes/profesionales-demandados:", err);
        return NextResponse.json(
        { error: "Error al obtener los profesionales más demandados" },
        { status: 500 }
        );
    }
}
