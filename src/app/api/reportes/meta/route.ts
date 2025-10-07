import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const profesionales = await prisma.profesionales.findMany({
        include: { usuarios: true },
        orderBy: { id_profesional: "asc" },
        });

        const mapped = profesionales.map((p) => ({
        label: `${p.usuarios.nombre_usuario} ${p.usuarios.apellido_usuario}`,
        value: p.id_profesional,
        }));

        return NextResponse.json({ profesionales: mapped });
    } catch (error) {
        console.error("Error cargando profesionales:", error);
        return NextResponse.json({ error: "Error al cargar profesionales" }, { status: 500 });
    }
}
