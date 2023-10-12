/*
[x] Fazer com que cada processo tenha no maximo a duracao do quantum
[x] Se a duracao do procecsso for maior do que o quantum, jogar o restante da duracao para o final da fila.
    [x] Alterar startime de processos que irao para o final da fila
[x] Ajustar tempoAtual e o resultado
[] Ajustar waitTimes
*/

function calculateRR(processos, quantum) {
    const resultado = [];

    let tempoAtual = 0;
    let tempoTotalExecucao = 0;
    let tempoTotalEspera = 0;
    let trocasDeContexto = -1;
    let label = "Round Robin";
    
    const newProcessos = normalize(processos, quantum);
    
    // while(newProcessos.length > 0) {
    //     if (newProcessos.length === 0) {
    //         tempoAtual++;
    //     }
    //     const proximoProcesso = newProcessos.shift();
    //     const startTime = proximoProcesso.tempoDeChegada;
    //     const endTime = startTime + proximoProcesso.duracao;

    //     //waitime 
    //     const waitTime = Math.abs(startTime - newProcessos.length);

    //     resultado.push({
    //         label: proximoProcesso.label,
    //         times: [{ startTime, duration: proximoProcesso.duracao }],
    //         waitTimes: [{ startTime: proximoProcesso.tempoDeChegada, duration: waitTime }],
    //     });

    //     tempoTotalExecucao += endTime - startTime;
    //     tempoTotalEspera += waitTime;
    //     tempoAtual += quantum;
    //     trocasDeContexto++;
    // }

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

function normalize(processos, quantum) {
    let newProcessos = [...processos];

    newProcessos = ajustarDuracaoQuantum(newProcessos, quantum);
    newProcessos = ajustarTempoDeChegadaQuantum(newProcessos, quantum);

    return newProcessos;
}

function ajustarDuracaoQuantum(processos, quantum) {
    const newProcessos = [];

    processos.forEach(function(processo) {
        let duracaoRestante = processo.duracao;

        while (duracaoRestante > 0) {
            if (duracaoRestante <= quantum) {
                processo.duracao = duracaoRestante;
                newProcessos.push({ ...processo });
                duracaoRestante = 0;
            } else {
                processo.duracao = quantum;
                newProcessos.push({ ...processo });
                duracaoRestante -= quantum;
            }
        }
    });

    newProcessos.sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);

    return newProcessos; 
}

function ajustarTempoDeChegadaQuantum(processos, quantum) {
    // filtrar pela label
    let duracaoProcAnterior = 0;
    
    const labels = [];
    processos.forEach(function(processo){
        if(!labels.includes(processo.label)) {
            labels.push(processo.label);
        }
    });

    //se houver mais de um objeto jogar objetos para o final da fila
        //o processo pode ser executado complementamente?
        // processo.tempoDeChegada + quantum < proximoProcesso.tempoDeChegada;
    const procMaisDeUmObjeto = [];
    const primeirosProcessos = [];
    labels.forEach(function(label){
        let procMesmaLabel = processos.filter((proc) => proc.label === label);
        if (procMesmaLabel.length > 1) {
            primeirosProcessos.push(procMesmaLabel.shift());//Remove primeiro elemento do array
            procMaisDeUmObjeto.push(procMesmaLabel);
        }
    });

    // console.log(procMaisDeUmObjeto);
    for(let i=0; i< procMaisDeUmObjeto.length; i++){
        let n = 2;

        while(procMaisDeUmObjeto[i][0]?.tempoDeChegada + quantum**n <= primeirosProcessos[i + 1]?.tempoDeChegada) {
            let processo = procMaisDeUmObjeto[i].shift();
            primeirosProcessos.push(processo);
            n++;
        }
    }

    primeirosProcessos.sort((a, b)=> a.tempoDeChegada - b.tempoDeChegada);

    //intercalar objetos a mais, um de cada
    const procFinalFila = [];
    const maxCont = [...procMaisDeUmObjeto].sort((a, b) => b.length - a.length)[0].length - 1;
    let cont = 0;

    while(cont <= maxCont) {
        for(let i = 0; i < procMaisDeUmObjeto.length; i++){
            let object = procMaisDeUmObjeto[i][cont];
            if(object !== undefined) procFinalFila.push(object); 
        }
        cont++;
    }

    //Junta os arrays
    processos = primeirosProcessos.concat(procFinalFila);

    //Seta tempo de chegada com base na duracao do ultimo processo
    processos.forEach(function(processo) {
        if (processo.tempoDeChegada < duracaoProcAnterior) {
            processo.tempoDeChegada = duracaoProcAnterior;
        }
        duracaoProcAnterior = quantum + processo.tempoDeChegada;
    });

    return processos;
}

export default calculateRR;