import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

interface JWTPayload {
  userId: number;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
  profesionalId?: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload

    // Buscar el usuario completo en la BD
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: decoded.userId },
      include: {
        roles: true,
        profesionales: {
          include: {
            especialidades: true
          }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si es una llamada simple (desde useAuth), devolver formato corto
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const isSimpleAuth = !referer.includes('/perfil')

    if (isSimpleAuth) {
      return NextResponse.json({
        user: {
          id: decoded.userId,
          nombre: decoded.nombre,
          apellido: decoded.apellido,
          email: decoded.email,
          rol: decoded.rol,
          profesionalId: decoded.profesionalId
        }
      })
    }

    // Si es desde la página de perfil, devolver información completa
    return NextResponse.json({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      dni_usuario: usuario.dni_usuario,
      email_usuario: usuario.email_usuario,
      roles: {
        nombre_rol: usuario.roles.nombre_rol
      },
      profesionales: usuario.profesionales ? {
        matricula_profesional: usuario.profesionales.matricula_profesional,
        especialidades: {
          nombre_especialidad: usuario.profesionales.especialidades.nombre_especialidad
        }
      } : null
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
}