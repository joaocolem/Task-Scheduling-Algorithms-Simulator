
function calcularSJF(processos) {

    console.log(processos);

    processos.sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);
  
    let tempoAtual = 0;
    const resultado = [];
    let tempoTotalExecucao = 0;
    let tempoTotalEspera = 0;
    let trocasDeContexto = -1;
    let label = "Shortest Job First"
  
    while (processos.length > 0) {

      const processosChegados = processos.filter((p) => p.tempoDeChegada <= tempoAtual);
  
      if (processosChegados.length === 0) {
        tempoAtual++;
      } else {
   
        const menorDuracao = Math.min(...processosChegados.map((p) => p.duracao));
        const proximoProcesso = processosChegados.find((p) => p.duracao === menorDuracao);
  

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
  
    resultado.sort((a, b) => a.label.localeCompare(b.label));
  

    const tempoMedioExecucao = (tempoTotalExecucao + tempoTotalEspera) / resultado.length;
    const tempoMedioEspera = tempoTotalEspera / resultado.length;
  

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
  
  export default calcularSJF;
  
