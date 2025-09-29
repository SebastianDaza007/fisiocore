"use client";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useState } from "react";

export default function PageEjemplo() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [selectedOption, setSelectedOption] = useState("A");

  const cities = [
    { name: "Buenos Aires", code: "BA" },
    { name: "Salta", code: "SA" },
    { name: "Córdoba", code: "CO" },
  ];

  const data = [
    { id: 1, nombre: "Andrea", estado: "Activo" },
    { id: 2, nombre: "Carlos", estado: "Inactivo" },
    { id: 3, nombre: "Lucía", estado: "Activo" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">Página de ejemplo</h2>
      <p className="text-gray-700">
        Aquí probamos <strong>PrimeReact</strong> con el layout activo 🚀
      </p>

      {/* --- BOTONES --- */}
      <div className="flex gap-3 flex-wrap">
        <Button label="Primario" icon="pi pi-check" />
        <Button label="Secundario" className="p-button-secondary" />
        <Button label="Éxito" className="p-button-success" />
        <Button label="Peligro" className="p-button-danger" />
        <Button icon="pi pi-search" className="p-button-rounded p-button-info" />
      </div>

      {/* --- FORMULARIO --- */}
      <Card title="Formulario de prueba" className="shadow-md">
        <div className="flex flex-col gap-4">
          <span className="p-float-label">
            <InputText id="nombre" className="w-full" />
            <label htmlFor="nombre">Nombre</label>
          </span>

          <Dropdown
            value={selectedCity}
            options={cities}
            onChange={(e) => setSelectedCity(e.value)}
            optionLabel="name"
            placeholder="Selecciona una ciudad"
            className="w-full"
          />

          <div className="flex items-center gap-2">
            <Checkbox
              inputId="check1"
              checked={checked}
              onChange={(e) => setChecked(e.checked ?? false)}
            />
            <label htmlFor="check1">Aceptar términos</label>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioButton
                inputId="rb1"
                name="option"
                value="A"
                onChange={(e) => setSelectedOption(e.value)}
                checked={selectedOption === "A"}
              />
              <label htmlFor="rb1">Opción A</label>
            </div>
            <div className="flex items-center gap-2">
              <RadioButton
                inputId="rb2"
                name="option"
                value="B"
                onChange={(e) => setSelectedOption(e.value)}
                checked={selectedOption === "B"}
              />
              <label htmlFor="rb2">Opción B</label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button label="Guardar" icon="pi pi-save" className="p-button-success" />
            <Button label="Cancelar" icon="pi pi-times" className="p-button-secondary" />
          </div>
        </div>
      </Card>

      {/* --- TABLA --- */}
      <Card title="Tabla de prueba" className="shadow-md">
        <DataTable value={data} paginator rows={5} tableStyle={{ minWidth: "30rem" }}>
          <Column field="id" header="ID"></Column>
          <Column field="nombre" header="Nombre"></Column>
          <Column field="estado" header="Estado"></Column>
        </DataTable>
      </Card>
    </div>
  );
}
