
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

      const processosChegados = processos.filter((p) => p.tempoDeChegada <= tempoAtual);
  
      if (processosChegados.length === 0) {
        tempoAtual++;
        continue;
      }
  

      let menorTempoRestante = Infinity;
      let indiceProcessoAtual = -1;
  
      for (let i = 0; i < processosChegados.length; i++) {
        if (processosChegados[i].duracao < menorTempoRestante) {
          menorTempoRestante = processosChegados[i].duracao;
          indiceProcessoAtual = i;
        }
      }
  
      const processoAtual = processosChegados[indiceProcessoAtual];
  

      const startTime = tempoAtual;
      const endTime = startTime + 1;
      processoAtual.duracao--;

  

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


      if (processoExistente && processoExistente.times.length > 1) {
        const lastTime = processoExistente.times[processoExistente.times.length - 2];
        const waitDuration = startTime - (lastTime.startTime + lastTime.duration);
        processoExistente.waitTimes.push({ startTime: lastTime.startTime + lastTime.duration, duration: waitDuration });
      }
  
      tempoTotalExecucao++;
      tempoAtual = endTime;
  

      if (processoAtual.duracao === 0) {
        processos.splice(processos.indexOf(processoAtual), 1);
        
      }
  

      if (processoAnterior && processoAnterior.label !== processoAtual.label) {
        processoAnterior = processoAtual;
        trocasDeContexto++;
      } else if (!processoAnterior) {
        processoAnterior = processoAtual;
      }
      
      processoAtual.tempoDeChegada++;
    }
  

    const tempoMedioExecucao = (tempoTotalExecucao + tempoTotalEspera)/ resultado.length;
  
    const tempoMedioEspera = tempoTotalEspera / resultado.length;
  

    resultado.sort((a, b) => a.label.localeCompare(b.label));
  

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
  
