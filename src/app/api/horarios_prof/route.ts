import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// -------------------- Función para generar slots --------------------
function generarSlots(horaInicio: Date, horaFin: Date, duracionMinutos: number) {
  const slots: string[] = [];
  const start = new Date(horaInicio);
  const end = new Date(horaFin);

  while (start.getTime() + duracionMinutos * 60000 <= end.getTime()) {
    slots.push(start.toTimeString().slice(0, 5)); // "HH:MM"
    start.setMinutes(start.getMinutes() + duracionMinutos);
  }

  return slots;
}

// -------------------- Función para calcular próxima fecha --------------------
function getProximaFecha(diaSemana: string): string {
  const hoy = new Date();
  const indiceHoy = hoy.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  
  // Solo días laborables
  const diasMap: { [key: string]: number } = {
    'lunes': 1,
    'martes': 2, 
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5
  };
  
  const indiceTarget = diasMap[diaSemana.toLowerCase()];
  if (indiceTarget === undefined) return "";

  let diferencia = indiceTarget - indiceHoy;
  if (diferencia < 0) diferencia += 7;

  const proximaFecha = new Date(hoy);
  proximaFecha.setDate(hoy.getDate() + diferencia);

  return proximaFecha.toISOString().split("T")[0];
}

// -------------------- Route GET --------------------
export async function GET() {
  try {
    const ahora = new Date();
    const horaLimite = new Date(ahora.getTime() + 60 * 60 * 1000); // 60 minutos después

    const horarios = await prisma.horarios_profesionales.findMany({
      include: {
        dias_semana: true,
        profesionales: {
          include: {
            usuarios: { select: { nombre_usuario: true, apellido_usuario: true } },
            especialidades: { select: { nombre_especialidad: true } },
          },
        },
      },
    });

    const turnosOcupados = await prisma.turnos.findMany({
      where: {
        estado_turno_id: 2,
        fecha_turno: {
          gte: new Date()
        }
      },
      select: {
        profesional_id: true,
        fecha_turno: true,
        hora_turno: true,
      },
    });

    console.log(`Encontrados ${turnosOcupados.length} turnos ocupados (confirmados)`);

    const turnosDisponibles: any[] = [];
    let idSlot = 1;

    horarios.forEach((h) => {
      const fecha = getProximaFecha(h.dias_semana.nombre_dia);
      const slots = generarSlots(h.hora_inicio, h.hora_fin, h.duracion_turno || 30);

      slots.forEach((hora) => {
        // Validar que el turno sea al menos 60 minutos después de la hora actual
        const fechaHoraTurno = new Date(`${fecha}T${hora}`);
        if (fechaHoraTurno <= horaLimite) {
          return; // Saltar este slot (muy próximo o pasado)
        }

        const estaOcupado = turnosOcupados.some(turno => {
          const turnoFecha = turno.fecha_turno.toISOString().split('T')[0];
          const turnoHora = turno.hora_turno.toTimeString().substring(0, 5);

          return turno.profesional_id === h.profesional_id &&
                 turnoFecha === fecha &&
                 turnoHora === hora;
        });

        if (!estaOcupado) {
          turnosDisponibles.push({
            id: idSlot++,
            id_horario: h.id_horario,
            profesional_id: h.profesional_id,
            profesional_nombre: `${h.profesionales.usuarios.nombre_usuario} ${h.profesionales.usuarios.apellido_usuario}`,
            especialidad: h.profesionales.especialidades.nombre_especialidad,
            dia: h.dias_semana.nombre_dia,
            fecha,
            hora,
            estado: "disponible",
          });
        }
      });
    });

    console.log(`Generados ${turnosDisponibles.length} slots disponibles (solo Lunes-Viernes)`);

    // Ordenar por fecha y hora (más próximos primero)
    turnosDisponibles.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return fechaA.getTime() - fechaB.getTime();
    });

    return NextResponse.json(turnosDisponibles);
  } catch (error) {
    console.error("Error al generar turnos disponibles:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}