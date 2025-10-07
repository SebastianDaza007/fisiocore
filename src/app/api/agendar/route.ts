import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, profesional_id, fecha_turno, hora_turno } = body;

    if (!paciente_id || !profesional_id || !fecha_turno || !hora_turno) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // convertimos fecha/hora a Date para Prisma: fecha -> YYYY-MM-DD, hora -> HH:MM[:SS]
    const fecha = new Date(fecha_turno); // guarda como Date (DB campo @db.Date)
    // hora como Date: usamos epoch + hora
    const horaIso = `1970-01-01T${hora_turno}${hora_turno.length <= 5 ? ':00' : ''}Z`;
    const hora = new Date(horaIso);

    const nuevo = await prisma.turnos.create({
      data: {
        paciente_id,
        profesional_id,
        fecha_turno: fecha,
        hora_turno: hora,
        estado_turno_id: 1, // default, ajustar según tu lógica
        tipo_consulta_id: 1,
        fecha_agendamiento_turno: new Date(),
      },
    });

    return NextResponse.json({ success: true, turno: nuevo }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
