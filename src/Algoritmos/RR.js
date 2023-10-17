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
    /*
        [x] Pegar processos do quantum atual
            [] Executar um quantum de cada processo
            [] guardar processos que ainda precisam ser executados
            [] criar array com os processos ate o momento
            [] mandar proximo quantum do processo para o final dos ultimos processos ate o momento
        [] Verificar se chegaram novos processos no proximo quantum
            [] filtrar processos, pegar somente processos diferentes dos que estao no array de processos ate o momento
            [] se nao, executa mais um quantum dos processos que ainda precisam de ser executados
            [] se sim, executa um quantum do processo
    */

    // filtrar pela label
    const maxDuracao = getMaxDuracao(processos);

    let duracaoProcAnterior = 0;
    let tempoAtual = quantum;
    let processosDisponiveis = [];

    while(tempoAtual <= maxDuracao) {
        processosDisponiveis = getProcessosDisponiveis(processos, tempoAtual, quantum);

        console.log(processosDisponiveis);

        tempoAtual += quantum;
    }

    //se houver mais de um objeto jogar objetos para o final da fila
    const procMaisDeUmObjeto = [];
    const primeirosProcessos = [];
    const restoProcessos = [];

    processosDisponiveis.forEach(function(label){
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
    
    // Seta tempo de chegada com base na duracao do ultimo processo
    const newProcessos = [];
    
    //Junta os arrays
    [...primeirosProcessos,...restoProcessos, ...procFinalFila].forEach(function(processo) {
        if (processo.tempoDeChegada < duracaoProcAnterior) {
            processo.inicioProcesso = duracaoProcAnterior;
        } else {
            processo.inicioProcesso = processo.tempoDeChegada;
        }

        duracaoProcAnterior = processo.duracao < quantum ? processo.inicioProcesso + processo.duracao: processo.inicioProcesso + quantum;

        newProcessos.push(processo);
    });

    return newProcessos;
}

function ajustarFormatoSaida(processos, quantum) {
    const sortedProcessos = processos.sort((a, b) => a.label - b.label);
    const lables = getProcessosDisponiveis(sortedProcessos);

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

function setarWaitTimes(processos, label) {
    const mesmosProcessos = processos.filter((processo) => processo.label === label);

    const firstProcesso = mesmosProcessos.slice(0, 1)[0];
    const lastProcesso = mesmosProcessos.slice(-1)[0];
    const duration = lastProcesso.inicioProcesso - firstProcesso.tempoDeChegada;

    const waitTime = [{startTime: firstProcesso.tempoDeChegada, duration: duration}];

    return waitTime;
}

function getProcessosDisponiveis(processos, tempoAtual, quantum) {
    return new Set(
        processos
        .filter((processo) => 
            processo.tempoDeChegada < tempoAtual 
            && processo.tempoDeChegada >= tempoAtual - quantum
        )
        .map(processo =>processo.label));
}

function getMaxDuracao(processos) {
    return processos.reduce((acc, processo) => acc + processo.duracao, 0);
}
export default calculateRR;