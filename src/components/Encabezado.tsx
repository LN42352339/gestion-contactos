import logo from "../assets/img/logo.png"; // Ajusta la ruta según la ubicación del archivo

// src/components/Encabezado.tsx
export function Encabezado() {
  return (
    <header className="w-full bg-blue-700 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Logo" className="rounded-full w-10 h-10" />
        <h1 className="text-5xl">Directorio Telefónico</h1>
      </div>
      <nav>
        <span className="text-lg font-semibold">SISTEMA DE CONTACTOS</span>
      </nav>
    </header>
  );
}
