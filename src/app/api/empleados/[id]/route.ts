import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const empleadoId = parseInt(id);

    if (isNaN(empleadoId)) {
      return NextResponse.json(
        { error: 'ID de empleado inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email_usuario, estado } = body;

    // Validaciones
    if (!email_usuario || !email_usuario.trim()) {
      return NextResponse.json(
        { error: 'El email es obligatorio' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_usuario)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar que el empleado existe y NO es un profesional
    const empleado = await prisma.usuarios.findUnique({
      where: { id_usuario: empleadoId },
      include: {
        profesionales: true,
      }
    });

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    if (empleado.profesionales) {
      return NextResponse.json(
        { error: 'No se puede editar un profesional desde este módulo' },
        { status: 400 }
      );
    }

    // Verificar que el email no esté en uso por otro usuario
    const emailEnUso = await prisma.usuarios.findFirst({
      where: {
        email_usuario: email_usuario.trim(),
        id_usuario: {
          not: empleadoId
        }
      }
    });

    if (emailEnUso) {
      return NextResponse.json(
        { error: 'El email ya está registrado en otro usuario' },
        { status: 400 }
      );
    }

    // Actualizar el empleado (solo email, el estado es visual)
    const empleadoActualizado = await prisma.usuarios.update({
      where: { id_usuario: empleadoId },
      data: {
        email_usuario: email_usuario.trim(),
      },
      include: {
        roles: true,
      }
    });

    // Agregar el estado visual a la respuesta
    const empleadoConEstado = {
      ...empleadoActualizado,
      estado: estado || 'Activo',
    };

    return NextResponse.json(empleadoConEstado);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el empleado' },
      { status: 500 }
    );
  }
}
