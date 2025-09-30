import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await context.params;
        const idTurno = Number(id);
        const { estado } = await req.json();

        // buscar id_estado_turno según nombre
        const estadoDB = await prisma.estados_turno.findFirst({
        where: { nombre_estado_turno: estado },
        });

        if (!estadoDB) {
        return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
        }

        const turno = await prisma.turnos.update({
        where: { id_turno: idTurno },
        data: { estado_turno_id: estadoDB.id_estado_turno },
        include: { estados_turno: true },
        });

        return NextResponse.json({
        id: turno.id_turno,
        estado: turno.estados_turno.nombre_estado_turno,
        });
    } catch (error) {
        console.error("PATCH turno error:", error);
        return NextResponse.json({ error: "Error actualizando estado" }, { status: 500 });
    }
}
