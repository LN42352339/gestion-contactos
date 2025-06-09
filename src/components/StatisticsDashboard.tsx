import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export interface StatisticsDashboardProps {
  datosGrafico: { area: string; cantidad: number }[];
  colores: string[];
  onCerrar: () => void;
  cantidadContactos: number;
  cantidadEliminados: number;
  areaConMasContactos: string;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  datosGrafico = [],
  colores = [],
  cantidadContactos = 0,
  cantidadEliminados = 0,
  areaConMasContactos = "Sin datos",
}) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-6xl">
        <h3 className="text-3xl font-bold mb-8 text-center text-slate-700">
          📊 Estadísticas de Contactos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-center">
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold text-gray-600">
              Contactos Activos
            </h4>
            <p className="text-4xl font-bold text-blue-600">
              {cantidadContactos}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold text-gray-600">
              Contactos Eliminados
            </h4>
            <p className="text-4xl font-bold text-red-500">
              {cantidadEliminados}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold text-gray-600">
              Área con más contactos
            </h4>
            <p className="text-2xl font-bold text-green-600">
              {areaConMasContactos}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico}>
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad">
                  {datosGrafico.map((_, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={colores[index % colores.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosGrafico}
                  dataKey="cantidad"
                  nameKey="area"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {datosGrafico.map((_, index) => (
                    <Cell
                      key={`pie-${index}`}
                      fill={colores[index % colores.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
