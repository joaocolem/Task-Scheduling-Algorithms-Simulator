function calculateRR(processos, quantum) {
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
    const procMaisDeUmObjeto = [];
    const primeirosProcessos = [];
    const restoProcessos = [];
    labels.forEach(function(label){
        let procMesmaLabel = processos.filter((proc) => proc.label === label);
        if (procMesmaLabel.length > 1) {
            primeirosProcessos.push(procMesmaLabel.splice(0, 1)[0]);//Remove primeiro elemento do array
            procMaisDeUmObjeto.push(procMesmaLabel);
        } else {
            restoProcessos.push(procMesmaLabel[0]);
        }
    });

    //VERIFICA A POSSIBILIDADE DE EXECUTAR MAIS UM QUANTUM DO PROCESSO EM SEQUENCIA
    for(let i=0; i< procMaisDeUmObjeto.length; i++){
        let n = 2;

        while(procMaisDeUmObjeto[i][0]?.tempoDeChegada + quantum**n - 1<= primeirosProcessos[i + 1]?.tempoDeChegada) {
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
    const newProcessos = restoProcessos.concat(primeirosProcessos.concat(procFinalFila));
    newProcessos.sort((a, b) => a.label - b.label);

    // Seta tempo de chegada com base na duracao do ultimo processo
    newProcessos.forEach(function(processo) {
        if (processo.tempoDeChegada < duracaoProcAnterior) {
            processo.tempoDeChegada = duracaoProcAnterior;
        }

        duracaoProcAnterior = quantum + processo.tempoDeChegada;
    });

    return newProcessos;
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
                let startWait = 
                    Math.trunc(tempoDeChegada / quantum) === 1 || 
                    Math.trunc(tempoDeChegada / quantum) === quantum 
                    ? tempoDeChegada
                    : Math.ceil(tempoDeChegada / quantum) + 1;

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