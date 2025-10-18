"use client";

import { addLocale, locale } from "primereact/api";
import React, { useState, useCallback, useEffect } from "react";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

// 🧩 Configuración del idioma español para PrimeReact
addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    monthNames: [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ],
    monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    today: "Hoy",
    clear: "Limpiar",
});
locale("es");

type ObraPacData = { nombre: string; cantidad: number };
type GeneroEdadData = {
    rango: string;
    [genero: string]: number | string;
};
type DiasDemandaData = { dia: string; cantidad: number };

export default function DashboardPacientes() {
    // 🔹 Filtros
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const [obraSocial, setObraSocial] = useState<string | null>(null);

    const [dataPacientesObra, setDataPacientesObra] = useState<ObraPacData[]>([]);
    const [dataPacientesGeneroEdad, setDataPacientesGeneroEdad] = useState<GeneroEdadData[]>([]);
    const [dataDiasDemanda, setDataDiasDemanda] = useState<DiasDemandaData[]>([]); // 🧩 Nuevo
    const [loadingChart, setLoadingChart] = useState(false);

    const obrasSociales = [
        { label: "Todas las obras sociales", value: null },
        { label: "OSDE", value: "OSDE" },
        { label: "Swiss Medical", value: "Swiss Medical" },
        { label: "Galeno", value: "Galeno" },
    ];

    // 🔹 Reporte: Pacientes por obra social
    const fetchPacientesPorObra = useCallback(async () => {
        try {
        setLoadingChart(true);
        const res = await fetch("/api/reportes/pacientes-por-obra", { cache: "no-store" });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setDataPacientesObra(Array.isArray(data) ? data : []);
        } catch (err) {
        console.error("Error al cargar pacientes por obra social:", err);
        setDataPacientesObra([]);
        } finally {
        setLoadingChart(false);
        }
    }, []);

    // 🔹 Reporte: Pacientes por género y edad
    const fetchPacientesGeneroEdad = useCallback(async () => {
        try {
        setLoadingChart(true);
        const res = await fetch("/api/reportes/pacientes-por-genero-edad", { cache: "no-store" });
        if (!res.ok) throw new Error("Error al cargar distribución");
        const data = await res.json();
        setDataPacientesGeneroEdad(Array.isArray(data) ? data : []);
        } catch (err) {
        console.error("Error al cargar pacientes por género y edad:", err);
        setDataPacientesGeneroEdad([]);
        } finally {
        setLoadingChart(false);
        }
    }, []);

    // 🧩 Reporte: Días con mayor demanda
    const fetchDiasMayorDemanda = useCallback(async () => {
        try {
        const params = new URLSearchParams();
        if (dateRange?.[0] && dateRange?.[1]) {
            params.set("startDate", dateRange[0].toISOString());
            params.set("endDate", dateRange[1].toISOString());
        }

        const res = await fetch(`/api/reportes/dias-mayor-demanda?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Error al cargar días con mayor demanda");
        const data = await res.json();
        setDataDiasDemanda(Array.isArray(data) ? data : []);
        } catch (err) {
        console.error("Error al cargar días con mayor demanda:", err);
        setDataDiasDemanda([]);
        }
    }, [dateRange]);

    // 🔹 useEffect inicial
    useEffect(() => {
        fetchPacientesPorObra();
        fetchPacientesGeneroEdad();
        fetchDiasMayorDemanda(); // 🧩 Nuevo
    }, [fetchPacientesPorObra, fetchPacientesGeneroEdad, fetchDiasMayorDemanda]);

    // 🔹 Filtrar
    const handleFilter = () => {
        fetchPacientesPorObra();
        fetchDiasMayorDemanda(); // 🧩 Nuevo
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-800">
        {/* 🩺 Header */}
        <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-5">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard de Pacientes</h1>
            <p className="text-gray-600">
            Visualiza métricas relacionadas con los pacientes, obras sociales y actividad general.
            </p>
        </div>

        {/* 🔹 Filtros */}
        <div className="bg-white/95 rounded-2xl border border-gray-200 shadow-sm p-5 mb-8 flex flex-wrap gap-4 items-end backdrop-blur-sm">
            <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Obra Social</label>
            <Dropdown
                value={obraSocial}
                options={obrasSociales}
                onChange={(e) => setObraSocial(e.value)}
                placeholder="Seleccionar"
                className="w-full"
            />
            </div>

            <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rango de fechas</label>
            <Calendar
                value={dateRange}
                onChange={(e) => setDateRange(e.value as Date[] | null)}
                selectionMode="range"
                dateFormat="dd/mm/yy"
                showIcon
                locale="es"
                appendTo={typeof window !== "undefined" ? document.body : undefined}
                className="w-full"
            />
            </div>

            <Button
            icon="pi pi-search"
            label="Filtrar"
            className="h-[42px]"
            severity="info"
            onClick={handleFilter}
            />
        </div>

        {/* 🔹 Reporte: Cantidad de pacientes por obra social */}
        <Card
            title="Cantidad de pacientes por obra social"
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50"
        >
            <div className="h-[360px] flex items-center justify-center text-gray-400">
            {loadingChart ? (
                <span className="text-sm text-gray-500">Cargando datos...</span>
            ) : dataPacientesObra.length === 0 ? (
                <span className="text-sm text-gray-500">No hay datos disponibles.</span>
            ) : (
                <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                    <Pie
                    data={dataPacientesObra}
                    dataKey="cantidad"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    labelLine={false}
                    label={(props) => {
                        const { name, value, percent } = props as {
                        name?: string;
                        value?: number;
                        percent?: number;
                        };
                        return `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`;
                    }}
                    >
                    {dataPacientesObra.map((_, i) => {
                        const COLORS = [
                        "#14b8a6", "#3b82f6", "#f59e0b", "#ef4444",
                        "#8b5cf6", "#10b981", "#06b6d4", "#84cc16",
                        "#f97316", "#a855f7", "#e11d48", "#22c55e",
                        ];
                        return <Cell key={i} fill={COLORS[i % COLORS.length]} />;
                    })}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} pacientes`, "Cantidad"]} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
                </ResponsiveContainer>
            )}
            </div>
        </Card>

        {/* 🔹 Reporte: Pacientes por género y edad */}
        <div className="mt-10">
            <Card
            title="Distribución de pacientes por género y edad"
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50"
            >
            <div className="h-[400px] flex items-center justify-center text-gray-400 p-4">
                {loadingChart ? (
                <span className="text-sm text-gray-500">Cargando datos...</span>
                ) : dataPacientesGeneroEdad.length === 0 ? (
                <span className="text-sm text-gray-500">No hay datos disponibles.</span>
                ) : (
                <ResponsiveContainer width="100%" height={360}>
                    {(() => {
                    const generos = ["Masculino", "Femenino", "No especificado"];
                    const dataNormalizada = dataPacientesGeneroEdad.map((fila) => {
                        const f = { ...fila };
                        generos.forEach((g) => {
                        if (typeof f[g] !== "number") f[g] = 0;
                        });
                        return f;
                    });

                    return (
                        <BarChart data={dataNormalizada}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="rango" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Masculino" fill="#3b82f6" name="Masculino" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Femenino" fill="#ec4899" name="Femenino" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="No especificado" fill="#9ca3af" name="No especificado" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    );
                    })()}
                </ResponsiveContainer>
                )}
            </div>
            </Card>
        </div>

        {/* 🧩 Nuevo Reporte: Días con mayor demanda */}
        <div className="mt-10">
            <Card
            title="Días con mayor demanda de turnos"
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50"
            >
            <div className="h-[350px] flex items-center justify-center text-gray-400">
                {dataDiasDemanda.length === 0 ? (
                <span className="text-sm text-gray-500">No hay datos disponibles.</span>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataDiasDemanda}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(v) => [`${v} turnos`, "Cantidad"]} />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                        {dataDiasDemanda.map((_, i) => {
                        const colores = ["#14b8a6", "#3b82f6", "#f59e0b", "#ef4444", "#10b981"];
                        return <Cell key={i} fill={colores[i % colores.length]} />;
                        })}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                )}
            </div>
            </Card>
        </div>

        {/* Estilos globales */}
        <style jsx global>{`
            .p-datepicker table td > span {
            color: #374151 !important;
            font-weight: 500;
            }
            .p-datepicker table td > span.p-highlight {
            background-color: #14b8a6 !important;
            color: #ffffff !important;
            border-radius: 50% !important;
            font-weight: 600;
            }
            .p-datepicker table td > span:hover {
            background-color: #d1f5f0 !important;
            border-radius: 50% !important;
            }
        `}</style>
        </div>
    );
}
