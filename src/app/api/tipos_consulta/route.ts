// app/api/tipos-consulta/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tiposConsulta = await prisma.tipos_consulta.findMany({
      select: {
        id_tipo_consulta: true,
        nombre_tipo_consulta: true,
      },
      orderBy: {
        nombre_tipo_consulta: "asc",
      },
    });
    return NextResponse.json(tiposConsulta);
  } catch (error) {
    console.error("Error fetching tipos de consulta:", error);
    return NextResponse.json(
      { error: "Error al obtener tipos de consulta" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
