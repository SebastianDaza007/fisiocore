import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface HorarioData {
  dia_semana_id: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_turno: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dni, nombre, apellido, fecha_nacimiento, email, matricula, especialidad_id, obras_sociales, horarios, password } = body;

    // Validaciones
    if (!dni || dni.length !== 8) {
      return NextResponse.json(
        { error: "DNI inválido" },
        { status: 400 }
      );
    }

    if (!nombre || !apellido || !email || !matricula || !especialidad_id) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    if (!obras_sociales || obras_sociales.length === 0) {
      return NextResponse.json(
        { error: "Debe seleccionar al menos una obra social" },
        { status: 400 }
      );
    }

    // Validar que "Particular" esté incluida
    const particularOS = await prisma.obras_sociales.findFirst({
      where: { nombre_obra_social: "Particular" }
    });

    if (particularOS && !obras_sociales.includes(particularOS.id_obra_social)) {
      return NextResponse.json(
        { error: 'La obra social "Particular" debe estar siempre seleccionada' },
        { status: 400 }
      );
    }

    // Verificar que el DNI no exista
    const existeUsuario = await prisma.usuarios.findFirst({
      where: { dni_usuario: dni }
    });

    if (existeUsuario) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese DNI" },
        { status: 400 }
      );
    }

    // Verificar que el email no exista
    const existeEmail = await prisma.usuarios.findFirst({
      where: { email_usuario: email }
    });

    if (existeEmail) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      );
    }

    // Verificar que la matrícula no exista
    const existeMatricula = await prisma.profesionales.findFirst({
      where: { matricula_profesional: matricula }
    });

    if (existeMatricula) {
      return NextResponse.json(
        { error: "Ya existe un profesional con esa matrícula" },
        { status: 400 }
      );
    }

    // Obtener el rol PROFESIONAL
    const rolProfesional = await prisma.roles.findFirst({
      where: { nombre_rol: "PROFESIONAL" }
    });

    if (!rolProfesional) {
      return NextResponse.json(
        { error: "No se encontró el rol PROFESIONAL en el sistema" },
        { status: 500 }
      );
    }

    // Hashear la contraseña proporcionada
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear usuario
      const usuario = await tx.usuarios.create({
        data: {
          nombre_usuario: nombre,
          apellido_usuario: apellido,
          dni_usuario: dni,
          email_usuario: email,
          password_hash_usuario: passwordHash,
          rol_id: rolProfesional.id_rol
        }
      });

      // 2. Crear profesional
      const profesional = await tx.profesionales.create({
        data: {
          usuario_id: usuario.id_usuario,
          matricula_profesional: matricula,
          especialidad_id: especialidad_id
        }
      });

      // 3. Crear relaciones con obras sociales
      await tx.profesionales_por_obras_sociales.createMany({
        data: obras_sociales.map((obraId: number) => ({
          profesional_id: profesional.id_profesional,
          obra_social_id: obraId
        }))
      });

      // 4. Crear horarios si se proporcionan
      if (horarios && horarios.length > 0) {
        await tx.horarios_profesionales.createMany({
          data: horarios.map((h: HorarioData) => ({
            profesional_id: profesional.id_profesional,
            dia_semana_id: h.dia_semana_id,
            hora_inicio: new Date(`1970-01-01T${h.hora_inicio}`),
            hora_fin: new Date(`1970-01-01T${h.hora_fin}`),
            duracion_turno: h.duracion_turno || 30
          }))
        });
      }

      return {
        usuario,
        profesional
      };
    });

    return NextResponse.json({
      success: true,
      message: "Profesional registrado exitosamente",
      data: {
        id_profesional: result.profesional.id_profesional,
        id_usuario: result.usuario.id_usuario
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error registrando profesional:", error);
    return NextResponse.json(
      {
        error: "Error al registrar el profesional",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}
