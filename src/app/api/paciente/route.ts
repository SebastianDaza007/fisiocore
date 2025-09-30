// app/api/paciente/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


// -------------------- POST: crear paciente --------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dni, nombre, apellido, fechaNacimiento, email, telefono, direccion, obraSocial } = body;

    // Validaciones
    if (!dni || !nombre || !apellido || !fechaNacimiento || !telefono || !obraSocial) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: DNI, nombre, apellido, fecha de nacimiento, teléfono y obra social' },
        { status: 400 }
      );
    }
    if (dni.length > 8) {
      return NextResponse.json({ error: 'El DNI no puede tener más de 8 caracteres' }, { status: 400 });
    }
    if (telefono.length > 20) {
      return NextResponse.json({ error: 'El teléfono no puede tener más de 20 caracteres' }, { status: 400 });
    }
    if (email && email.length > 150) {
      return NextResponse.json({ error: 'El email no puede tener más de 150 caracteres' }, { status: 400 });
    }

    // Buscar obra social por nombre
    const obraSocialExistente = await prisma.obras_sociales.findFirst({
      where: { nombre_obra_social: obraSocial },
    });
    if (!obraSocialExistente) {
      return NextResponse.json({ error: 'La obra social especificada no existe' }, { status: 400 });
    }

    // Verificar DNI duplicado
    const pacienteExistente = await prisma.pacientes.findFirst({
      where: { dni_paciente: dni },
    });
    if (pacienteExistente) {
      return NextResponse.json({ error: 'Ya existe un paciente con este DNI' }, { status: 409 });
    }

    // Crear paciente
    const nuevoPaciente = await prisma.pacientes.create({
      data: {
        dni_paciente: dni,
        nombre_paciente: nombre,
        apellido_paciente: apellido,
        email_paciente: email || null,
        telefono_paciente: telefono,
        fecha_nacimiento_paciente: new Date(fechaNacimiento),
        direccion_paciente: direccion || null,
        obra_social_id: obraSocialExistente.id_obra_social,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Paciente registrado exitosamente', paciente: nuevoPaciente },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al registrar el paciente' },
      { status: 500 }
    );
  } finally {
  }
}

// -------------------- GET: lista de pacientes --------------------
export async function GET() {
  try {
    const pacientes = await prisma.pacientes.findMany({
      select: {
        id_paciente: true,
        dni_paciente: true,
        nombre_paciente: true,
        apellido_paciente: true,
        email_paciente: true,
        telefono_paciente: true,
        fecha_nacimiento_paciente: true,
        direccion_paciente: true,
        obras_sociales: {
          select: { nombre_obra_social: true },
        },
      },
      orderBy: { id_paciente: 'desc' },
    });

    return NextResponse.json(pacientes);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
  }
}
