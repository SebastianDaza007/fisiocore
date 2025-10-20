import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, password_actual, password_nueva } = body;

    // Validaciones
    if (!user_id || !password_actual || !password_nueva) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (password_nueva.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña nueva debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: parseInt(user_id) }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar la contraseña actual
    const passwordHash = usuario.password_hash_usuario;
    let passwordValida = false;

    // Detectar si es un hash bcrypt (comienza con $2a$ o $2b$)
    if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$')) {
      // Comparar con bcrypt
      passwordValida = await bcrypt.compare(password_actual, passwordHash);
    } else {
      // Comparar texto plano (legacy)
      passwordValida = password_actual === passwordHash;
    }

    if (!passwordValida) {
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 401 }
      );
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (password_actual === password_nueva) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password_nueva, 10);

    // Actualizar la contraseña en la base de datos
    await prisma.usuarios.update({
      where: { id_usuario: parseInt(user_id) },
      data: {
        password_hash_usuario: hashedPassword
      }
    });

    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente'
    }, { status: 200 });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    );
  }
}
