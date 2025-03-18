// src/components/Navbar.tsx
import { useState } from "react";

export default function Navbar() {
  // Controla el menú en pantallas pequeñas
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra superior */}
        <div className="flex items-center justify-between h-16">
          {/* Sección izquierda: Logo + Nombre */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <img
              className="h-8 w-8"
              src="https://via.placeholder.com/40"
              alt="Logo"
            />
            <span className="text-xl font-bold">Mi Empresa</span>
          </div>

          {/* Sección de enlaces (ocultos en móviles) */}
          <div className="hidden md:flex space-x-4">
            <a href="#" className="hover:bg-blue-600 px-3 py-2 rounded-md">
              Inicio
            </a>
            <a href="#" className="hover:bg-blue-600 px-3 py-2 rounded-md">
              Cursos
            </a>
            <a href="#" className="hover:bg-blue-600 px-3 py-2 rounded-md">
              Blog
            </a>
            <a href="#" className="hover:bg-blue-600 px-3 py-2 rounded-md">
              Contacto
            </a>
          </div>

          {/* Botón de acción (oculto en móviles) */}
          <div className="hidden md:flex">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
              Empieza Ahora
            </button>
          </div>

          {/* Botón hamburguesa para móviles */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable en móviles */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            >
              Inicio
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            >
              Cursos
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            >
              Blog
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            >
              Contacto
            </a>
            <button className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
              Empieza Ahora
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
