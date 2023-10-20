// prioc.js

// Função para calcular PRIOc (Escalonamento por prioridade cooperativo)
function calcularPRIOc(processos) {

    console.log(processos);
    // Ordenar os processos por tempo de chegada
    processos.sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);
  
    let tempoAtual = 0;
    const resultado = [];
    let tempoTotalExecucao = 0;
    let tempoTotalEspera = 0;
    let trocasDeContexto = -1;
    let label = "Por prioridade cooperativo";
  
    while (processos.length > 0) {
      // Filtrar os processos que já chegaram
      const processosChegados = processos.filter((p) => p.tempoDeChegada <= tempoAtual);
  
      if (processosChegados.length === 0) {
        tempoAtual++;
      } else {
        // Encontrar o processo com a maior prioridade entre os que já chegaram
        const maiorPrioridade = Math.max(...processosChegados.map((p) => p.prioridade));
        const proximoProcesso = processosChegados.find((p) => p.prioridade === maiorPrioridade);
  
        // Calcular os tempos e removê-lo da lista de processos
        const startTime = tempoAtual;
        const endTime = startTime + proximoProcesso.duracao;
        const waitTime = startTime - proximoProcesso.tempoDeChegada;
  
        resultado.push({
          label: proximoProcesso.label,
          times: [{ startTime, duration: proximoProcesso.duracao }],
          waitTimes: [{ startTime: proximoProcesso.tempoDeChegada, duration: waitTime }],
        });
  
        tempoTotalExecucao += endTime - startTime;
        tempoTotalEspera += waitTime;
        tempoAtual = endTime;
        processos.splice(processos.indexOf(proximoProcesso), 1);
        trocasDeContexto++;
      }
    }
  
    // Ordenar o resultado por label
    resultado.sort((a, b) => a.label.localeCompare(b.label));
  
    // Calcular o tempo médio de execução e o tempo médio de espera
    const tempoMedioExecucao = (tempoTotalExecucao + tempoTotalEspera) / resultado.length;
    const tempoMedioEspera = tempoTotalEspera / resultado.length;
  
    // Criar o objeto que contém o resultado e as métricas
    const resultadoComMetricas = {
      resultado,
      metricas: {
        label,
        tempoMedioExecucao,
        tempoMedioEspera,
        trocasDeContexto,
      },
    };
  
    return resultadoComMetricas;
}

export default calcularPRIOc;
