import React from 'react';
import BarChart from './components/BarChart';
import './App.css';

// Importe a função calcularSJF do arquivo sjf.js
import calcularSJF from './Algoritmos/SJF';
import calcularSRTF from './Algoritmos/SRTF';

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
  // Lista de processos (substitua com seus próprios valores)
  const processos = [
    { label: 'P1', tempoDeChegada: 3, duracao: 2, prioridade: 3 },
    { label: 'P2', tempoDeChegada: 0, duracao: 4, prioridade: 2 },
    { label: 'P3', tempoDeChegada: 10, duracao: 1, prioridade: 1 },
    { label: 'P4', tempoDeChegada: 2, duracao: 6, prioridade: 4 },
    { label: 'P5', tempoDeChegada: 8, duracao: 1, prioridade: 5 },
  ];

  // Calcular SJF usando a função importada de sjf.js
  //const { resultado, metricas } = calcularSJF(processos);
  const { resultado, metricas } = calcularSRTF(processos);



  // Formatar a saída para o formato "items"
  const newItems = splitIntervals(resultado);
  console.log(metricas);


  return (
    <div className="App">
      <h1>Escalonador de processos</h1>
      <BarChart items={newItems} />
      
    </div>
  );
}

export default App;
