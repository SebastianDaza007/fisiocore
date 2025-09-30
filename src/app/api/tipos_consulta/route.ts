// app/api/tipo_consulta/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


// -------------------- POST: crear tipo de consulta --------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre_tipo_consulta } = body;

    // Validación
    if (!nombre_tipo_consulta || nombre_tipo_consulta.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del tipo de consulta es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar duplicados
    const tipoExistente = await prisma.tipos_consulta.findFirst({
      where: { nombre_tipo_consulta: nombre_tipo_consulta.trim() },
    });

    if (tipoExistente) {
      return NextResponse.json(
        { error: 'Ya existe un tipo de consulta con este nombre' },
        { status: 409 }
      );
    }

    // Crear tipo de consulta
    const nuevoTipo = await prisma.tipos_consulta.create({
      data: {
        nombre_tipo_consulta: nombre_tipo_consulta.trim(),
      },
    });

    return NextResponse.json(
      { success: true, tipoConsulta: nuevoTipo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear tipo de consulta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear tipo de consulta' },
      { status: 500 }
    );
  } finally {
  }
}

// -------------------- GET: lista de tipos de consulta --------------------
export async function GET() {
  try {
    const tipos = await prisma.tipos_consulta.findMany({
      select: {
        id_tipo_consulta: true,
        nombre_tipo_consulta: true,
      },
      orderBy: { nombre_tipo_consulta: 'asc' },
    });

    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de consulta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener tipos de consulta' },
      { status: 500 }
    );
  } finally {
  }
}
