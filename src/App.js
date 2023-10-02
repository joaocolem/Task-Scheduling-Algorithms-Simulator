import React,  { useState } from 'react';
import BarChart from './components/BarChart';
import './App.css';

// Importe a função calcularSJF do arquivo sjf.js
import  calcularSJF  from './Algoritmos/SJF';
import  calcularSRTF from './Algoritmos/SRTF';

import TabelaResultados from './components/Tabela/TabelaResultados';
import SchedulerSelector from './components/Seletor/SchedulerSelector';


// Função para dividir todos os intervalos de um array de objetos
function splitIntervals(items) {
  const result = [];
  items.forEach((item) => {
    const newItem = { ...item };
    newItem.times = [];
    newItem.waitTimes = [];

    item.times.forEach((time) => {
      for (let i = 0; i < time.duration; i++) {
        newItem.times.push({
          startTime: time.startTime + i,
          duration: 1,
        });
      }
    });

    item.waitTimes.forEach((waitTime) => {
      for (let i = 0; i < waitTime.duration; i++) {
        newItem.waitTimes.push({
          startTime: waitTime.startTime + i,
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

  const handleSave = (info) => {
    setSelectedInfo(info);
  };



  // Lista de processos (substitua com seus próprios valores)

  

  const processos = [
    { label: 'P1', tempoDeChegada: 3, duracao: 2, prioridade: 3 },
    { label: 'P2', tempoDeChegada: 0, duracao: 4, prioridade: 2 },
    { label: 'P3', tempoDeChegada: 10, duracao: 1, prioridade: 1 },
    { label: 'P4', tempoDeChegada: 2, duracao: 6, prioridade: 4 },
    { label: 'P5', tempoDeChegada: 8, duracao: 1, prioridade: 5 },
  ];

  // Calcular SJF usando a função importada de sjf.js
  
  const resultadoSJF = calcularSJF(processos.slice());
  const resultadoSRTF = calcularSRTF(processos.slice());



  // Formatar a saída para o formato "items"
  const newItemsSJF = splitIntervals(resultadoSJF.resultado);
  const newItemsSRTF = splitIntervals(resultadoSRTF.resultado);


  const resultadosArray = [resultadoSJF, resultadoSRTF];
  const resultadosNewItems = [newItemsSJF, newItemsSRTF];



  return (
    <div className="App">

<div>
      <h1>Configurações de Escalonamento</h1>
      <SchedulerSelector onSave={handleSave} />

    </div>
    {selectedInfo && (    
    <div>
      <h1>Escalonador de processos</h1>

      <BarChart items={resultadosNewItems[selectedInfo.algorithmIndex]} />
      
      <TabelaResultados resultadosArray={resultadosArray} />
      </div>
    )}
    </div>
  );
}

export default App;
