import React, { useState, useEffect } from 'react';
import { Velustro } from "uvcanvas";

const App = () => {
  const [mexicoTime, setMexicoTime] = useState(null);
  const [systemTime, setSystemTime] = useState(null);
  const [activeTime, setActiveTime] = useState(0);
  const [inactiveTime, setInactiveTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activity, setActivity] = useState("");
  const [showComboBox, setShowComboBox] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [comment, setComment] = useState("");
  const [records, setRecords] = useState([]);
  const [isTracking, setIsTracking] = useState(false);

  const activities = ["Analizar", "Planificar", "Codificar", "Testear", "Evaluación del código", "Revisión del código", "Lanzamiento", "Diagramar", "Reunión"];

  useEffect(() => {
    const fetchMexicoTime = async () => {
      try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/America/Mexico_City');
        const data = await response.json();
        setMexicoTime(new Date(data.datetime).toLocaleTimeString('en-US', { hour12: false }));
      } catch (error) {
        console.error('Error al obtener la hora:', error);
      }
    };

    fetchMexicoTime();
    const interval = setInterval(() => {
      fetchMexicoTime();
      setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (isTracking) {
      if (isActive) {
        timer = setInterval(() => setActiveTime(prev => prev + 1), 1000);
      } else {
        timer = setInterval(() => setInactiveTime(prev => prev + 1), 1000);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, isTracking]);

  const handleStart = () => {
    setShowComboBox(true);
  };

  const handleSelectActivity = (event) => {
    setActivity(event.target.value);
    setStartTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    setShowComboBox(false);
    setIsActive(true);
    setIsTracking(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsTracking(false);
    setEndTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    const userComment = prompt("¿Qué comentario deseas guardar?");
    setComment(userComment || "");
    const date = new Date().toLocaleDateString();
    setRecords([...records, { date, startTime, endTime, inactiveTime, activeTime, activity, comment: userComment || "" }]);
    setActiveTime(0);
    setInactiveTime(0);
    setActivity("");
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Velustro className="fixed top-0 left-0 w-full h-full z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-gray-800 bg-opacity-75 p-8 rounded-lg shadow-lg text-center mb-8">
          <h1 className="text-4xl font-bold text-green-500 mb-6">Timetracker</h1>
          <div className="space-y-4">
            <div className="text-2xl font-semibold">
              <span className="text-yellow-400">Hora de México:</span> {mexicoTime || 'Cargando...'}
            </div>
            <div className="text-2xl font-semibold">
              <span className="text-yellow-400">Hora del Sistema:</span> {systemTime || 'Cargando...'}
            </div>
            {showComboBox && (
              <select className="bg-gray-700 text-white p-2 rounded" onChange={handleSelectActivity}>
                <option value="">Seleccionar actividad</option>
                {activities.map((act, index) => (
                  <option key={index} value={act}>{act}</option>
                ))}
              </select>
            )}
            <div className="flex justify-between space-x-4 mt-4 flex-wrap">
              <button onClick={handleStart} className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Iniciar</button>
              <button onClick={handlePause} className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600">Pausar</button>
              <button onClick={handleStop} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">Detener</button>
            </div>
          </div>
        </div>

        <div className="w-64 bg-gray-700 bg-opacity-75 p-6 rounded-lg shadow-lg text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-500 mb-4">Timer</h2>
          <div className="text-xl font-semibold mb-4">
            <span className="text-yellow-400">Tiempo Activo:</span> {activeTime}s
          </div>
          <div className="text-xl font-semibold mb-4">
            <span className="text-yellow-400">Tiempo Inactivo:</span> {inactiveTime}s
          </div>
        </div>

        <div className="w-full max-w-3xl bg-gray-800 bg-opacity-75 p-4 rounded-lg shadow-lg overflow-x-auto">
          <h3 className="text-xl font-bold text-green-500 mb-4">Registros de Actividad</h3>
          <table className="min-w-full table-auto text-white">
            <thead>
              <tr>
                <th>Fecha</th><th>Inicio</th><th>Fin</th><th>Interrupción</th><th>A tiempo</th><th>Actividad</th><th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td><td>{record.startTime}</td><td>{record.endTime}</td><td>{record.inactiveTime}s</td><td>{record.activeTime}s</td><td>{record.activity}</td><td>{record.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;