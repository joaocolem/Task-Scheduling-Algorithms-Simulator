/*
[x] Fazer com que cada processo tenha no maximo a duracao do quantum
[x] Se a duracao do procecsso for maior do que o quantum, jogar o restante da duracao para o final da fila.
    [x] Alterar startime de processos que irao para o final da fila
[x] Ajustar tempoAtual e o resultado
[] Ajustar waitTimes
*/

function calculateRR(processos, quantum) {
    const sortedProcessos = ajustarDuracaoQuantum(processos, quantum).sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);

    const resultado = [];

    let tempoAtual = 0;
    let tempoTotalExecucao = 0;
    let tempoTotalEspera = 0;
    let trocasDeContexto = -1;
    let label = "Round Robin";
    
    while(sortedProcessos.length > 0) {
        if (sortedProcessos.length === 0) {
            tempoAtual++;
        }
        const proximoProcesso = sortedProcessos.shift();
        const startTime = proximoProcesso.tempoDeChegada;
        const endTime = startTime + proximoProcesso.duracao;
        const waitTime = Math.abs(proximoProcesso.duracao - proximoProcesso.tempoDeChegada);

        resultado.push({
            label: proximoProcesso.label,
            times: [{ startTime, duration: proximoProcesso.duracao }],
            waitTimes: [{ startTime: proximoProcesso.tempoDeChegada, duration: waitTime }],
        });

        tempoTotalExecucao += endTime - startTime;
        tempoTotalEspera += waitTime;
        tempoAtual += quantum;
        trocasDeContexto++;
    }

    // // Ordenar o resultado por label
    resultado.sort((a, b) => a.label.localeCompare(b.label));

    // Calcular o tempo médio de execução e o tempo médio de espera
    const tempoMedioExecucao = tempoTotalExecucao / resultado.length;
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

function ajustarDuracaoQuantum(processos, quantum) {
    const newProcessos = [];

    [ ...processos].forEach(function(processo) {
        let remainingDuration = processo.duracao;

        while (remainingDuration > 0) {
            if (remainingDuration <= quantum) {
                processo.duracao = remainingDuration;
                newProcessos.push({ ...processo });
                remainingDuration = 0;
            } else {
                processo.duracao = quantum;
                newProcessos.push({ ...processo });
                remainingDuration -= quantum;
            }
        }
    });

    return newProcessos;
}

function ajustarTempoDeChegadaQuantum(processos, quantum) {
    const newProcessos = [];
    const sortedProcess = processos.sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);

    
    
    return newProcessos;
}

export default calculateRR;