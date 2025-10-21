import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const profesionalId = Number(searchParams.get("profesionalId"));
        const period = searchParams.get("period") || "month"; // 'week' | 'month' | 'year'

        if (!profesionalId) {
        console.error("❌ Error: Falta el ID del profesional");
        return NextResponse.json(
            { error: "Falta el ID del profesional" },
            { status: 400 }
        );
        }

        const estadosValidos = ["CONFIRMADO", "EN ESPERA", "COMPLETADO"];

        // 📅 Rango de fechas
        const today = new Date();
        const startDate = new Date(today);
        const endDate = new Date(today);

        if (period === "week") {
        const day = today.getDay();
        const diff = day === 0 ? 6 : day - 1;
        startDate.setDate(today.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        } else if (period === "month") {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        } else if (period === "year") {
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        }

        console.log("📆 Reporte pacientes por obra social (filtrado por profesional):");
        console.log({
        profesionalId,
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        });

        // 🔹 1️⃣ Traer obras sociales habilitadas para el profesional
        const obrasProfesional = await prisma.profesionales_por_obras_sociales.findMany({
        where: { profesional_id: profesionalId },
        include: { obras_sociales: true },
        });

        if (obrasProfesional.length === 0) {
        console.warn("⚠️ El profesional no tiene obras sociales asignadas.");
        return NextResponse.json({
            profesionalId,
            periodo: period,
            fecha_inicio: startDate,
            fecha_fin: endDate,
            resultados: [],
        });
        }

        const obrasIds = obrasProfesional.map((o) => o.obra_social_id);
        const obrasMap = Object.fromEntries(
        obrasProfesional.map((o) => [o.obra_social_id, o.obras_sociales.nombre_obra_social])
        );

        console.log("🏥 Obras sociales del profesional:", obrasMap);

        // 🔹 2️⃣ Buscar los turnos del profesional dentro del rango y de sus obras sociales
        const turnos = await prisma.turnos.findMany({
        where: {
            profesional_id: profesionalId,
            fecha_turno: { gte: startDate, lte: endDate },
            estados_turno: { nombre_estado_turno: { in: estadosValidos } },
            pacientes: { obra_social_id: { in: obrasIds } },
        },
        select: {
            pacientes: { select: { obra_social_id: true } },
        },
        });

        console.log(`🩺 Turnos válidos encontrados: ${turnos.length}`);

        // 🔹 3️⃣ Contar pacientes por obra social
        const conteo: Record<number, number> = {};
        for (const turno of turnos) {
        const id = turno.pacientes.obra_social_id;
        conteo[id] = (conteo[id] || 0) + 1;
        }

        const totalPacientes = Object.values(conteo).reduce((acc, val) => acc + val, 0);

        // 🔹 4️⃣ Calcular porcentajes sobre el total
        const resultados = obrasProfesional.map((obra) => {
        const cantidad = conteo[obra.obra_social_id] || 0;
        const porcentaje =
            totalPacientes > 0 ? (cantidad / totalPacientes) * 100 : 0;
        return {
            obra_social: obra.obras_sociales.nombre_obra_social,
            porcentaje: Number(porcentaje.toFixed(2)),
        };
        });

        console.table(resultados);

        return NextResponse.json({
        profesionalId,
        periodo: period,
        fecha_inicio: startDate,
        fecha_fin: endDate,
        total_pacientes: totalPacientes,
        resultados,
        });
    } catch (error) {
        console.error("❌ Error en reporte de pacientes por obra social:", error);
        return NextResponse.json(
        { error: "Error al generar el reporte" },
        { status: 500 }
        );
    }
}
