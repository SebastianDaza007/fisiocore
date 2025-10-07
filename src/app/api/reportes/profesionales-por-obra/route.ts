import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // 🔹 Contamos cuántos profesionales hay por cada obra social
        const resultados = await prisma.profesionales_por_obras_sociales.groupBy({
        by: ["obra_social_id"],
        _count: { profesional_id: true },
        });

        // 🔹 Traemos los nombres de las obras sociales
        const obras = await prisma.obras_sociales.findMany({
        select: { id_obra_social: true, nombre_obra_social: true },
        });

        // 🔹 Mezclamos los datos
        const data =
        resultados.length > 0
            ? resultados.map((r) => {
                const obra = obras.find(
                (o) => o.id_obra_social === r.obra_social_id
                );
                return {
                nombre: obra?.nombre_obra_social || "Desconocida",
                cantidad: r._count.profesional_id,
                };
            })
            : [];

        // ✅ Siempre devolver JSON, aunque sea vacío
        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error al obtener profesionales por obra social:", error);

        // ✅ También devolver JSON en caso de error
        return NextResponse.json(
        { error: "Error al obtener profesionales por obra social", detalles: String(error) },
        { status: 500 }
        );
    }
}
