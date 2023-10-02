import React from 'react';
import BarChart from './BarChart.js';
import { splitIntervals } from './SplitIntervals.js';

  export default function RoundRobin({ items, quantum }){
    let cont = 0;
    let start = 0;
    //TODO: ALTERAR STARTIME DE TODOS OS OBJETOS
    //
    ////
    items.forEach((item) => {
        item.times[0].startTime = start;
        start += quantum;
    });

    items.forEach((item) => {
        const newTimes = [];

        item.times.forEach((time) => {
            const diff = time.duration - quantum;
            
            if ( diff > 0 ) {
                const isEven = diff % 2 === 0;
                const pieces =  isEven ? parseInt(diff/quantum) : parseInt(diff/quantum) + 1;
                
                for( let i=0; i < pieces; i++){
                    const nextStart = (items.length * quantum) + cont;

                    if(!isEven && i === pieces - 1) {
                        newTimes.push({ startTime: nextStart, duration: 1 });
                        cont += quantum;
                    } else {
                        newTimes.push({ startTime: nextStart, duration: quantum });
                        cont += quantum;
                    }
                }
                console.log(newTimes);
            }
        });
        item.times = newTimes.length >= 1 ? newTimes: item.times;
    });


    const newItems = splitIntervals(items);
    return (
        <BarChart items={newItems}/>
    );
  }

