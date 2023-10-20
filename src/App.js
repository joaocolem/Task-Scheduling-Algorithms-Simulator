import React,  { useState, useEffect } from 'react';
import BarChart from './components/BarChart';
import './App.css';

// Importe a função calcularSJF do arquivo sjf.js
import  calcularSJF  from './Algoritmos/SJF';
import  calcularSRTF from './Algoritmos/SRTF';
import calcularRR from './Algoritmos/RR';
import calcularPRIOc from './Algoritmos/PRIOc';

import TabelaResultados from './components/Tabela/TabelaResultados';
import SchedulerSelector from './components/Seletor/SchedulerSelector';
import ProcessTable from './components/Process/ProcessTable';


// Função para dividir todos os intervalos de um array de objetos
function splitIntervals(items) {
  const result = [];
  items.forEach((item) => {
    const newItem = { ...item };
    newItem.times = [];
    newItem.waitTimes = [];

    item.times.forEach((time) => {
      for (let i = 0; i < time.duration; i++) {
        const newTime = Number.parseInt(time.startTime) + i;
        newItem.times.push({
          startTime: newTime,
          duration: 1,
        });
      }
    });

    item.waitTimes.forEach((waitTime) => {
      for (let i = 0; i < waitTime.duration; i++) {
        const newWaitTime = Number.parseInt(waitTime.startTime) + i;
        newItem.waitTimes.push({
          startTime: newWaitTime,
          duration: 1,
        });
      }
    });

    result.push(newItem);
  });
  return result;
}

function App() {
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [processos, setProcessos] = useState([]);
  const [resultadosArray, setResultadosArray] = useState([]);
  const [resultadosNewItems, setResultadosNewItems] = useState([]);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (selectedInfo) {
      
      const resultadoSJF = calcularSJF(processos.map(processo => ({ ...processo })));
      const resultadoSRTF = calcularSRTF(processos.map(processo => ({ ...processo })));
      const resultadoRR = calcularRR(processos.map(processo => ({...processo})), selectedInfo.quantum);
      const resultadoPRIOc = calcularPRIOc(processos.map(processo => ({ ...processo })));
      
      // Formatar a saída para o formato "items"
      const newItemsSJF = splitIntervals(resultadoSJF.resultado);
      const newItemsSRTF = splitIntervals(resultadoSRTF.resultado);
      const newItemsRR = splitIntervals(resultadoRR.resultado);
      const newItemsPRIOc = splitIntervals(resultadoPRIOc.resultado);

      setResultadosArray([resultadoRR, resultadoSJF, resultadoSRTF, resultadoPRIOc]);
      setResultadosNewItems([newItemsRR, newItemsSJF, newItemsSRTF, newItemsPRIOc]);
      setDisplay(true);
    }
  }, [selectedInfo]);

  const handleSave = (info) => {
    setSelectedInfo(info);
  };

  return (
    <div className="App">
      <div>
        <h1>Configurações de Escalonamento</h1>
        <SchedulerSelector onSave={handleSave} />
      </div>

      {display && (
        <div>
          <h1>Escalonador de processos</h1>

          <BarChart items={resultadosNewItems[selectedInfo.algorithmIndex]} />

          <TabelaResultados resultadosArray={resultadosArray} />
        </div>
      )}

      <div>
        <ProcessTable processes={processos} setProcesses={setProcessos} />
      </div>
    </div>
  );
}

export default App;