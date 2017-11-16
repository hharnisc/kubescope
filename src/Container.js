import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

export default class Containers extends Component {
  constructor({ match }) {
    super();
    this.state = {
      containerData: []
    };
  }

  appendContainerData({ data }) {
    const containerData = [...this.state.containerData, data].slice(-10, 11);
    if (data.timestamp !== this.state.currentTimestamp) {
      this.setState({
        containerData,
        currentTimestamp: data.timestamp
      });
    }
  }

  componentDidMount() {
    const containerId = this.props.match.params.containerId;
    this.intervalId = setInterval(() => {
      fetch(`/api/containers/${containerId}/`)
       .then(response => response.json())
       .then(data => this.appendContainerData({ data }));
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    const data = {
      labels: this.state.containerData.map((data) => new Date(data.timestamp)),
      datasets: [
        {
          label: 'My First dataset',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.state.containerData.map((data) => data.usage.cpu),
        }
      ]
    };
    return (
      <Line data={data} width="600" height="250"/>
    );
  }
}
