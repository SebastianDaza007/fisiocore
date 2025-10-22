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
import { useExportPDF } from "@/hooks/useExportPDF";

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
type DiasDemandaData = { dia: string; cantidad: number };
type HorarioDemandaData = { hora: string; cantidad: number };

    export default function DashboardPacientes() {
    // 🔹 Filtros
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const [obraSocial, setObraSocial] = useState<string | null>(null);

    const [dataPacientesObra, setDataPacientesObra] = useState<ObraPacData[]>([]);
    const [dataDiasDemanda, setDataDiasDemanda] = useState<DiasDemandaData[]>([]);
    const [dataHorariosDemanda, setDataHorariosDemanda] = useState<HorarioDemandaData[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [dataConcurrenciaMes, setDataConcurrenciaMes] = useState<{ mes: string; cantidad: number }[]>([]);
    const [monthsRange, setMonthsRange] = useState<number>(3);

    // Hook de exportación PDF
    const { exportToPDF, isExporting } = useExportPDF();

    const periodOptions = [
    { label: "Últimos 3 meses", value: 3 },
    { label: "Últimos 6 meses", value: 6 },
    { label: "Últimos 12 meses", value: 12 },
    ];

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

    // 🔹 Reporte: Días con mayor demanda
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

    // 🧩 Reporte: Horarios con mayor concurrencia
    const fetchHorariosMayorConcurrencia = useCallback(async () => {
        try {
        const params = new URLSearchParams();
        if (dateRange?.[0] && dateRange?.[1]) {
            params.set("startDate", dateRange[0].toISOString());
            params.set("endDate", dateRange[1].toISOString());
        }

        const res = await fetch(`/api/reportes/horarios-mayor-concurrencia?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Error al cargar horarios");
        const data = await res.json();
        setDataHorariosDemanda(Array.isArray(data) ? data : []);
        } catch (err) {
        console.error("Error al cargar horarios con mayor concurrencia:", err);
        setDataHorariosDemanda([]);
        }
    }, [dateRange]);

    const fetchConcurrenciaPorMes = useCallback(async () => {
    try {
        const res = await fetch(`/api/reportes/concurrencia-por-mes?months=${monthsRange}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Error al cargar concurrencia mensual");
        const data = await res.json();
        setDataConcurrenciaMes(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Error al cargar concurrencia mensual:", err);
        setDataConcurrenciaMes([]);
    }
    }, [monthsRange]);



    // 🔹 useEffect inicial
    useEffect(() => {
        fetchPacientesPorObra();
        fetchDiasMayorDemanda();
        fetchHorariosMayorConcurrencia();
        fetchConcurrenciaPorMes();
    }, [fetchPacientesPorObra, fetchDiasMayorDemanda, fetchHorariosMayorConcurrencia, fetchConcurrenciaPorMes]);

    // 🔹 Filtrar
    const handleFilter = () => {
        fetchPacientesPorObra();
        fetchDiasMayorDemanda();
        fetchHorariosMayorConcurrencia();
        fetchConcurrenciaPorMes();
    };

    // 🔹 Limpiar filtros
    const handleClearFilters = () => {
        setDateRange(null);
        setObraSocial(null);
    };

    // 🔹 Exportar a PDF
    const handleExportPDF = async () => {
        const rangoFechas = dateRange?.[0] && dateRange?.[1]
            ? `${dateRange[0].toLocaleDateString("es-AR")} - ${dateRange[1].toLocaleDateString("es-AR")}`
            : "Todo el período";
        const obraSocialSeleccionada = obraSocial || "Todas las obras sociales";

        await exportToPDF("dashboard-pacientes-content", {
            filename: "estadisticas-pacientes-fisiocore",
            orientation: "landscape",
            title: "Estadísticas de Pacientes - FisioCore",
            subtitle: `${obraSocialSeleccionada} | ${rangoFechas}`,
            includeDate: true,
        });
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-800">
        {/* 🩺 Header */}
        <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard de Pacientes</h1>
                    <p className="text-gray-600">
                    Visualiza métricas relacionadas con los pacientes, obras sociales y actividad general.
                    </p>
                </div>
                <Button
                    icon={isExporting ? "pi pi-spin pi-spinner" : "pi pi-file-pdf"}
                    label={isExporting ? "Generando PDF..." : "Exportar PDF"}
                    severity="danger"
                    outlined
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="h-12"
                />
            </div>
        </div>

        {/* Filtros (NO se exportan al PDF) */}
        <div className="bg-white/95 rounded-2xl border border-gray-200 shadow-sm p-5 mb-8 flex flex-wrap gap-4 items-end backdrop-blur-sm">

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

            <Button icon="pi pi-search" label="Filtrar" className="h-[42px]" severity="info" onClick={handleFilter} />
            <Button icon="pi pi-filter-slash" label="Limpiar filtros" className="h-[42px]" severity="secondary" outlined onClick={handleClearFilters} />
        </div>

        {/* Contenedor exportable a PDF (sin filtros) */}
        <div id="dashboard-pacientes-content">
            {/* Gráficos */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Pacientes por obra social */}
                <Card
                    title="Cantidad de pacientes por obra social"
                    className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        {loadingChart ? (
                            <span className="text-sm text-gray-500">Cargando datos...</span>
                        ) : dataPacientesObra.length === 0 ? (
                            <span className="text-sm text-gray-500">No hay datos disponibles.</span>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={dataPacientesObra}
                                        dataKey="cantidad"
                                        nameKey="nombre"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
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

                {/* Días con mayor demanda */}
                <Card
                    title="Días con mayor demanda de turnos"
                    className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
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

                {/* Horarios con mayor concurrencia */}
                <Card
                    title="Horarios con mayor concurrencia"
                    subTitle={`Año ${new Date().getFullYear()}`}
                    className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        {dataHorariosDemanda.length === 0 ? (
                            <span className="text-sm text-gray-500">No hay datos disponibles.</span>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dataHorariosDemanda}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="hora" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        labelStyle={{ color: "#111827", fontWeight: 600 }}
                                        itemStyle={{ color: "#111827", fontWeight: 500 }}
                                        formatter={(v) => [`${v} turnos`, "Cantidad"]}
                                    />
                                    <Bar dataKey="cantidad" fill="#1F8F86" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Concurrencia de pacientes por mes */}
                <Card
                    title="Concurrencia de pacientes"
                    subTitle={`Últimos ${monthsRange} meses - Año ${new Date().getFullYear()}`}
                    className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                    <div className="flex justify-end mb-4">
                        <Dropdown
                            value={monthsRange}
                            options={periodOptions}
                            onChange={(e) => setMonthsRange(e.value)}
                            placeholder="Seleccionar rango"
                            className="w-52"
                        />
                    </div>

                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        {dataConcurrenciaMes.length === 0 ? (
                            <span className="text-sm text-gray-500">No hay datos disponibles.</span>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dataConcurrenciaMes}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="mes" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        labelStyle={{ color: "#111827", fontWeight: 600 }}
                                        itemStyle={{ color: "#111827", fontWeight: 500 }}
                                        formatter={(v) => [`${v} turnos`, "Cantidad"]}
                                    />
                                    <Bar dataKey="cantidad" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>
        </div>
        {/* Fin contenedor exportable a PDF */}
        </div>
    );
}
