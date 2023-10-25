import React, { useState } from 'react';

function SchedulerSelector(props) {
  const [selectedAlgorithmIndex, setSelectedAlgorithmIndex] = useState(-1);
  const [quantum, setQuantum] = useState('');

  const handleAlgorithmChange = (event) => {
    const selectedIndex = event.target.selectedIndex - 1; 
    setSelectedAlgorithmIndex(selectedIndex);
  };

  const handleQuantumChange = (event) => {
    setQuantum(event.target.value);
  };

  const handleSaveClick = () => {
   
    if (selectedAlgorithmIndex !== -1) {
     
      const selectedInfo = {
        algorithmIndex: selectedAlgorithmIndex,
        quantum: Number.parseInt(quantum),
      };

     
      props.onSave(selectedInfo);
    }
  };

  return (
    <div>
      <h3>Selecione o Algoritmo de Escalonamento:</h3>
      <select value={selectedAlgorithmIndex} onChange={handleAlgorithmChange}>
        <option value={-1}>Selecione um algoritmo</option>
        <option value={0}>Round-Robin - Preemptivo</option>
        <option value={1}>Shortest Job First (Menor Tarefa Primeiro) - Não Preemptivo</option>
        <option value={2}>Shortest Remaining Time First (Menor Tempo Restante Primeiro) - Preemptivo</option>
        <option value={3}>Escalonamento por Prioridade Cooperativo - Não Preemptivo</option>
      </select>
      <br />
      <br />
      <div>
        <label className='quantum-label'>Quantum:</label>
        <input type="number" value={quantum} onChange={handleQuantumChange} />
      </div>
      <br />
      <button onClick={handleSaveClick} disabled={selectedAlgorithmIndex === -1}>
        OK
      </button>
    </div>
  );
}

export default SchedulerSelector;
