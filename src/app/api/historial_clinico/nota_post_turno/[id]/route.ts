import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idRegistro = Number(id);
    if (isNaN(idRegistro)) {
      return NextResponse.json({ error: "ID de registro no válido" }, { status: 400 });
    }

    const body = await req.json();
    const { nota_post_turno } = body ?? {};

    if (typeof nota_post_turno !== "string") {
      return NextResponse.json({ error: "nota_post_turno es requerida" }, { status: 400 });
    }

    const updated = await prisma.registros_clinicos.update({
      where: { id_registro: idRegistro },
      data: { nota_post_turno: nota_post_turno.trim() || null },
      select: {
        id_registro: true,
        nota_post_turno: true,
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error al actualizar nota_post_turno:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
