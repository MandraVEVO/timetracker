import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Charts = ({ records, formatTime }) => {
  const activities = [
    "Analizar",
    "Planificar",
    "Codificar",
    "Testear",
    "Evaluación del código",
    "Revisión del código",
    "Lanzamiento",
    "Diagramar",
    "Reunión",
  ];

  const activityData = activities.map(activity => {
    const activityRecords = records.filter(record => record.activity === activity);
    const totalActiveTime = activityRecords.reduce((sum, record) => sum + record.activeTime, 0);
    const totalInactiveTime = activityRecords.reduce((sum, record) => sum + record.inactiveTime, 0);
    return {
      activity,
      totalActiveTime,
      totalInactiveTime,
    };
  });

  const totalActiveTime = activityData.reduce((sum, data) => sum + data.totalActiveTime, 0);
  const totalInactiveTime = activityData.reduce((sum, data) => sum + data.totalInactiveTime, 0);

  const percentageData = activityData.map(data => ({
    activity: data.activity,
    percentageActive: (data.totalActiveTime / totalActiveTime) * 100,
    percentageInactive: (data.totalInactiveTime / totalInactiveTime) * 100,
  }));

  const barData = {
    labels: activities,
    datasets: [
      {
        label: 'Tiempo Útil (s)',
        data: activityData.map(data => data.totalActiveTime),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Tiempo Interrumpido (s)',
        data: activityData.map(data => data.totalInactiveTime),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const pieData = {
    labels: activities,
    datasets: [
      {
        label: 'Porcentaje de Tiempo Útil',
        data: percentageData.map(data => data.percentageActive),
        backgroundColor: activities.map((_, index) => `rgba(${index * 30}, ${index * 60}, ${index * 90}, 0.6)`),
      },
      {
        label: 'Porcentaje de Tiempo Interrumpido',
        data: percentageData.map(data => data.percentageInactive),
        backgroundColor: activities.map((_, index) => `rgba(${index * 90}, ${index * 60}, ${index * 30}, 0.6)`),
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tiempo Útil e Interrumpido por Actividad',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Porcentaje de Tiempo Útil e Interrumpido por Actividad',
      },
    },
  };

  return (
    <div>
      <Bar data={barData} options={barOptions} />
      <Pie data={pieData} options={pieOptions} />
      <div className="text-center mt-4">
        <h3>Total de Tiempo Activo: {formatTime(totalActiveTime)}</h3>
        <h3>Total de Tiempo Inactivo: {formatTime(totalInactiveTime)}</h3>
      </div>
    </div>
  );
};

export default Charts;