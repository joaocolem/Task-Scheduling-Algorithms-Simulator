function calculateRR(processos, quantum) {
    const newProcessos = normalize(processos, quantum);
    const metricas = calcularMetricas(newProcessos);

    return metricas;
}

function normalize(processos, quantum) {
    let newProcessos = [...processos];

    newProcessos = ajustarDuracaoQuantum(newProcessos, quantum);
    newProcessos = ajustarTempoDeChegadaQuantum(newProcessos, quantum);
    newProcessos = ajustarFormatoSaida(newProcessos);

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
    const maxDuracao = getMaxDuracao(processos, quantum);
    const totalProcessos = getLabelProcessos(processos).size;

    let duracaoProcAnterior = 0;
    let tempoAtual = quantum;
    let labelsProcessosDisponiveis = [];
    let indexProximoProcesso = 0;

    const processosEsperando = [];
    const processosProntos = [];

    function trocaStatusProcesso (arrayWait, arrayReady, indexProximoProcesso) {
        let proximoProcessoFila = arrayWait[indexProximoProcesso]?.splice(0,1)[0]; //Remove processo da estado de esperando
        if (proximoProcessoFila !== undefined ) arrayReady.push(proximoProcessoFila); //Adiciona o processo no estado pronto
    }

    while(tempoAtual <= maxDuracao) { //mudar quantum para maxDuracao
        labelsProcessosDisponiveis = getLabelProcessosDisponiveis(processos, tempoAtual, quantum);

        if(indexProximoProcesso === totalProcessos) {
            indexProximoProcesso = 0;
        }
        
        if(!labelsProcessosDisponiveis.size) {
            if (processosEsperando.length > 0) {
                trocaStatusProcesso(processosEsperando, processosProntos, indexProximoProcesso);

                indexProximoProcesso += 1;
                tempoAtual += quantum;
            }
            continue;
        };

        labelsProcessosDisponiveis.forEach(function(label){
            let processosMesmaLabel = processos.filter((proc) => proc.label === label);
    
            if (processosMesmaLabel.length > 1) {
                processosProntos.push(processosMesmaLabel.splice(0, 1)[0]);//Remove primeiro elemento do array
                processosEsperando.push(processosMesmaLabel);
            } else {
                processosProntos.push(processosMesmaLabel[0]);
            }

        });

        trocaStatusProcesso(processosEsperando, processosProntos, indexProximoProcesso);

        indexProximoProcesso += 1;
        tempoAtual += quantum;
    }

    //Junta os arrays
    processosProntos.forEach(function(processo) {
        if (processo.tempoDeChegada < duracaoProcAnterior) {
            processo.inicioProcesso = duracaoProcAnterior;
        } else {
            processo.inicioProcesso = processo.tempoDeChegada;
        }

        duracaoProcAnterior = processo.duracao < quantum ? processo.inicioProcesso + processo.duracao: processo.inicioProcesso + quantum;
    });

    return processosProntos;
}

function ajustarFormatoSaida(processos) {
    const sortedProcessos = processos.sort((a, b) => a.label - b.label);
    const lables = getLabelProcessos(sortedProcessos);

    const result = [];

    lables.forEach(function(label) {
        const processo = {
            label,
            times: [],
            waitTimes: [],
        }

        const newTimes = sortedProcessos
            .filter((processo) => processo.label === label)
            .reduce((acc, {inicioProcesso, duracao}) => {
               acc.push({startTime: inicioProcesso, duration: duracao});
               return acc;
            }, []);
       
        processo.times = [...newTimes];

        processo.waitTimes = setarWaitTimes(sortedProcessos, label);

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

    console.log(totalDuracaoProcesso(processos));
    const tempo = processos
        .map(({times, waitTimes}) => {return {times, waitTimes}})
        .reduce((acc, proc) => { // vai ter que somar a duracao dos times e depois subtrair pela duracao do waitTimes
            // console.log(proc);
            // let time = proc.times.pop();
            // let waitTime = proc.waitTimes.pop();

            // let mediaExecucao = (time.startTime + 1) / qntProcessos;
            // let mediaEspera = waitTime.duration - waitTime.startTime / qntProcessos;

            // acc.tempoMedioExecucao = mediaExecucao > acc.tempoMedioExecucao ? mediaExecucao : acc.tempoMedioExecucao;

            return acc;
        }, {tempoMedioExecucao: 0, tempoMedioEspera: 0, trocasDeContexto: 0});
    
    // console.log(tempo);

    processos.forEach(function(processo) {
        const tempoProcesso = processo.times.reduce((acc, value) => {
            let mediaExecucao = (value.startTime + 1) / qntProcessos;

            acc.tempoMedioExecucao = mediaExecucao > acc.tempoMedioExecucao ? mediaExecucao : acc.tempoMedioExecucao;
            acc.tempoMedioEspera += Math.abs(value.startTime - value.duration)/ qntProcessos;
            acc.trocasDeContexto++;

            return acc;
        },
        {tempoMedioExecucao: 0, tempoMedioEspera: 0, trocasDeContexto: 0});

        // console.log(tempoProcesso);
        metricas.metricas.tempoMedioExecucao += Math.ceil(tempoProcesso.tempoMedioExecucao);
        metricas.metricas.tempoMedioEspera += Math.ceil(tempoProcesso.tempoMedioEspera);
        metricas.metricas.trocasDeContexto += tempoProcesso.trocasDeContexto;
    });

    return metricas;
}

function totalDuracaoProcesso(processos) {
    return processos
        .slice()
        .map((processo) => {
            const duracaoTotal = processo.times
                .reduce((total, {_, duration}) => total + duration, 0);

            return {label: processo.label, total: duracaoTotal}
        })
}

function setarWaitTimes(processos, label) {
    const mesmosProcessos = processos.filter((processo) => processo.label === label);

    const firstProcesso = mesmosProcessos.slice(0, 1)[0];
    const lastProcesso = mesmosProcessos.slice(-1)[0];
    const duration = lastProcesso.inicioProcesso - firstProcesso.tempoDeChegada;

    const waitTime = [{startTime: firstProcesso.tempoDeChegada, duration: duration}];

    return waitTime;
}

function getLabelProcessosDisponiveis(processos, tempoAtual, quantum) {
    return new Set(
        processos
        .filter((processo) => 
            processo.tempoDeChegada < tempoAtual 
            && processo.tempoDeChegada >= tempoAtual - quantum
        )
        .map(processo =>processo.label));
}

function getLabelProcessos(processos) {
    return new Set(processos.map(processo =>processo.label));
}

function getMaxDuracao(processos, quantum) {
    let max = processos.reduce((acc, processo) => acc + processo.duracao, 0);
    return max % quantum !== 0 ? max + 1 : max; 
}

export default calculateRR;