import React from 'react';

const TabelaResultados = ({ resultadosArray }) => {
  return (
    <div>
      <h2>Tabela de Resultados</h2>
      <table>
        <thead>
          <tr>
            <th>Algoritmo</th>
            <th>Tempo Médio de Execução</th>
            <th>Tempo Médio de Espera</th>
            <th>Trocas de Contexto</th>
          </tr>
        </thead>
        <tbody>
          {resultadosArray.map((resultado, index) => (
            <tr key={index}>
              <td>{resultado.metricas.label}</td>
              <td>{resultado.metricas.tempoMedioExecucao}</td>
              <td>{resultado.metricas.tempoMedioEspera}</td>
              <td>{resultado.metricas.trocasDeContexto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaResultados;
