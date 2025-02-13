import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Charts = ({ records }) => {
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

  const data = {
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

  const options = {
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

  return <Bar data={data} options={options} />;
};

export default Charts;