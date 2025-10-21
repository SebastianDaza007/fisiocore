"use client";

import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";

// ----------------------------- Tipos -----------------------------
type OcupacionData = {
    fecha_inicio: string;
    fecha_fin: string;
    turnos_posibles: number;
    turnos_ocupados: number;
    tasa_ocupacion: number;
};

type PacientesData = {
    fecha_inicio: string;
    fecha_fin: string;
    pacientes_atendidos: number;
};

type PacientesPorObraData = {
    obra_social: string;
    cantidad: number;
};

// ----------------------------- Componente -----------------------------
    export default function ReportesProfesionalPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const profesionalId = user?.profesionalId;

    // 🔹 Estados generales
    const [period, setPeriod] = useState<"week" | "month">("week");
    const [periodPacientes, setPeriodPacientes] = useState<
        "week" | "month" | "year"
    >("week");
    const [periodObra, setPeriodObra] = useState<"week" | "month" | "year">(
        "month"
    );

    const [ocupacion, setOcupacion] = useState<OcupacionData | null>(null);
    const [pacientes, setPacientes] = useState<PacientesData | null>(null);
    const [porObra, setPorObra] = useState<PacientesPorObraData[]>([]);

    const [loadingOcupacion, setLoadingOcupacion] = useState(false);
    const [loadingPacientes, setLoadingPacientes] = useState(false);
    const [loadingObra, setLoadingObra] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const periodOptions = [
        { label: "Semana actual", value: "week" },
        { label: "Mes actual", value: "month" },
    ];

    const periodPacientesOptions = [
        { label: "Semana actual", value: "week" },
        { label: "Mes actual", value: "month" },
        { label: "Año actual", value: "year" },
    ];

    const [pacientesPorObraTotal, setPacientesPorObraTotal] = useState<number | null>(null);

    // ------------------- Fetch #1 - Tasa de ocupación -------------------
    const fetchOcupacion = async () => {
        if (!profesionalId) return;
        try {
        setLoadingOcupacion(true);
        const res = await fetch(
            `/api/reportes/tasa-ocupacion-agenda?profesionalId=${profesionalId}&period=${period}`,
            { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Error al cargar tasa de ocupación");
        const data = await res.json();
        console.log("📊 Datos de ocupación:", data);
        setOcupacion(data);
        } catch (err) {
        console.error("Error al cargar tasa de ocupación:", err);
        setOcupacion(null);
        } finally {
        setLoadingOcupacion(false);
        }
    };

    // ------------------- Fetch #2 - Pacientes atendidos -------------------
    const fetchPacientes = async () => {
        if (!profesionalId) return;
        try {
        setLoadingPacientes(true);
        const res = await fetch(
            `/api/reportes/pacientes-atendidos?profesionalId=${profesionalId}&period=${periodPacientes}`,
            { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Error al cargar pacientes atendidos");
        const data = await res.json();
        console.log("📈 Datos de pacientes atendidos:", data);
        setPacientes(data);
        } catch (err) {
        console.error("Error al cargar pacientes atendidos:", err);
        setPacientes(null);
        } finally {
        setLoadingPacientes(false);
        }
    };

    // ------------------- Fetch #3 - Pacientes por obra social -------------------
    const fetchPacientesPorObra = async () => {
        if (!profesionalId) return;
        try {
        setLoadingObra(true);
        const res = await fetch(
            `/api/reportes/cantidad-pacientes-obra?profesionalId=${profesionalId}&period=${periodObra}`,
            { cache: "no-store" }
        );
        if (!res.ok)
            throw new Error("Error al cargar reporte de pacientes por obra social");
        const data = await res.json();
        console.log("🏥 Datos pacientes por obra social:", data);
        setPorObra(data.resultados || []);
        setPacientesPorObraTotal(data.total_pacientes || 0);
        } catch (err) {
        console.error("Error al cargar pacientes por obra social:", err);
        setPorObra([]);
        } finally {
        setLoadingObra(false);
        }
    };

    // ------------------- useEffect principal -------------------
    useEffect(() => {
        if (!authLoading && isAuthenticated && profesionalId) {
        fetchOcupacion();
        fetchPacientes();
        fetchPacientesPorObra();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        period,
        periodPacientes,
        periodObra,
        profesionalId,
        authLoading,
        isAuthenticated,
    ]);

    // ------------------- Refresh manual -------------------
    const handleRefresh = async () => {
        if (!profesionalId) return;
        setRefreshing(true);
        try {
        await Promise.all([
            fetchOcupacion(),
            fetchPacientes(),
            fetchPacientesPorObra(),
        ]);
        } finally {
        setTimeout(() => setRefreshing(false), 600);
        }
    };

    // ------------------- Datos para los gráficos -------------------
    const chartOcupacion = ocupacion
        ? [
            {
            name: period === "week" ? "Semana actual" : "Mes actual",
            ocupacion: ocupacion.tasa_ocupacion,
            },
        ]
        : [];

    const chartPacientes = pacientes
        ? [
            {
            name:
                periodPacientes === "week"
                ? "Semana actual"
                : periodPacientes === "month"
                ? "Mes actual"
                : "Año actual",
            pacientes: pacientes.pacientes_atendidos,
            },
        ]
        : [];

    const COLORS = ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#6366f1"];

    // ------------------- Render -------------------
    if (authLoading)
        return (
        <div className="flex items-center justify-center min-h-screen text-gray-500">
            Verificando sesión...
        </div>
        );

    if (!isAuthenticated || !user)
        return (
        <div className="flex items-center justify-center min-h-screen text-gray-500">
            No estás autenticado.
        </div>
        );

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-800">
        {/* Header */}
        <div className="mb-8 bg-white/90 rounded-2xl shadow-sm border border-gray-200 p-5">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reportes del Profesional
            </h1>
            <p className="text-gray-600">
            Visualiza tus métricas personales, {user.nombre}.
            </p>
        </div>

        {/* ---------- CARD 1: Tasa de Ocupación ---------- */}
        <Card
            title="Tasa de ocupación de mi agenda"
            subTitle={`Período: ${
            period === "week" ? "Semana actual" : "Mes actual"
            } - Año ${new Date().getFullYear()}`}
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm transition-all duration-300 hover:shadow-lg mb-10"
        >
            <div className="flex justify-between items-center mb-4 gap-3">
            <Dropdown
                value={period}
                options={periodOptions}
                onChange={(e) => setPeriod(e.value)}
                className="w-60"
            />
            <Button
                icon={refreshing ? "pi pi-spin pi-refresh" : "pi pi-refresh"}
                label={refreshing ? "Actualizando..." : "Refrescar"}
                onClick={handleRefresh}
                severity="info"
                outlined
            />
            </div>

            {loadingOcupacion ? (
            <p className="text-center text-gray-500">Cargando datos...</p>
            ) : !ocupacion ? (
            <p className="text-center text-gray-500">
                No hay datos disponibles.
            </p>
            ) : (
            <>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartOcupacion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                        formatter={(v) => [`${v}%`, "Ocupación"]}
                        labelStyle={{ color: "#111827", fontWeight: 600 }}
                    />
                    <Bar
                        dataKey="ocupacion"
                        fill="#14b8a6"
                        radius={[8, 8, 0, 0]}
                    />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                <div className="mt-6 text-center">
                <p className="text-lg text-gray-700">
                    Turnos ocupados:{" "}
                    <span className="font-semibold text-emerald-700">
                    {ocupacion.turnos_ocupados}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-gray-700">
                    {ocupacion.turnos_posibles}
                    </span>
                </p>
                <p className="text-xl font-bold text-emerald-600 mt-2">
                    Ocupación total: {ocupacion.tasa_ocupacion.toFixed(1)}%
                </p>
                </div>
            </>
            )}
        </Card>

        {/* ---------- CARD 2: Pacientes Atendidos ---------- */}
        <Card
            title="Pacientes atendidos"
            subTitle={`Período: ${
            periodPacientes === "week"
                ? "Semana actual"
                : periodPacientes === "month"
                ? "Mes actual"
                : "Año actual"
            } - Año ${new Date().getFullYear()}`}
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm transition-all duration-300 hover:shadow-lg mb-10"
        >
            <div className="flex justify-between items-center mb-4 gap-3">
            <Dropdown
                value={periodPacientes}
                options={periodPacientesOptions}
                onChange={(e) => setPeriodPacientes(e.value)}
                className="w-60"
            />
            <Button
                icon={refreshing ? "pi pi-spin pi-refresh" : "pi pi-refresh"}
                label={refreshing ? "Actualizando..." : "Refrescar"}
                onClick={handleRefresh}
                severity="info"
                outlined
            />
            </div>

            {loadingPacientes ? (
            <p className="text-center text-gray-500">Cargando datos...</p>
            ) : !pacientes ? (
            <p className="text-center text-gray-500">
                No hay datos disponibles.
            </p>
            ) : (
            <>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartPacientes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} />
                    <Tooltip
                        formatter={(v) => [`${v}`, "Pacientes"]}
                        labelStyle={{ color: "#111827", fontWeight: 600 }}
                    />
                    <Bar
                        dataKey="pacientes"
                        fill="#0ea5e9"
                        radius={[8, 8, 0, 0]}
                    />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                <div className="mt-6 text-center">
                <p className="text-xl font-semibold text-sky-700">
                    Total pacientes atendidos: {pacientes.pacientes_atendidos}
                </p>
                </div>
            </>
            )}
        </Card>

        {/* ---------- CARD 3: Pacientes por Obra Social ---------- */}
        <Card
            title="Pacientes por obra social"
            subTitle={`Período: ${
            periodObra === "week"
                ? "Semana actual"
                : periodObra === "month"
                ? "Mes actual"
                : "Año actual"
            } - Año ${new Date().getFullYear()}`}
            className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm transition-all duration-300 hover:shadow-lg"
        >
            <div className="flex justify-between items-center mb-4 gap-3">
            <Dropdown
                value={periodObra}
                options={periodPacientesOptions}
                onChange={(e) => setPeriodObra(e.value)}
                className="w-60"
            />
            <Button
                icon={refreshing ? "pi pi-spin pi-refresh" : "pi pi-refresh"}
                label={refreshing ? "Actualizando..." : "Refrescar"}
                onClick={handleRefresh}
                severity="info"
                outlined
            />
            </div>

            {loadingObra ? (
            <p className="text-center text-gray-500">Cargando datos...</p>
            ) : porObra.length === 0 ? (
            <p className="text-center text-gray-500">
                No hay datos disponibles.
            </p>
            ) : (
            <>
                <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={porObra}
                        dataKey="porcentaje"
                        nameKey="obra_social"
                        outerRadius={130}
                        label={(entry) => `${entry.obra_social}: ${entry.porcentaje}%`} 
                    >
                        {porObra.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                </div>

                <div className="mt-6 text-center">
                <p className="text-xl font-semibold text-indigo-700">
                    Total pacientes:{" "}
                    {new Intl.NumberFormat("es-AR").format(pacientesPorObraTotal || 0)}
                </p>
                </div>
            </>
            )}
        </Card>
        </div>
    );
}
