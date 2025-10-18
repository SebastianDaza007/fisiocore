import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const whereClause: Prisma.turnosWhereInput = {};

        // Filtrado por rango de fechas (si se envía)
        if (startDate && endDate) {
        whereClause.fecha_turno = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
        }

        // Traemos todos los turnos en el rango (o todos si no hay filtro)
        const turnos = await prisma.turnos.findMany({
        where: whereClause,
        select: {
            fecha_turno: true,
        },
        });

        if (turnos.length === 0) {
        return NextResponse.json([]);
        }

        // Contamos turnos por día de la semana (1=lunes ... 5=viernes)
        const diasContador: Record<string, number> = {
        Lunes: 0,
        Martes: 0,
        Miércoles: 0,
        Jueves: 0,
        Viernes: 0,
        };

        for (const t of turnos) {
        const dia = t.fecha_turno.getDay(); // 0=domingo, 1=lunes, ...
        switch (dia) {
            case 1:
            diasContador["Lunes"]++;
            break;
            case 2:
            diasContador["Martes"]++;
            break;
            case 3:
            diasContador["Miércoles"]++;
            break;
            case 4:
            diasContador["Jueves"]++;
            break;
            case 5:
            diasContador["Viernes"]++;
            break;
        }
        }

        // Convertimos a formato { dia, cantidad }
        const data = Object.entries(diasContador).map(([dia, cantidad]) => ({
        dia,
        cantidad,
        }));

        return NextResponse.json(data);
    } catch (err) {
        console.error("Error en /api/reportes/dias-mayor-demanda:", err);
        return NextResponse.json(
        { error: "Error al obtener días con mayor demanda" },
        { status: 500 }
        );
    }
}
