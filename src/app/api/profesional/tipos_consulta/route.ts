// /api/profesional/tipos_consulta/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tipos = await prisma.tipos_consulta.findMany({
      select: { id_tipo_consulta: true, nombre_tipo_consulta: true },
    });
    return NextResponse.json(tipos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener tipos de consulta" }, { status: 500 });
  }
}
