import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Obtener todos los registros clínicos para el historial
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get('paciente_id');
    const profesionalId = searchParams.get('profesional_id');

    const where = {
      ...(pacienteId && { paciente_id: parseInt(pacienteId) }),
      ...(profesionalId && { profesional_id: parseInt(profesionalId) }),
    };

    const registros = await prisma.registros_clinicos.findMany({
      where,
      include: {
        // NOMBRES EXACTOS de tu schema:
        pacientes: {
          select: {
            id_paciente: true,
            nombre_paciente: true,
            apellido_paciente: true,
          }
        },
        profesionales: {
          select: {
            id_profesional: true,
            usuarios: {
              select: {
                nombre_usuario: true,
                apellido_usuario: true,
              }
            },
            especialidades: {
              select: {
                nombre_especialidad: true
              }
            }
          }
        },
        turnos: {
          select: {
            id_turno: true,
            fecha_turno: true,
            hora_turno: true,
            estados_turno: {
              select: {
                nombre_estado_turno: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_registro: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: registros,
      total: registros.length 
    });
  } catch (error) {
    console.error("Error al obtener registros clínicos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro clínico
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, turno_id, profesional_id, texto_comentario, texto_indicacion } = body;

    // Validaciones
    if (!paciente_id || !turno_id || !profesional_id || !texto_comentario || !texto_indicacion) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const nuevoRegistro = await prisma.registros_clinicos.create({
      data: {
        paciente_id: parseInt(paciente_id),
        turno_id: parseInt(turno_id),
        profesional_id: parseInt(profesional_id),
        texto_comentario: texto_comentario.trim(),
        texto_indicacion: texto_indicacion.trim(),
        fecha_registro: new Date()
      },
      include: {
        pacientes: {
          select: {
            id_paciente: true,
            nombre_paciente: true,
            apellido_paciente: true,
          }
        },
        profesionales: {
          select: {
            id_profesional: true,
            usuarios: {
              select: {
                nombre_usuario: true,
                apellido_usuario: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Registro clínico creado exitosamente",
        data: nuevoRegistro 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear registro clínico:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}