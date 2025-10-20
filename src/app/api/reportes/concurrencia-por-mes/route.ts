import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type MesConcurrencia = { mes: string; cantidad: number };

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthsParam = Number(searchParams.get("months")) || 3; // 🔹 Por defecto últimos 3 meses

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - monthsParam + 1);

        // 🔹 Filtro: solo turnos confirmados o completados en el rango de fechas
        const whereClause: Prisma.turnosWhereInput = {
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
        };

        const turnos = await prisma.turnos.findMany({
            where: whereClause,
            select: { fecha_turno: true },
        });

        // 🔹 Crear lista dinámica de los últimos N meses
        const mesesLabels: string[] = [];
        for (let i = 0; i < monthsParam; i++) {
            const d = new Date(startDate);
            d.setMonth(startDate.getMonth() + i);
            const nombreMes = d.toLocaleString("es-ES", { month: "long" });
            mesesLabels.push(nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1));
        }

        // 🔹 Contar turnos por mes
        const conteo: Record<string, number> = {};
        for (const t of turnos) {
            if (t.fecha_turno) {
                const nombreMes = t.fecha_turno.toLocaleString("es-ES", { month: "long" });
                const mes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
                conteo[mes] = (conteo[mes] ?? 0) + 1;
            }
        }

        // 🔹 Armar resultado solo con los meses del rango
        const resultado: MesConcurrencia[] = mesesLabels.map((mes) => ({
            mes,
            cantidad: conteo[mes] || 0,
        }));

        return NextResponse.json(resultado);
    } catch (error) {
        console.error("Error al generar reporte:", error);
        return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
    }
}
