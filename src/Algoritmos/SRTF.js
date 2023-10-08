// Função para calcular SRTF (Shortest Remaining Time First)
function calcularSRTF(processos) {

    console.log(processos);

    let tempoAtual = 0;
    const resultado = [];
    let tempoTotalExecucao = 0;
    let tempoTotalEspera = 0;
    let processoAnterior = null;
    let trocasDeContexto = 0;
    let label = "Shortest Remaining Time First";
  
    while (processos.length > 0) {
      // Filtrar os processos que já chegaram
      const processosChegados = processos.filter((p) => p.tempoDeChegada <= tempoAtual);
  
      if (processosChegados.length === 0) {
        tempoAtual++;
        continue;
      }
  
      // Encontrar o processo com o menor tempo restante
      let menorTempoRestante = Infinity;
      let indiceProcessoAtual = -1;
  
      for (let i = 0; i < processosChegados.length; i++) {
        if (processosChegados[i].duracao < menorTempoRestante) {
          menorTempoRestante = processosChegados[i].duracao;
          indiceProcessoAtual = i;
        }
      }
  
      const processoAtual = processosChegados[indiceProcessoAtual];
  
      // Calcular os tempos e atualizar a lista de processos
      const startTime = tempoAtual;
      const endTime = startTime + 1;
      processoAtual.duracao--;

  
      // Verificar se já existe uma entrada para este processo na lista de resultados
      const processoExistente = resultado.find((p) => p.label === processoAtual.label);
  
      if (processoExistente) {
        processoExistente.times.push({ startTime, duration: 1 });
        processoExistente.waitTimes.push({ startTime: processoAtual.tempoDeChegada, duration: startTime - processoAtual.tempoDeChegada });
      } else {
        resultado.push({
          label: processoAtual.label,
          times: [{ startTime, duration: 1 }],
          waitTimes: [{ startTime: processoAtual.tempoDeChegada, duration: startTime - processoAtual.tempoDeChegada }],
        });
      }
      
      if(startTime - processoAtual.tempoDeChegada ){
        tempoTotalEspera++;
      }

      // Adicionar o tempo de espera entre as pausas (se houver)
      if (processoExistente && processoExistente.times.length > 1) {
        const lastTime = processoExistente.times[processoExistente.times.length - 2];
        const waitDuration = startTime - (lastTime.startTime + lastTime.duration);
        processoExistente.waitTimes.push({ startTime: lastTime.startTime + lastTime.duration, duration: waitDuration });
      }
  
      tempoTotalExecucao++;
      tempoAtual = endTime;
  
      // Se o processo atual terminou, remova-o da lista de processos
      if (processoAtual.duracao === 0) {
        processos.splice(processos.indexOf(processoAtual), 1);
        
      }
  
      // Verificar a troca de contexto
      if (processoAnterior && processoAnterior.label !== processoAtual.label) {
        processoAnterior = processoAtual;
        trocasDeContexto++;
      } else if (!processoAnterior) {
        processoAnterior = processoAtual;
      }
      
      processoAtual.tempoDeChegada++;
    }
  
    // Calcular o tempo médio de execução e o tempo médio de espera
    const tempoMedioExecucao = (tempoTotalExecucao + tempoTotalEspera)/ resultado.length;
  
    const tempoMedioEspera = tempoTotalEspera / resultado.length;
  
    // Ordenar o resultado por label
    resultado.sort((a, b) => a.label.localeCompare(b.label));
  
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
    console.log("Processo", processos);
    return resultadoComMetricas;
  }
  
export default calcularSRTF;
  