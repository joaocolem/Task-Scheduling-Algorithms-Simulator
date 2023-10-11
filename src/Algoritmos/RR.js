/*
[x] Fazer com que cada processo tenha no maximo a duracao do quantum
[x] Se a duracao do procecsso for maior do que o quantum, jogar o restante da duracao para o final da fila.
    [x] Alterar startime de processos que irao para o final da fila
[x] Ajustar tempoAtual e o resultado
[] Ajustar waitTimes
*/

function calculateRR(processos, quantum) {
    const sortedProcessos = dividirDuracaoQuantum(processos, 2).sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);
    const resultado = [];

    let tempoAtual = 0;
    let tempoTotalExecucao = 0;
    let tempoTotalEspera = 0;
    let trocasDeContexto = -1;
    let label = "Round Robin";
    
    console.log(processos);
    // if (sortedProcessos.length === 0) {
    //   tempoAtual++;
    // } else {
    //     while(sortedProcessos.length > 0) {
    //         const proximoProcesso = sortedProcessos.shift();
    //         const startTime = tempoAtual;
    //         const endTime = startTime + proximoProcesso.duracao;
    //         const waitTime = startTime - proximoProcesso.tempoDeChegada;

    //         resultado.push({
    //             label: proximoProcesso.label,
    //             times: [{ startTime, duration: proximoProcesso.duracao }],
    //             waitTimes: [{ startTime: proximoProcesso.tempoDeChegada, duration: waitTime }],
    //         });

    //         tempoTotalExecucao += endTime - startTime;
    //         tempoTotalEspera += waitTime;
    //         tempoAtual += quantum;
    //         trocasDeContexto++;
    //     }

    //     // // Ordenar o resultado por label
    //     resultado.sort((a, b) => a.label.localeCompare(b.label));

    //     // Calcular o tempo médio de execução e o tempo médio de espera
    //     const tempoMedioExecucao = tempoTotalExecucao / resultado.length;
    //     const tempoMedioEspera = tempoTotalEspera / resultado.length;

    //     // Criar o objeto que contém o resultado e as métricas
    //     const resultadoComMetricas = {
    //         resultado,
    //         metricas: {
    //         label,
    //         tempoMedioExecucao,
    //         tempoMedioEspera,
    //         trocasDeContexto,
    //         },
    //     };

    //     console.log(resultadoComMetricas);
    //     return resultadoComMetricas;
    // }
}

function dividirDuracaoQuantum(processos, quantum) {
    const newProcessos = [];
    let tempoFinalFila = processos.length * quantum;
    let sortedProcess = processos.sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);
    let menorTempoChegada = sortedProcess[0].tempoDeChegada;

    sortedProcess.forEach(function(processo){
        const diff = processo.duracao - quantum;

        if(diff <= 0) {
            menorTempoChegada = menorTempoChegada > processo.tempoDeChegada + quantum ? processo.tempoDeChegada : menorTempoChegada;

            newProcessos.push({label: processo.label, tempoDeChegada: menorTempoChegada, duracao: quantum, prioridade : processo.prioridade});
            menorTempoChegada += quantum;
        } else{
            if(diff % quantum === 0) {
                menorTempoChegada = menorTempoChegada > processo.tempoDeChegada + quantum ? processo.tempoDeChegada : menorTempoChegada;
                newProcessos.push({label: processo.label, tempoDeChegada: menorTempoChegada, duracao: quantum, prioridade : processo.prioridade});
                menorTempoChegada += quantum;

                for(let i=0 ; i < (diff/quantum) - 1; i++){
                    newProcessos.push({label: processo.label, tempoDeChegada: tempoFinalFila, duracao: quantum, prioridade : processo.prioridade});
                    tempoFinalFila += quantum;
                };

            } else {
                menorTempoChegada = menorTempoChegada > processo.tempoDeChegada + quantum + 1 ? processo.tempoDeChegada : menorTempoChegada;
                newProcessos.push({label: processo.label, tempoDeChegada: menorTempoChegada, duracao: quantum, prioridade : processo.prioridade});
                menorTempoChegada += quantum;

                if (diff - 1 !== 0) {
                    for(let i=0 ; i<(diff - 1)/quantum; i++){
                        newProcessos.push({label: processo.label, tempoDeChegada: tempoFinalFila, duracao: quantum, prioridade : processo.prioridade});
                        tempoFinalFila += quantum;
                    }
                    newProcessos.push({label: processo.label, tempoDeChegada: tempoFinalFila, duracao: 1, prioridade : processo.prioridade});
                    tempoFinalFila += quantum;
                } else {
                    newProcessos.push({label: processo.label, tempoDeChegada: tempoFinalFila, duracao: 1, prioridade : processo.prioridade});
                    tempoFinalFila += quantum;
                }
            }
        }
    });

    return newProcessos;
};

export default calculateRR;