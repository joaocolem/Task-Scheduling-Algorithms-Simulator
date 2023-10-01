import React from 'react';
import BarChart from './components/RoundRobin';
import './App.css';
import RoundRobin from './components/RoundRobin';

//Round-Robin:

// subtrair quantum pela duracao do processo;
// pegar processos que tem duracao diferente de 0, ou seja ainda precisam ser executados;
// opcao de escolher duracao e quantos processos serao executados;
// incremento de processos dinamico, ou seja, adicionar 2 ou 1 processo a cada 1 segundo;




function App() {
  const items = [
    {
      label: 'P1',
      times: [
        { startTime: 0, duration: 4 },
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
      times: [
        { startTime: 7, duration: 2 },
      ],
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

  return (
    <div className="App">
      <h1>Escalonador de processos</h1>
      <RoundRobin items={items} quantum={2}  />
    </div>
  );
}

export default App;
