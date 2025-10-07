import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // 1) Agrupamos pacientes por obra social
        const grouped = await prisma.pacientes.groupBy({
        by: ["obra_social_id"],
        _count: { id_paciente: true },
        });

        // 2) Traemos nombres de obras sociales
        const obras = await prisma.obras_sociales.findMany({
        select: { id_obra_social: true, nombre_obra_social: true },
        });

        // 3) Mezclamos resultados y ordenamos desc
        const data = grouped
        .map((g) => {
            const os = obras.find((o) => o.id_obra_social === g.obra_social_id);
            return {
            nombre: os?.nombre_obra_social ?? "Desconocida",
            cantidad: g._count.id_paciente,
            };
        })
        .sort((a, b) => b.cantidad - a.cantidad);

        // 4) Siempre devolver JSON
        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error /api/reportes/pacientes-por-obra:", error);
        return NextResponse.json(
        { error: "Error obteniendo pacientes por obra social", detalles: String(error) },
        { status: 500 }
        );
    }
}
