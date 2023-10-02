import React, { useState } from 'react';

const ProcessTable = ({ processes, setProcesses }) => {
  const [newProcess, setNewProcess] = useState({ label: '', tempoDeChegada: 0, duracao: 0, prioridade: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProcess({ ...newProcess, [name]: value });
  };

  const handleSaveProcess = () => {

    
    const parsedNewProcess = {
      ...newProcess,
      tempoDeChegada: parseInt(newProcess.tempoDeChegada, 10), // Parse as an integer
      duracao: parseInt(newProcess.duracao, 10), // Parse as an integer
      prioridade: parseInt(newProcess.prioridade, 10), // Parse as an integer
    };
  
    setProcesses([...processes, parsedNewProcess]);
    setNewProcess({ label: '', tempoDeChegada: 0, duracao: 0, prioridade: 0 });
  };
  

  return (
    <div>
      <h2>Tabela de Processos</h2>
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Tempo de Chegada</th>
            <th>Duração</th>
            <th>Prioridade</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process, index) => (
            <tr key={index}>
              <td>{process.label}</td>
              <td>{process.tempoDeChegada}</td>
              <td>{process.duracao}</td>
              <td>{process.prioridade}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3>Novo Processo</h3>
        <div>
          <label>Label:</label>
          <input type="text" name="label" value={newProcess.label} onChange={handleInputChange} />
        </div>
        <div>
          <label>Tempo de Chegada:</label>
          <input type="number" name="tempoDeChegada" value={newProcess.tempoDeChegada} onChange={handleInputChange} />
        </div>
        <div>
          <label>Duração:</label>
          <input type="number" name="duracao" value={newProcess.duracao} onChange={handleInputChange} />
        </div>
        <div>
          <label>Prioridade:</label>
          <input type="number" name="prioridade" value={newProcess.prioridade} onChange={handleInputChange} />
        </div>
        <button onClick={handleSaveProcess}>Salvar Processo</button>
      </div>
    </div>
  );
};

export default ProcessTable;
