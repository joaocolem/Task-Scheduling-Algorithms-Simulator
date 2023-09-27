import React from 'react';
import BarChart from './components/BarChart';
import './App.css';

// Função para dividir um intervalo em intervalos de 1 segundo
function splitInterval(interval) {
  const result = [];
  for (let i = interval.startTime; i < interval.startTime + interval.duration; i++) {
    result.push({ startTime: i, duration: 1 });
  }
  return result;
}

function App() {
  const items = [
    {
      label: 'P1',
      times: [
        { startTime: 0, duration: 2 },
        { startTime: 4, duration: 3 },
      ],
      waitTimes: [{ startTime: 2, duration: 2 }],
    },
    {
      label: 'P2',
      times: [{ startTime: 2, duration: 2 }],
      waitTimes: [{ startTime: 0, duration: 2 }],
    },
    {
      label: 'P3',
      times: [{ startTime: 7, duration: 2 },{startTime: 4, duration: 1}],
      waitTimes: [{ startTime: 3, duration: 4 }],
    },
    {
      label: 'P4',
      times: [{ startTime: 9, duration: 1 }],
      waitTimes: [{ startTime: 3, duration: 6 }],
    },
    {
      label: 'P5',
      times: [{ startTime: 10, duration: 2 }],
      waitTimes: [{ startTime: 3, duration: 7 }],
    },
  ];

  // Função para dividir todos os intervalos de um array de objetos
  function splitIntervals(items) {
    const result = [];
    items.forEach((item) => {
      const newItem = { ...item };
      newItem.times = newItem.times.flatMap(splitInterval);
      newItem.waitTimes = newItem.waitTimes.flatMap(splitInterval);
      result.push(newItem);
    });
    return result;
  }

  // Aplicar a função para dividir os intervalos
  const newItems = splitIntervals(items);

  return (
    <div className="App">
      <h1>Escalonador de processos</h1>
      <BarChart items={newItems} />
    </div>
  );
}

export default App;
