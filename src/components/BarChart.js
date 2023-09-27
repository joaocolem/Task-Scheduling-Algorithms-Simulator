import React from 'react';


function generateColor(index) {
  const palette = [
    "#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087",
    "#f95d6a", "#ff7c43", "#ffa600", "#ffcc00", "#ffcc00"
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
    this.chartHeight = 500;
    this.numIncrements = 0; // Inicializamos com 0, iremos calcular em componentDidMount.
  }

  

  componentDidMount() {
    // Calcule o número de incrementos com base na maior duração de todos os itens.
    const maxDuration = Math.max(
      ...this.state.items.map((item) => {
        let maxTime = 0;

        item.times.forEach((time) => {
          maxTime = Math.max(maxTime, time.startTime + time.duration);
        });

        item.waitTimes.forEach((waitTime) => {
          maxTime = Math.max(maxTime, waitTime.startTime + waitTime.duration);
        });

        return maxTime;
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
    let currentTime = 0;

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
        <text key={`legend-${index}`} x={x} y={y} fill={`rgb(0, ${index * 70}, 200)`} fontWeight="bold">
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
