import React from 'react';
// Importación obligatoria de Bootstrap para la Semana 13
import 'bootstrap/dist/css/bootstrap.min.css'; 
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Registrar los elementos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  // Datos simulados para el gráfico circular (Uso del idioma)
  const languageData = {
    labels: ['Quechua (Voz y Texto)', 'Español'],
    datasets: [
      {
        data: [78, 22],
        backgroundColor: ['#C97B63', '#6B8F71'], // Colores andinos de tu paleta
        hoverBackgroundColor: ['#b36a53', '#5a7a5f'],
        borderWidth: 1,
      },
    ],
  };

  // Datos simulados para el gráfico de barras (Asistencia mensual)
  const attendanceData = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    datasets: [
      {
        label: 'Asistencias',
        data: [45, 48, 42, 50],
        backgroundColor: '#A7C7E7',
      },
      {
        label: 'Faltas',
        data: [5, 2, 8, 0],
        backgroundColor: '#8B5E3C',
      },
    ],
  };

  return (
    <div className="container mt-5 pb-5 pt-3">
      {/* Cabecera usando Flexbox de Bootstrap */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 style={{ color: '#8B5E3C', fontWeight: 'bold' }}>Panel de Control Escolar</h2>
          <p className="text-muted">Monitoreo de accesibilidad y asistencia (ODS 10)</p>
        </div>
        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onBack}>
          Volver al Inicio
        </button>
      </div>

      {/* Sistema de grillas de Bootstrap para Responsive Design */}
      <div className="row">
        {/* Gráfico 1: Impacto de Accesibilidad */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 border-0 rounded-4">
            <div className="card-body">
              <h5 className="card-title text-center mb-4" style={{ color: '#8B5E3C' }}>
                Uso de Idioma en la Plataforma
              </h5>
              <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                <Pie 
                  data={languageData} 
                  options={{ maintainAspectRatio: false }} 
                />
              </div>
              <p className="text-center mt-3 small text-muted">
                Métrica que demuestra la reducción de la barrera idiomática.
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Asistencia */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 border-0 rounded-4">
            <div className="card-body">
              <h5 className="card-title text-center mb-4" style={{ color: '#8B5E3C' }}>
                Registro de Asistencia General
              </h5>
              <div style={{ height: '300px' }}>
                <Bar
                  data={attendanceData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
