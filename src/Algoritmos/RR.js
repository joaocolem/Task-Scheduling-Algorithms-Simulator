function calculateRR(processos, quantum) {
    const newProcessos = normalize(processos, quantum); //retorna os processos formatados
    const metricas = calcularMetricas(newProcessos); // calcula as metricas, como tempo de execucao e espera

    return metricas;
}

/**
 * Formata os processos para o Escalonador Round-Robin e retorna objeto com de processos formatados
 * 
 * @param {[{ label: string, tempoDeChegada: number, duracao: number }]} processos 
 * @param {number} quantum 
 * @returns {[{processos}]}
 */
function normalize(processos, quantum) {
    let newProcessos = [...processos];

    newProcessos = ajustarDuracaoQuantum(newProcessos, quantum);
    newProcessos = ajustarInicioExecucaoQuantum(newProcessos, quantum);
    newProcessos = ajustarFormatoSaida(newProcessos);

    return newProcessos;
}

/**
 * Ajusta a duracao de cada parte dos processos pelo quantum. Retorna os processos com a duracao de cada parte
 * @param {[{ label: string, tempoDeChegada: number, duracao: number }]} processos 
 * @param {number} quantum 
 * @returns {[{ label: string, tempoDeChegada: number, duracao: number }]}
 */
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

/**
 * Ajusta o inicio de execucao de cada parte de cada processo de acordo com o quantum.
 * 
 * @param {[{ label: string, tempoDeChegada: number, duracao: number }]} processos 
 * @param {number} quantum
 * @returns {[{ label: string, tempoDeChegada: number, duracao: number, inicioProcesso: number }]}
 */
function ajustarInicioExecucaoQuantum(processos, quantum) {
    const maxDuracao = getMaxDuracao(processos, quantum);
    const totalProcessos = getLabelProcessos(processos).size;
    const primeiraExecucao = getPrimeiraExecucao(processos);

    let duracaoProcAnterior = 0;
    let tempoAtual = primeiraExecucao.tempoDeChegada;
    let labelsProcessosDisponiveis = [];
    let indexProximoProcesso = 0;

    const processosEsperando = [];
    const processosProntos = [];

    /**
     * Troca os processos do array processosEsperando para o array processosProntos
     * 
     * @param {[{ label: string, tempoDeChegada: number, duracao: number }]} arrayWait 
     * @param {[{ label: string, tempoDeChegada: number, duracao: number }]} arrayReady 
     * @param {number} indexProximoProcesso
     */
    function trocaStatusProcesso (arrayWait, arrayReady, indexProximoProcesso) {
        let proximoProcessoFila = arrayWait[indexProximoProcesso]?.splice(0,1)[0]; //Remove processo da estado de esperando
        if (proximoProcessoFila !== undefined ) arrayReady.push(proximoProcessoFila); //Adiciona o processo no estado pronto
    }

    while(tempoAtual <= maxDuracao) {
        labelsProcessosDisponiveis = getLabelProcessosDisponiveis(processos, tempoAtual, quantum); // Pega a label dos processos que chegaram no momento

        if(indexProximoProcesso === totalProcessos) { // Reseta o index quando o mesmo for igual a quantidade de processos
            indexProximoProcesso = 0;
        }
        
        if(!labelsProcessosDisponiveis.size) { //Se nao existir processos no intervalo de tempo continua o loop
            if (processosEsperando.length > 0) { // Se tiver processos esperando
                trocaStatusProcesso(processosEsperando, processosProntos, indexProximoProcesso);

                indexProximoProcesso += 1;
            }
            tempoAtual += quantum;
            continue;
        };

        labelsProcessosDisponiveis.forEach(function(label){ //Roda um loop em cima dos processos que estao disponiveis no momento
            let processosMesmaLabel = processos.filter((proc) => proc.label === label); //Pega todos os processos que possuem a mesma label
    
            if (processosMesmaLabel.length > 1) { // Se existir mais de um processo com essa label
                processosProntos.push(processosMesmaLabel.splice(0, 1)[0]);//Remove primeiro elemento do array
                processosEsperando.push(processosMesmaLabel); //manda para os processos esperando
            } else {
                processosProntos.push(processosMesmaLabel[0]); //Adiciona aos processos prontos
            }

        });

        trocaStatusProcesso(processosEsperando, processosProntos, indexProximoProcesso);

        indexProximoProcesso += 1;
        tempoAtual += quantum;
    }

    // Ajusta o inicio do processo para ser igual ao termino do processo anterior
    processosProntos.forEach(function(processo) { 
        if (processo.tempoDeChegada < duracaoProcAnterior) {
            processo.inicioProcesso = duracaoProcAnterior;
        } else {
            processo.inicioProcesso = processo.tempoDeChegada;
        }

        duracaoProcAnterior = processo.duracao < quantum ? (processo.inicioProcesso + processo.duracao) : (processo.inicioProcesso + quantum);
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
    const label = "Round Robin";
    const qntProcessos = processos.length;
    const tempoTotalDuracaoProcesso = totalDuracaoProcessos(processos);
    const metricas = {
        resultado: processos,
        metricas: {
            label,
            tempoMedioExecucao: 0,
            tempoMedioEspera: 0,
            trocasDeContexto: 0
        }
    };

    const tempo = processos
        .map(({label, times, waitTimes}) => {
            return {label, times, waitTimes}
        })
        .reduce((acc, proc) => {
            const ultimoProcesso = proc.times.slice(-1)[0];
            const waitTime = proc.waitTimes[0];
            const totalDuracaoProcesso = tempoTotalDuracaoProcesso.find((process) => process.label === proc.label);
            const totalTempoExecucao = (ultimoProcesso.startTime + ultimoProcesso.duration) - waitTime.startTime;

            let mediaExecucao = totalTempoExecucao / qntProcessos;
            let mediaEspera = (totalDuracaoProcesso.total - totalTempoExecucao) / qntProcessos;

            acc.tempoMedioExecucao += mediaExecucao;
            acc.tempoMedioEspera += mediaEspera;

            return acc;
        }, {tempoMedioExecucao: 0, tempoMedioEspera: 0});
    
    metricas.metricas.tempoMedioExecucao = Number(tempo.tempoMedioExecucao.toFixed(2));
    metricas.metricas.tempoMedioEspera = Math.abs(Number(tempo.tempoMedioEspera.toFixed(2)));
    metricas.metricas.trocasDeContexto = totalTrocaDeContexto(processos);

    return metricas;
}

function totalDuracaoProcessos(processos) {
    return processos
        .slice()
        .map((processo) => {
            const totalDuration = processo
                .times.reduce((total, {_, duration}) => total + duration, 0);

            return {label: processo.label, total: totalDuration}
        });
}

function totalTrocaDeContexto(processos) {
    return processos
        .slice()
        .flatMap((processo) => processo
            .times
            .map((time) => {
                time.label = processo.label
                return time;
        }))
        .sort((a, b) => a.startTime - b.startTime)
        .reduce((total, proc) => {
            if(proc.label !== total.ultimaLabel) {
                total.trocas += 1;
                total.ultimaLabel = proc.label
            }

            return total;
        }, {trocas: 0, ultimaLabel: ''}).trocas -= 1;
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
    let max = processos.reduce((acc, processo) => acc + processo.duracao + processo.tempoDeChegada, 0);
    return max % quantum !== 0 ? max + 1 : max; 
}

function getPrimeiraExecucao(processos) {
    return processos
        .slice()
        .sort((a, b) => a.tempoDeChegada - b.tempoDeChegada)[0];
}
export default calculateRR;