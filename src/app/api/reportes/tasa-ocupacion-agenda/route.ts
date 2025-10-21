import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Duración fija del turno (en minutos)
const DURACION_TURNO_MIN = 30;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const profesionalId = Number(searchParams.get("profesionalId"));
        const period = searchParams.get("period") || "week";

        if (!profesionalId) {
        return NextResponse.json(
            { error: "Falta el ID del profesional" },
            { status: 400 }
        );
        }

        // 📅 Fecha actual y rango
        const today = new Date();
        const startDate = new Date(today);
        const endDate = new Date(today);

        if (period === "week") {
        // Semana actual (lunes a domingo)
        const day = today.getDay();
        const diff = day === 0 ? 6 : day - 1;
        startDate.setDate(today.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);

        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        } else if (period === "month") {
        // Mes actual (1 al último día)
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        endDate.setMonth(today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        }

        // 🟢 LOG — Fechas del reporte (en horario argentino)
        const startLocal = startDate.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
        const endLocal = endDate.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
        console.log("📆 Reporte de tasa de ocupación:");
        console.log({
        profesionalId,
        period,
        inicio: startLocal,
        fin: endLocal,
        });

        // 1️⃣ Buscar los horarios configurados
        const horarios = await prisma.horarios_profesionales.findMany({
        where: { profesional_id: profesionalId },
        include: { dias_semana: true },
        });

        console.log(`🕐 Horarios configurados: ${horarios.length}`);
        if (horarios.length === 0) {
        return NextResponse.json({
            message: "El profesional no tiene horarios configurados",
        });
        }

        // 2️⃣ Calcular turnos posibles según los horarios
        let totalTurnosPosibles = 0;
        const daysInRange: Date[] = [];
        const tempDate = new Date(startDate);

        while (tempDate <= endDate) {
        daysInRange.push(new Date(tempDate));
        tempDate.setDate(tempDate.getDate() + 1);
        }

        for (const day of daysInRange) {
        const diaSemana = day.getDay(); // 0 = domingo ... 6 = sábado
        const horarioDia = horarios.find(
            (h) => h.dia_semana_id === (diaSemana === 0 ? 7 : diaSemana)
        );

        if (horarioDia) {
            const minutosTotales =
            horarioDia.hora_fin.getHours() * 60 +
            horarioDia.hora_fin.getMinutes() -
            (horarioDia.hora_inicio.getHours() * 60 +
                horarioDia.hora_inicio.getMinutes());
            const turnosDelDia = Math.floor(minutosTotales / DURACION_TURNO_MIN);
            totalTurnosPosibles += turnosDelDia;
        }
        }

        console.log(`🧮 Total turnos posibles calculados: ${totalTurnosPosibles}`);

        // 3️⃣ Buscar turnos tomados (CONFIRMADO, COMPLETADO, EN ESPERA)
        const turnosTomados = await prisma.turnos.count({
        where: {
            profesional_id: profesionalId,
            fecha_turno: {
            gte: startDate,
            lte: endDate,
            },
            estados_turno: {
            is: {
                nombre_estado_turno: {
                in: ["CONFIRMADO", "COMPLETADO", "EN ESPERA"],
                },
            },
            },
        },
        });

        console.log(`📋 Turnos tomados (incluyendo EN ESPERA): ${turnosTomados}`);

        // 4️⃣ Calcular porcentaje de ocupación
        const porcentajeOcupacion =
        totalTurnosPosibles === 0
            ? 0
            : (turnosTomados / totalTurnosPosibles) * 100;

        console.log(`📊 Tasa de ocupación total: ${porcentajeOcupacion.toFixed(2)}%`);

        // 📦 Respuesta final
        return NextResponse.json({
        profesionalId,
        periodo: period,
        fecha_inicio: startDate,
        fecha_fin: endDate,
        turnos_posibles: totalTurnosPosibles,
        turnos_ocupados: turnosTomados,
        tasa_ocupacion: parseFloat(porcentajeOcupacion.toFixed(2)),
        });
    } catch (error) {
        console.error("❌ Error al calcular la tasa de ocupación:", error);
        return NextResponse.json(
        { error: "Error al generar el reporte" },
        { status: 500 }
        );
    }
}
