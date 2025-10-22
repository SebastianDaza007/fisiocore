import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Obtener fecha actual (solo día, sin hora)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Obtener inicio y fin del mes actual
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    finMes.setHours(23, 59, 59, 999);

    // Turnos del día
    const turnosHoy = await prisma.turnos.findMany({
      where: {
        fecha_turno: {
          gte: hoy,
          lt: manana,
        },
      },
      include: {
        estados_turno: true,
        profesionales: {
          include: {
            usuarios: true,
            especialidades: true,
          },
        },
      },
    });

    // Turnos del mes
    const turnosMes = await prisma.turnos.findMany({
      where: {
        fecha_turno: {
          gte: inicioMes,
          lte: finMes,
        },
      },
      include: {
        estados_turno: true,
      },
    });

    // Total de turnos hoy
    const totalTurnosHoy = turnosHoy.length;

    // Total de profesionales activos
    const totalProfesionales = await prisma.profesionales.count();

    // Total de pacientes únicos hoy
    const pacientesUnicos = new Set(turnosHoy.map(t => t.paciente_id));
    const totalPacientesHoy = pacientesUnicos.size;

    // Tasa de ocupación del día (completados + atendidos / total)
    const turnosCompletadosHoy = turnosHoy.filter(
      t => t.estados_turno?.nombre_estado_turno === "COMPLETADO" ||
           t.estados_turno?.nombre_estado_turno === "ATENDIDO"
    ).length;
    const tasaOcupacion = totalTurnosHoy > 0
      ? Math.round((turnosCompletadosHoy / totalTurnosHoy) * 100)
      : 0;

    // Turnos cancelados del mes
    const canceladosMes = turnosMes.filter(
      t => t.estados_turno?.nombre_estado_turno === "CANCELADO"
    ).length;

    // Profesionales más activos del mes (top 3)
    const profesionalesPorTurnos = turnosMes.reduce((acc, turno) => {
      const profId = turno.profesional_id;
      if (profId) {
        acc[profId] = (acc[profId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const topProfesionales = await Promise.all(
      Object.entries(profesionalesPorTurnos)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(async ([profId, count]) => {
          const prof = await prisma.profesionales.findUnique({
            where: { id_profesional: parseInt(profId) },
            include: {
              usuarios: true,
              especialidades: true,
            },
          });
          return {
            id: parseInt(profId),
            nombre: `${prof?.usuarios?.nombre_usuario} ${prof?.usuarios?.apellido_usuario}`,
            especialidad: prof?.especialidades?.nombre_especialidad || "Sin especialidad",
            turnos: count,
          };
        })
    );

    // Próximos turnos críticos del día (próximos 3 turnos confirmados o en espera)
    const ahora = new Date();
    const proximosTurnos = turnosHoy
      .filter(t => {
        if (!t.hora_turno) return false;
        const estado = t.estados_turno?.nombre_estado_turno;
        return estado === "CONFIRMADO" || estado === "EN ESPERA";
      })
      .sort((a, b) => {
        if (!a.hora_turno || !b.hora_turno) return 0;
        return new Date(a.hora_turno).getTime() - new Date(b.hora_turno).getTime();
      })
      .slice(0, 3)
      .map(t => ({
        id: t.id_turno,
        hora: t.hora_turno ? new Date(t.hora_turno).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit'
        }) : '',
        profesional: `${t.profesionales?.usuarios?.nombre_usuario} ${t.profesionales?.usuarios?.apellido_usuario}`,
        especialidad: t.profesionales?.especialidades?.nombre_especialidad || '',
      }));

    // Alertas estratégicas
    const alertasEstrategicas = [];

    // Alerta: tasa de cancelación alta en el mes (>15%)
    const tasaCancelacion = turnosMes.length > 0
      ? Math.round((canceladosMes / turnosMes.length) * 100)
      : 0;
    if (tasaCancelacion > 15) {
      alertasEstrategicas.push({
        id: 1,
        texto: `Tasa de cancelación alta este mes: ${tasaCancelacion}%`,
        icon: 'pi pi-exclamation-triangle',
      });
    }

    // Alerta: ocupación baja hoy (<70%)
    if (tasaOcupacion < 70 && totalTurnosHoy > 0) {
      alertasEstrategicas.push({
        id: 2,
        texto: `Baja ocupación hoy: ${tasaOcupacion}%`,
        icon: 'pi pi-chart-line',
      });
    }

    // Alerta: pocos turnos agendados para hoy
    if (totalTurnosHoy < 10) {
      alertasEstrategicas.push({
        id: 3,
        texto: `Pocos turnos agendados hoy: ${totalTurnosHoy}`,
        icon: 'pi pi-calendar',
      });
    }

    return NextResponse.json({
      resumen: {
        turnosHoy: totalTurnosHoy,
        ocupacion: tasaOcupacion,
        pacientesHoy: totalPacientesHoy,
        profesionales: totalProfesionales,
      },
      proximosTurnos,
      topProfesionales,
      alertasEstrategicas,
    });

  } catch (error) {
    console.error("Error al obtener resumen gerencial:", error);
    return NextResponse.json(
      { error: "Error al obtener resumen gerencial" },
      { status: 500 }
    );
  }
}
