import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ Utilidad para calcular edad actual
function calcularEdad(fechaNac: Date) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad;
}

// ✅ Determinar rango de edad
function rangoEdad(edad: number): string {
    if (edad <= 17) return "0-17";
    if (edad <= 30) return "18-30";
    if (edad <= 50) return "31-50";
    if (edad <= 65) return "51-65";
    return "66+";
}

// 🚀 Método GET — ¡debe estar exportado así!
export async function GET() {
    try {
        // 1️⃣ Traer pacientes con sus campos relevantes
        const pacientes = await prisma.pacientes.findMany({
        select: {
            id_paciente: true,
            sexo_paciente: true,
            fecha_nacimiento_paciente: true,
        },
        });

        // 2️⃣ Procesar y agrupar
        const conteo: Record<string, Record<string, number>> = {};

        pacientes.forEach((p) => {
        const edad = calcularEdad(p.fecha_nacimiento_paciente);
        const grupo = rangoEdad(edad);
        const sexo = p.sexo_paciente || "No especificado";

        if (!conteo[grupo]) conteo[grupo] = {};
        if (!conteo[grupo][sexo]) conteo[grupo][sexo] = 0;
        conteo[grupo][sexo]++;
        });

        // 3️⃣ Convertir a formato plano para Recharts
        const data = Object.entries(conteo).map(([grupo, sexos]) => ({
        rango: grupo,
        ...sexos,
        }));

        // 4️⃣ Ordenar los rangos de edad
        const orden = ["0-17", "18-30", "31-50", "51-65", "66+"];
        const ordenados = data.sort(
        (a, b) => orden.indexOf(a.rango) - orden.indexOf(b.rango)
        );

        return NextResponse.json(ordenados);
    } catch (error) {
        console.error("❌ Error /api/reportes/pacientes-por-genero-edad:", error);
        return NextResponse.json(
        { error: "Error al obtener distribución de pacientes por género y edad" },
        { status: 500 }
        );
    }
}
