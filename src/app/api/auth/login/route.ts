import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { dni, password } = await request.json()

    console.log('🔍 Login attempt:', { dni: dni, passwordLength: password?.length })

    if (!dni || !password) {
      return NextResponse.json(
        { error: 'DNI y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por dni_usuario con su rol
    const usuario = await prisma.usuarios.findFirst({
      where: { dni_usuario: dni },
      include: {
        roles: true,
        profesionales: true
      }
    })

    console.log('👤 Usuario encontrado:', {
      found: !!usuario,
      nombreUsuario: usuario?.nombre_usuario,
      email: usuario?.email_usuario,
      hasPassword: !!usuario?.password_hash_usuario,
      passwordFromDB: usuario?.password_hash_usuario,
      rol: usuario?.roles?.nombre_rol
    })

    if (!usuario) {
      console.log('❌ Usuario no encontrado para DNI:', dni)
      return NextResponse.json(
        { error: 'Credenciales inválidas - Usuario no encontrado' },
        { status: 401 }
      )
    }

    // Verificar contraseña (comparación directa de strings)
    console.log('🔐 Verificando contraseña...')
    console.log('🔐 Password enviado:', password)
    console.log('🔐 Password en BD:', usuario.password_hash_usuario)
    const isValidPassword = password === usuario.password_hash_usuario
    console.log('🔐 Resultado verificación:', { isValidPassword })

    if (!isValidPassword) {
      console.log('❌ Contraseña inválida para DNI:', dni)
      return NextResponse.json(
        { error: 'Credenciales inválidas - Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Crear JWT
    const token = jwt.sign(
      {
        userId: usuario.id_usuario,
        email: usuario.email_usuario,
        rol: usuario.roles.nombre_rol,
        nombre: usuario.nombre_usuario,
        apellido: usuario.apellido_usuario,
        profesionalId: usuario.profesionales?.id_profesional || null
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '120m' }
    )

    // Configurar cookie
    const response = NextResponse.json({
      user: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        apellido: usuario.apellido_usuario,
        email: usuario.email_usuario,
        rol: usuario.roles.nombre_rol,
        profesionalId: usuario.profesionales?.id_profesional || null
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 horas
    })

    return response

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}