import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


const DURACION_TURNO_MIN = 30; // 🔹 Duración fija de cada turno (minutos)

    export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const profesionalId = Number(searchParams.get("profesionalId"));
        const rango = searchParams.get("rango") || "semana"; // "semana" o "mes"

        if (!profesionalId) {
        return NextResponse.json(
            { error: "Falta el ID del profesional" },
            { status: 400 }
        );
        }

        // 🗓️ Determinar el rango de fechas
        const endDate = new Date();
        const startDate = new Date();

        if (rango === "semana") startDate.setDate(endDate.getDate() - 7);
        else startDate.setMonth(endDate.getMonth() - 1);

        // ✅ 1. Obtener horarios del profesional
        const horarios = await prisma.horarios_profesionales.findMany({
        where: { profesional_id: profesionalId },
        include: { dias_semana: true },
        });

        if (horarios.length === 0) {
        return NextResponse.json({
            ocupacion: 0,
            mensaje: "El profesional no tiene horarios configurados.",
        });
        }

        // ✅ 2. Calcular total de slots disponibles según sus horarios
        let totalDisponibles = 0;

        for (const h of horarios) {
        // Duración total del bloque en minutos (ej: 09:00 → 13:00 = 240 min)
        const duracionBloque =
            (h.hora_fin.getHours() * 60 + h.hora_fin.getMinutes()) -
            (h.hora_inicio.getHours() * 60 + h.hora_inicio.getMinutes());

        const turnosPorDia = Math.floor(duracionBloque / DURACION_TURNO_MIN);
        const repeticiones = contarDiasEnRango(
            startDate,
            endDate,
            h.dias_semana.nombre_dia
        );

        totalDisponibles += turnosPorDia * repeticiones;
        }

        // ✅ 3. Contar turnos ocupados (confirmados o completados)
        const turnosOcupados = await prisma.turnos.count({
        where: {
            profesional_id: profesionalId,
            fecha_turno: {
            gte: startDate,
            lte: endDate,
            },
            estados_turno: {
            is: {
                nombre_estado_turno: {
                in: ["CONFIRMADO", "COMPLETADO"],
                },
            },
            },
        },
        });

        const ocupacion =
        totalDisponibles > 0 ? (turnosOcupados / totalDisponibles) * 100 : 0;

        // ✅ 4. Devolver datos listos para frontend
        return NextResponse.json({
        profesionalId,
        rango,
        totalDisponibles,
        turnosOcupados,
        ocupacion: Math.round(ocupacion),
        startDate,
        endDate,
        });
    } catch (error) {
        console.error("Error al calcular tasa de ocupación:", error);
        return NextResponse.json(
        { error: "Error al generar reporte" },
        { status: 500 }
        );
    }
    }

    /**
     * 📅 Cuenta cuántas veces ocurre un día específico (ej: “lunes”) dentro de un rango de fechas.
     */
    function contarDiasEnRango(start: Date, end: Date, diaNombre: string): number {
    const dias = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
    ];
    const diaIndex = dias.indexOf(diaNombre.toLowerCase());
    if (diaIndex === -1) return 0;

    let count = 0;
    const date = new Date(start);
    while (date <= end) {
        if (date.getDay() === diaIndex) count++;
        date.setDate(date.getDate() + 1);
    }
    return count;
}
