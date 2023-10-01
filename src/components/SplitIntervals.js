// Função para dividir um intervalo em intervalos de 1 segundo
    function splitInterval(interval) {
    const result = [];
    for (let i = interval.startTime; i < interval.startTime + interval.duration; i++) {
        result.push({ startTime: i, duration: 1 });
    };

    return result;
}
  
// Função para dividir todos os intervalos de um array de objetos
export function splitIntervals(items) {
    const result = [];

    items.forEach((item) => {
        const newItem = { ...item };
        
        newItem.times = newItem.times.flatMap(splitInterval);
        newItem.waitTimes = newItem.waitTimes.flatMap(splitInterval);
        result.push(newItem);
    });
    return result;
}