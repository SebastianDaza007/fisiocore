import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Función helper para formatear hora desde DateTime
function formatearHora(horaTurno: Date): string {
  const hora = new Date(horaTurno);
  const horas = hora.getHours().toString().padStart(2, '0');
  const minutos = hora.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

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
    // Verificar autenticación (usar el mismo nombre de cookie que auth/me)
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;

    // Verificar que tenga profesionalId en el token
    if (!decoded.profesionalId) {
      return NextResponse.json({ error: "No es un profesional" }, { status: 403 });
    }

    const profesionalId = decoded.profesionalId;

    // Obtener fecha actual (solo día, sin hora)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Turnos del profesional del día
    const turnosHoy = await prisma.turnos.findMany({
      where: {
        profesional_id: profesionalId,
        fecha_turno: {
          gte: hoy,
          lt: manana,
        },
      },
      include: {
        pacientes: true,
        estados_turno: true,
        tipos_consulta: true,
      },
    });

    // Total de pacientes hoy (turnos totales)
    const pacientesHoy = turnosHoy.length;

    // Turnos completados/atendidos (todo el día - para fines demostrativos)
    const completados = turnosHoy.filter(
      t => t.estados_turno?.nombre_estado_turno === "COMPLETADO"
    ).length;

    // Turnos pendientes (confirmados o en espera - todo el día)
    const pendientes = turnosHoy.filter(
      t => t.estados_turno?.nombre_estado_turno === "CONFIRMADO" ||
           t.estados_turno?.nombre_estado_turno === "EN ESPERA"
    ).length;

    // Alertas: todos los pacientes en espera del día (sin filtro de hora)
    const alertas = turnosHoy.filter(
      t => t.estados_turno?.nombre_estado_turno === "EN ESPERA"
    ).length;

    // Próximos turnos del día (solo EN ESPERA y CONFIRMADO)
    const proximosTurnos = turnosHoy
      .filter(t => {
        if (!t.hora_turno) return false;

        const estado = t.estados_turno?.nombre_estado_turno;
        return estado === "EN ESPERA" || estado === "CONFIRMADO";
      })
      .sort((a, b) => {
        if (!a.hora_turno || !b.hora_turno) return 0;
        return new Date(a.hora_turno).getTime() - new Date(b.hora_turno).getTime();
      })
      .slice(0, 3)
      .map(t => ({
        id: t.id_turno,
        texto: `Turno ${formatearHora(t.hora_turno!)} - ${t.pacientes.nombre_paciente} ${t.pacientes.apellido_paciente}`,
        icon: "pi pi-clock",
      }));

    // Pacientes en sala de espera (todos del día)
    const pacientesEnEspera = turnosHoy
      .filter(t => t.estados_turno?.nombre_estado_turno === "EN ESPERA" && t.hora_turno)
      .sort((a, b) => {
        if (!a.hora_turno || !b.hora_turno) return 0;
        return new Date(a.hora_turno).getTime() - new Date(b.hora_turno).getTime();
      })
      .map((t, index) => ({
        id: t.id_turno,
        texto: `${index + 1}. ${t.pacientes.nombre_paciente} ${t.pacientes.apellido_paciente} - Turno ${formatearHora(t.hora_turno!)}`,
        icon: "pi pi-user",
      }));

    return NextResponse.json({
      resumen: {
        pacientesHoy,
        completados,
        pendientes,
        alertas,
      },
      proximosTurnos,
      pacientesEnEspera,
    });

  } catch (error) {
    console.error("Error al obtener resumen del profesional:", error);
    return NextResponse.json(
      { error: "Error al obtener resumen del día" },
      { status: 500 }
    );
  }
}
