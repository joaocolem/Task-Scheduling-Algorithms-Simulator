/*
[x] Fazer com que cada processo tenha no maximo a duracao do quantum
[x] Se a duracao do procecsso for maior do que o quantum, jogar o restante da duracao para o final da fila.
    [x] Alterar startime de processos que irao para o final da fila
[x] Ajustar tempoAtual e o resultado
[] Ajustar formato do resultado
[] Ajustar waitTimes
*/

import { all } from "q";

function calculateRR(processos, quantum) {
    const resultado = [];
    
    const newProcessos = normalize(processos, quantum);
    const metricas = calcularMetricas(newProcessos);
    
    return metricas;
}

function normalize(processos, quantum) {
    let newProcessos = [...processos];

    newProcessos = ajustarDuracaoQuantum(newProcessos, quantum);
    newProcessos = ajustarTempoDeChegadaQuantum(newProcessos, quantum);
    newProcessos = ajustarFormatoSaida(newProcessos, quantum);

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

function ajustarFormatoSaida(processos, quantum) {
    const sortedProcessos = processos.sort((a, b) => a.label - b.label);
    const allLabels = [];

    sortedProcessos.forEach(function(processo) {
        allLabels.push(processo.label);
    });

    const uniqueLabels = new Set(allLabels);

    const result = [];

    uniqueLabels.forEach(function(label) {
        const processo = {
            label,
            times: [],
            waitTimes: [],
        }

        const newTimes = sortedProcessos
            .filter((processo) => processo.label === label)
            .reduce((acc, {tempoDeChegada, duracao}) => {
               acc.push({startTime: tempoDeChegada, duration: duracao});
               return acc;
            }, []);
       
        processo.times = [...newTimes];
        
        const newWaitTimes = sortedProcessos
            .filter((processo) => processo.label === label)
            .reduce((acc, {tempoDeChegada, duracao}) => {
                let startWait = Math.trunc(tempoDeChegada / quantum) === 1 ? tempoDeChegada : Math.ceil(tempoDeChegada / quantum);

                acc.push({
                    startTime: startWait,
                    duration: quantum,
                });
                return acc;
            }, []);
        
        processo.waitTimes = [...newWaitTimes];

        result.push(processo);
    });

    return result;
}

function calcularMetricas(processos) {
    let label = "Round Robin";
    const qntProcessos = processos.length;
    const metricas = {
        resultado: processos,
        metricas: {
            label,
            tempoMedioExecucao: 0,
            tempoMedioEspera: 0,
            trocasDeContexto: 0
        }
    };

    processos.forEach(function(processo) {
        const tempoProcesso = processo.times.reduce((acc, value) => {
            acc.tempoMedioExecucao += value.duration / qntProcessos;
            acc.tempoMedioEspera += Math.abs(value.startTime - value.duration)/ qntProcessos;
            acc.trocasDeContexto++;

            return acc;
        },
        {tempoMedioExecucao: 0, tempoMedioEspera: 0, trocasDeContexto: 0});

        metricas.metricas.tempoMedioExecucao += Math.ceil(tempoProcesso.tempoMedioExecucao);
        metricas.metricas.tempoMedioEspera += Math.ceil(tempoProcesso.tempoMedioEspera);
        metricas.metricas.trocasDeContexto += tempoProcesso.trocasDeContexto;
    });

    return metricas;
}

export default calculateRR;