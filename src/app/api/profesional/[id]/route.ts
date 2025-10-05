import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const profesionalId = parseInt(id);

    if (isNaN(profesionalId)) {
      return NextResponse.json(
        { error: "ID de profesional inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, obras_sociales, horarios } = body;

    // Validar que el profesional existe
    const profesional = await prisma.profesionales.findUnique({
      where: { id_profesional: profesionalId },
      include: { usuarios: true }
    });

    if (!profesional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Validar email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validar que al menos haya una obra social
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

    // Validar horarios
    if (horarios && horarios.length > 0) {
      for (const horario of horarios) {
        if (!horario.dia_semana_id || !horario.hora_inicio || !horario.hora_fin) {
          return NextResponse.json(
            { error: "Datos de horario incompletos" },
            { status: 400 }
          );
        }

        // Validar que hora_inicio < hora_fin
        const horaInicio = horario.hora_inicio.split(':');
        const horaFin = horario.hora_fin.split(':');
        const inicioMinutos = parseInt(horaInicio[0]) * 60 + parseInt(horaInicio[1]);
        const finMinutos = parseInt(horaFin[0]) * 60 + parseInt(horaFin[1]);

        if (inicioMinutos >= finMinutos) {
          return NextResponse.json(
            { error: "La hora de inicio debe ser menor a la hora de fin" },
            { status: 400 }
          );
        }
      }
    }

    // Actualizar en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar email del usuario (telefono requeriría modificar el schema)
      await tx.usuarios.update({
        where: { id_usuario: profesional.usuario_id },
        data: { email_usuario: email }
      });

      // 2. Actualizar obras sociales
      // Eliminar todas las relaciones existentes
      await tx.profesionales_por_obras_sociales.deleteMany({
        where: { profesional_id: profesionalId }
      });

      // Crear las nuevas relaciones
      await tx.profesionales_por_obras_sociales.createMany({
        data: obras_sociales.map((obraId: number) => ({
          profesional_id: profesionalId,
          obra_social_id: obraId
        }))
      });

      // 3. Actualizar horarios
      if (horarios) {
        // Eliminar horarios existentes
        await tx.horarios_profesionales.deleteMany({
          where: { profesional_id: profesionalId }
        });

        // Crear nuevos horarios
        if (horarios.length > 0) {
          await tx.horarios_profesionales.createMany({
            data: horarios.map((h: any) => ({
              profesional_id: profesionalId,
              dia_semana_id: h.dia_semana_id,
              hora_inicio: new Date(`1970-01-01T${h.hora_inicio}`),
              hora_fin: new Date(`1970-01-01T${h.hora_fin}`),
              duracion_turno: h.duracion_turno || 30
            }))
          });
        }
      }

      // Retornar el profesional actualizado con todas sus relaciones
      return await tx.profesionales.findUnique({
        where: { id_profesional: profesionalId },
        include: {
          usuarios: true,
          especialidades: true,
          horarios_profesionales: {
            include: {
              dias_semana: true
            }
          },
          profesionales_por_obras_sociales: {
            include: {
              obras_sociales: true
            }
          }
        }
      });
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error actualizando profesional:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar el profesional",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}

// GET para obtener un profesional específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const profesionalId = parseInt(id);

    if (isNaN(profesionalId)) {
      return NextResponse.json(
        { error: "ID de profesional inválido" },
        { status: 400 }
      );
    }

    const profesional = await prisma.profesionales.findUnique({
      where: { id_profesional: profesionalId },
      include: {
        usuarios: true,
        especialidades: true,
        horarios_profesionales: {
          include: {
            dias_semana: true
          }
        },
        profesionales_por_obras_sociales: {
          include: {
            obras_sociales: true
          }
        }
      }
    });

    if (!profesional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(profesional, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo profesional:", error);
    return NextResponse.json(
      { error: "Error al obtener el profesional" },
      { status: 500 }
    );
  }
}
