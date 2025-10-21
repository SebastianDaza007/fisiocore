import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const profesionalId = Number(searchParams.get("profesionalId"));
        const period = searchParams.get("period") || "week"; // 'week' | 'month' | 'year'

        if (!profesionalId) {
        return NextResponse.json(
            { error: "Falta el ID del profesional" },
            { status: 400 }
        );
        }

        const today = new Date();
        let startDate: Date = new Date();
        let endDate: Date = new Date();

        // 📅 Definir rango según el período seleccionado
        if (period === "week") {
        const day = today.getDay();
        const diff = day === 0 ? 6 : day - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diff);
        startDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        endDate = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
        } 
        else if (period === "month") {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        } 
        else if (period === "year") {
        startDate = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        }

        // 🔹 Buscar turnos completados del profesional en el rango
        const turnosCompletados = await prisma.turnos.count({
        where: {
            profesional_id: profesionalId,
            fecha_turno: {
            gte: startDate,
            lte: endDate,
            },
            estados_turno: {
            nombre_estado_turno: "COMPLETADO",
            },
        },
        });

        // 📦 Respuesta
        return NextResponse.json({
        profesionalId,
        periodo: period,
        fecha_inicio: startDate,
        fecha_fin: endDate,
        pacientes_atendidos: turnosCompletados,
        });
    } catch (error) {
        console.error("Error al generar reporte de pacientes atendidos:", error);
        return NextResponse.json(
        { error: "Error al generar el reporte" },
        { status: 500 }
        );
    }
}
