import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      dni_usuario,
      nombre_usuario,
      apellido_usuario,
      email_usuario,
      password,
      rol_id
    } = body;

    // Validaciones
    if (!dni_usuario || !nombre_usuario || !apellido_usuario || !email_usuario || !password || !rol_id) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Validar DNI (7 u 8 dígitos)
    if (!/^\d{7,8}$/.test(dni_usuario)) {
      return NextResponse.json(
        { error: 'El DNI debe tener 7 u 8 dígitos' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_usuario)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido (1=ADMIN, 2=GERENTE, 4=ADMINISTRATIVO)
    // No permitir rol 3=PROFESIONAL desde este endpoint
    if (![1, 2, 4].includes(rol_id)) {
      return NextResponse.json(
        { error: 'Rol no válido para empleados' },
        { status: 400 }
      );
    }

    // Verificar si el DNI ya existe
    const dniExistente = await prisma.usuarios.findFirst({
      where: { dni_usuario }
    });

    if (dniExistente) {
      return NextResponse.json(
        { error: 'El DNI ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const emailExistente = await prisma.usuarios.findFirst({
      where: { email_usuario }
    });

    if (emailExistente) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario empleado
    const nuevoEmpleado = await prisma.usuarios.create({
      data: {
        dni_usuario,
        nombre_usuario,
        apellido_usuario,
        email_usuario,
        password_hash_usuario: hashedPassword,
        rol_id
      },
      include: {
        roles: true
      }
    });

    // Retornar el empleado creado (sin la contraseña)
    const { password_hash_usuario, ...empleadoSinPassword } = nuevoEmpleado;

    return NextResponse.json({
      message: 'Empleado registrado exitosamente',
      empleado: empleadoSinPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Error al registrar empleado:', error);
    return NextResponse.json(
      { error: 'Error al registrar el empleado' },
      { status: 500 }
    );
  }
}
