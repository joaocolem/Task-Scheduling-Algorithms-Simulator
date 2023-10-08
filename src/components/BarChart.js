import React from 'react';


function generateColor(index) {
  const palette = [
    "#FF5733", "#33FF57", "#5733FF", "#FF3367", "#38B71D",
    "#FF33A6", "#00CCFF", "#FF9900", "#9900FF", "#FF0000",
    "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
    "#FFC300", "#3DCCC7", "#7D3DCC", "#B71D6E",
  ];

  const colorIndex = index % palette.length;

  return palette[colorIndex];
}


class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: props.items,
      currentDuration: 0, // Inicialmente, a duração atual é 0.
    };

    this.chartWidth = 1000;
    this.chartHeight = 300;
    this.numIncrements = 0; // Inicializamos com 0, iremos calcular em componentDidMount.
  }
  
  componentDidMount() {
    // Calcule o número de incrementos com base na maior duração de todos os itens.
    const maxDuration = Math.max(// pega o valor maximo do array retornado pelo map e utilizando o spread operator para acessar os elementos do array
      ...this.state.items.map((item) => {
        let maxTime = 0;

        item.times.forEach((time) => {
          maxTime = Math.max(maxTime, time.startTime + time.duration); //para cada item pega o maior tempo entre o maxTime e a duracao do item
        });

        item.waitTimes.forEach((waitTime) => {
          maxTime = Math.max(maxTime, waitTime.startTime + waitTime.duration); //para cada item pega o maior tempo entre o maxTime e a duracao da espera do item
        });

        return maxTime; //retorna o maior tempo de cada item
      })
    );

    this.numIncrements = maxDuration + 1;

    // Atualize a duração atual a cada 1 segundo para animar o preenchimento das barras.
    this.animationInterval = setInterval(() => {
      if (this.state.currentDuration < maxDuration) {
        this.setState((prevState) => ({
          currentDuration: prevState.currentDuration + 1,
        }));
      }
    }, 1000);
  }

  componentWillUnmount() {
    // Certifique-se de limpar o intervalo quando o componente é desmontado.
    clearInterval(this.animationInterval); 
  }

  renderBars(currentDuration) {
    const { items } = this.state;
    let currentTime;

    return items.map((item, index) => {
      const bars = [];

      item.waitTimes.forEach((waitTime, waitIndex) => {
        if (waitTime.startTime + waitTime.duration <= currentDuration) {
          const waitX = (waitTime.startTime / this.numIncrements) * this.chartWidth;
          const waitWidth = (waitTime.duration / this.numIncrements) * this.chartWidth;

          bars.push(
            <g key={`wait-${index}-${waitIndex}`}>
              <rect
                x={waitX}
                y={index * 40}
                width={waitWidth}
                height={30}
                fill="gray"
              />
            </g>
          );

          currentTime = waitTime.startTime + waitTime.duration;
        }
      });

      item.times.forEach((time, subIndex) => {
        if (time.startTime + time.duration <= currentDuration) {
          const x = (time.startTime / this.numIncrements) * this.chartWidth;
          const width = (time.duration / this.numIncrements) * this.chartWidth;

          bars.push(
            <g key={`${index}-${subIndex}`}>
              <rect
                x={x}
                y={index * 40}
                width={width}
                height={30}
                fill={generateColor(index)}
 // Cor das barras
              />
            </g>
          );

          currentTime = time.startTime + time.duration;
        }
      });

      return bars;
    });
  }

  renderXAxis(currentDuration) {
    const xAxis = [];

    for (let i = 0; i <= this.numIncrements; i++) {
      const x = (i / this.numIncrements) * this.chartWidth;
      if (i <= currentDuration) {
        xAxis.push(
          <g key={i}>
            <line x1={x} y1={0} x2={x} y2={this.chartHeight} stroke="#000" />
            <text x={x} y={this.chartHeight + 15} textAnchor="middle">
              {i}
            </text>
          </g>
        );
      }
    }

    return xAxis;
  }

  renderLegends(currentDuration) {
    const { items } = this.state;

    return items.map((item, index) => {
      const x = (currentDuration / this.numIncrements) * this.chartWidth + 10; // Ajuste a posição X da legenda.
      const y = index * 40 + 15;

      return (
        <text key={`legend-${index}`} x={x} y={y} fill={generateColor(index)} fontWeight="bold">
          {item.label}
        </text>
      );
    });
  }

  render() {
    const { currentDuration } = this.state; // Obtenha a duração atual do estado.

    return (
      <svg width={this.chartWidth + 200} height={this.chartHeight + 30}>
        {this.renderXAxis(currentDuration)} {/* Passe a duração atual para o renderXAxis */}
        {this.renderBars(currentDuration)} {/* Passe a duração atual para o renderBars */}
        {this.renderLegends(currentDuration)} {/* Passe a duração atual para o renderLegends */}
      </svg>
    );
  }
}

export default BarChart;
