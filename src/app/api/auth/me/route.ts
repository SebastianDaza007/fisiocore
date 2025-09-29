import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
}