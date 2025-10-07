"use client";


import { addLocale, locale } from "primereact/api";
import React, { useEffect, useState, useCallback } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

type ProfesionalOption = {
    label: string;
    value: number | null;
};

type ReportData = {
    mes: string;
    cantidad: number;
};

// 🧩 Configuración del idioma español para el calendario PrimeReact
addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
    ],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    monthNames: [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
    ],
    monthNamesShort: [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
    ],
    today: "Hoy",
    clear: "Limpiar",
});
locale("es");

    export default function DashboardReportes() {
    const [selectedProfesional, setSelectedProfesional] = useState<number | null>(null);
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const [profesionales, setProfesionales] = useState<ProfesionalOption[]>([]);
    const [dataPacientesMes, setDataPacientesMes] = useState<ReportData[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [loadingProfesionales, setLoadingProfesionales] = useState(false);

    // 🔹 Cargar lista de profesionales (desde /api/reportes/meta)
    useEffect(() => {
        const fetchProfesionales = async () => {
        setLoadingProfesionales(true);
        try {
            const res = await fetch("/api/reportes/meta");
            if (!res.ok) throw new Error("Error al cargar profesionales");
            const data = await res.json();
            setProfesionales([{ label: "Todos los profesionales", value: null }, ...data.profesionales]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProfesionales(false);
        }
        };
        fetchProfesionales();
    }, []);

    // 🔹 Cargar reporte "Pacientes atendidos por mes"
    const fetchData = useCallback(async () => {
        setLoadingChart(true);
        try {
            const params = new URLSearchParams();

            if (typeof selectedProfesional === "number" && !isNaN(selectedProfesional)) {
                params.set("profesionalId", selectedProfesional.toString());
            }

            if (dateRange?.[0] && dateRange?.[1]) {
                params.set("startDate", dateRange[0].toISOString());
                params.set("endDate", dateRange[1].toISOString());
            }

            const res = await fetch(`/api/reportes/pacientes-mes?${params.toString()}`);
            const data = await res.json();
            setDataPacientesMes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando gráfico:", err);
        } finally {
            setLoadingChart(false);
        }
    }, [selectedProfesional, dateRange]);
    // 🧩 Paso 2: Cargar datos por defecto (todos los profesionales y meses)
    useEffect(() => {
        if (!loadingProfesionales) {
            fetchData(); // Llama al backend sin filtros
        }
    }, [loadingProfesionales, fetchData]);

    // 🔹 Llamar fetch al hacer clic en “Filtrar”
    const handleFilter = () => {
        fetchData();
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-800">
        {/* Header */}
        <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-5">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard de Reportes</h1>
            <p className="text-gray-600">
            Visualiza métricas clave de pacientes, turnos y profesionales.
            </p>
        </div>

        {/* 🔹 Filtros superiores */}
        <div className="bg-white/95 rounded-2xl border border-gray-200 shadow-sm p-5 mb-8 flex flex-wrap gap-4 items-end backdrop-blur-sm">
            <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesional</label>
            <Dropdown
                value={selectedProfesional}
                options={profesionales}
                onChange={(e) => setSelectedProfesional(e.value)}
                placeholder={loadingProfesionales ? "Cargando..." : "Seleccionar"}
                className="w-full"
                disabled={loadingProfesionales}
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

        {/* 🔹 Cards de resumen */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {[
            {
                label: "Pacientes atendidos",
                value: "120",
                icon: "pi pi-user-plus",
                color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
            },
            {
                label: "Turnos cancelados",
                value: "15",
                icon: "pi pi-ban",
                color: "bg-red-100 text-red-700 hover:bg-red-200",
            },
            {
                label: "Turnos en espera",
                value: "8",
                icon: "pi pi-clock",
                color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
            },
            {
                label: "Turnos no asistidos",
                value: "5",
                icon: "pi pi-times-circle",
                color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
            },
            ].map((item) => (
            <Card
                key={item.label}
                className={`p-5 rounded-2xl bg-white/90 border border-gray-200 shadow-sm 
                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-gray-300`}
            >
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
                </div>
                <div
                    className={`p-3 rounded-full ${item.color} shadow-inner transition-colors duration-300`}
                >
                    <i className={`${item.icon} text-xl`} />
                </div>
                </div>
            </Card>
            ))}
        </div>

        {/* 🔹 Contenedores para los reportes */}
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Reporte 1 */}
            <Card
            title="Pacientes atendidos por mes"
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm 
                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50"
            >
            <div className="h-[300px] flex items-center justify-center text-gray-400">
                {loadingChart ? (
                <span className="text-sm text-gray-500">Cargando datos...</span>
                ) : dataPacientesMes.length === 0 ? (
                <span className="text-sm text-gray-500">No hay datos disponibles.</span>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataPacientesMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="mes"
                        tickFormatter={(mes) => {
                        const [year, month] = mes.split("-");
                        const meses = [
                            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                        ];
                        return `${meses[Number(month) - 1]} ${year}`;
                        }}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                        labelFormatter={(mes) => `Mes: ${mes}`}
                        formatter={(value) => [`${value} pacientes`, "Atendidos"]}
                    />
                    <Bar dataKey="cantidad" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                )}
            </div>
            </Card>

            {/* Otros reportes... */}
            <Card
            title="Cantidad de pacientes por obra social"
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm 
            transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50"
            >
            <div className="h-[300px] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/60">
                🧾 Aquí irá el gráfico circular (PieChart)
            </div>
            </Card>
        </div>
        {/* 🧩 Estilos locales para mejorar el calendario */}
        <style jsx global>{`
            /* Texto general del calendario */
            .p-datepicker table td > span {
                color: #374151 !important;
                font-weight: 500;
            }

            /* Días seleccionados */
            .p-datepicker table td > span.p-highlight {
                background-color: #14b8a6 !important;
                color: #ffffff !important;
                border-radius: 50% !important;
                font-weight: 600;
            }

            /* Hover de días */
            .p-datepicker table td > span:hover {
                background-color: #d1f5f0 !important;
                border-radius: 50% !important;
            }

            /* 🔹 Corregir color de texto en dropdown al seleccionar */
            .p-dropdown-item.p-highlight {
                background-color: #0f766e !important; /* color teal más oscuro */
                color: #ffffff !important; /* texto blanco visible */
            }

            /* 🔹 Hover del item en el dropdown */
            .p-dropdown-item:not(.p-highlight):hover {
                background-color: #e0f2f1 !important; /* verde claro */
                color: #065f46 !important; /* texto verde oscuro */
            }

            /* 🔹 Fondo general del panel dropdown */
            .p-dropdown-panel {
                border-radius: 0.75rem !important;
                overflow: hidden !important;
            }
        `}</style>

        </div>
    );
}
