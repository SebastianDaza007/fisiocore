"use client";

export default function PageEjemplo() {
    return (
        <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Página de ejemplo</h2>
        <p className="text-gray-700">
            Si ves este contenido con el <strong>Sidebar</strong> a la izquierda y el 
            <strong> Navbar</strong> arriba, significa que el layout está funcionando 🚀.
        </p>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">
            Aquí podés agregar cualquier componente o formulario.
            </p>
        </div>
        </div>
    );
}
