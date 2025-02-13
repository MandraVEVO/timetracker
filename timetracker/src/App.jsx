import React, { useState, useEffect } from "react";
import { Velustro } from "uvcanvas";
import { saveRecordsToFile } from "./save";
import { importRecordsFromFile } from "./import";
import Charts from "./charts";
import Modal from "react-modal";

Modal.setAppElement("#root");

const App = () => {
  const [mexicoTime, setMexicoTime] = useState(null);
  const [systemTime, setSystemTime] = useState(null);
  const [activeTime, setActiveTime] = useState(0);
  const [inactiveTime, setInactiveTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activity, setActivity] = useState("");
  const [showComboBox, setShowComboBox] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [comment, setComment] = useState("");
  const [records, setRecords] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecovered, setHasRecovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchMexicoTime = async () => {
      try {
        const response = await fetch(
          "http://worldtimeapi.org/api/timezone/America/Mexico_City"
        );
        const data = await response.json();
        setMexicoTime(
          new Date(data.datetime).toLocaleTimeString("en-US", { hour12: false })
        );
      } catch (error) {
        console.error("Error al obtener la hora:", error);
      }
    };

    fetchMexicoTime();
    const interval = setInterval(() => {
      fetchMexicoTime();
      setSystemTime(
        new Date().toLocaleTimeString("en-US", { hour12: false })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (isTracking) {
      if (isActive && !isPaused) {
        timer = setInterval(() => setActiveTime((prev) => prev + 1), 1000);
      } else {
        timer = setInterval(() => setInactiveTime((prev) => prev + 1), 1000);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, isTracking, isPaused]);

  useEffect(() => {
    const savedRecords = localStorage.getItem("records");
    if (savedRecords && !hasRecovered) {
      setRecords(JSON.parse(savedRecords));
      alert("Mensajes recuperados");
      setHasRecovered(true);
    }

    const handleBeforeUnload = () => {
      localStorage.setItem("records", JSON.stringify(records));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [records, hasRecovered]);

  const handleStart = () => {
    setShowComboBox(true);
  };

  const handleSelectActivity = (event) => {
    setActivity(event.target.value);
    setStartTime(
      new Date().toLocaleTimeString("en-US", { hour12: false })
    );
    setShowComboBox(false);
    setIsActive(true);
    setIsTracking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    setIsActive(isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsTracking(false);
    setIsPaused(false);

    const endTimeValue = new Date().toLocaleTimeString("en-US", {
      hour12: false,
    });

    let userComment = prompt("¿Qué comentario deseas guardar?");
    while (userComment && (/[^a-zA-Z\s]/.test(userComment) || userComment.length > 40)) {
      alert("El comentario solo puede contener letras y espacios, y debe tener un máximo de 40 caracteres.");
      userComment = prompt("¿Qué comentario deseas guardar?");
    }

    const date = new Date().toLocaleDateString();

    const newRecords = [
      ...records,
      {
        date,
        startTime,
        endTime: endTimeValue,
        inactiveTime,
        activeTime,
        activity,
        comment: userComment || "",
      },
    ];

    setRecords(newRecords);
    localStorage.setItem("records", JSON.stringify(newRecords));

    // Reiniciar estados
    setActiveTime(0);
    setInactiveTime(0);
    setActivity("");
    setStartTime(null);
  };

  const handleSave = () => {
    if (records.length === 0) {
      alert("No hay registros capturados");
      return;
    }
    const fileName = prompt("¿Cómo deseas nombrar el archivo JSON?");
    if (fileName) {
      saveRecordsToFile(records, fileName);
    }
  };

  const handleImport = () => {
    importRecordsFromFile(setRecords);
  };

  const handleClear = () => {
    if (window.confirm("¿Estás seguro de que deseas borrar todos los registros?")) {
      setRecords([]);
      localStorage.removeItem("records");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Velustro className="fixed top-0 left-0 w-full h-full z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-gray-800 bg-opacity-75 p-8 rounded-lg shadow-lg text-center mb-8">
          <h1 className="text-4xl font-bold text-green-500 mb-6">Timetracker</h1>
          <div className="space-y-4">
            <div className="text-2xl font-semibold">
              <span className="text-yellow-400">Hora de México:</span>{" "}
              {mexicoTime || "Cargando..."}
            </div>
            <div className="text-2xl font-semibold">
              <span className="text-yellow-400">Hora del Sistema:</span>{" "}
              {systemTime || "Cargando..."}
            </div>
            {showComboBox && (
              <select
                className="bg-gray-700 text-white p-2 rounded"
                onChange={handleSelectActivity}
              >
                <option value="">Seleccionar actividad</option>
                {activities.map((act, index) => (
                  <option key={index} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            )}
            <div className="flex justify-between space-x-4 mt-4 flex-wrap">
              <button
                onClick={handleStart}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                disabled={isTracking}
              >
                Iniciar
              </button>
              <button
                onClick={handlePause}
                className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
                disabled={!isTracking}
              >
                {isPaused ? "Reanudar" : "Pausar"}
              </button>
              <button
                onClick={handleStop}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                disabled={!isTracking}
              >
                Detener
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Guardar
              </button>
              <button
                onClick={handleImport}
                className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
              >
                Importar
              </button>
              <button
                onClick={openModal}
                className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600"
              >
                Graficas
              </button>
              <button>Convertir a pdf</button>
              <button
                onClick={handleClear}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                Borrar Datos
              </button>
            </div>
          </div>
        </div>

        <div className="w-64 bg-gray-700 bg-opacity-75 p-6 rounded-lg shadow-lg text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-500 mb-4">Timer</h2>
          <div className="text-xl font-semibold mb-4">
            <span className="text-yellow-400">Tiempo Activo:</span> {activeTime}s
          </div>
          <div className="text-xl font-semibold mb-4">
            <span className="text-yellow-400">Tiempo Inactivo:</span>{" "}
            {inactiveTime}s
          </div>
        </div>

        <div className="w-full max-w-3xl bg-gray-800 bg-opacity-75 p-4 rounded-lg shadow-lg overflow-x-auto">
          <h3 className="text-xl font-bold text-green-500 mb-4">
            Registros de Actividad
          </h3>
          <table className="min-w-full table-auto text-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Inicio</th>
                <th className="px-4 py-2">Fin</th>
                <th className="px-4 py-2">Interrupción</th>
                <th className="px-4 py-2">A tiempo</th>
                <th className="px-4 py-2">Actividad</th>
                <th className="px-4 py-2">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{record.date}</td>
                  <td className="border px-4 py-2">{record.startTime}</td>
                  <td className="border px-4 py-2">{record.endTime}</td>
                  <td className="border px-4 py-2">{record.inactiveTime}s</td>
                  <td className="border px-4 py-2">{record.activeTime}s</td>
                  <td className="border px-4 py-2">{record.activity}</td>
                  <td className="border px-4 py-2 whitespace-pre-line">{record.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Graficas"
          className="modal"
          overlayClassName="overlay"
        >
          <button onClick={closeModal} className="close-button">Cerrar</button>
          <Charts records={records} />
        </Modal>
      </div>
    </div>
  );
};

export default App;