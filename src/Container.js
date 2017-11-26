import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

export default class Containers extends Component {
  constructor({ match }) {
    super();
    this.state = {
      alive: true,
      containerData: [],
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
    const updateData = () => fetch(`/api/containers/${containerId}/`)
     .then(response => response.json())
     .then(data => {
       if (!data.alive) {
         this.setState({
           alive: false,
         })
       } else {
        this.appendContainerData({ data });
       }
     });
    this.intervalId = setInterval(updateData, 5000);
    updateData();
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    if (this.state.alive) {
      const cpuData = {
        labels: this.state.containerData.map((data) => new Date(data.timestamp)),
        datasets: [
          {
            label: 'CPU',
            borderColor: 'rgba(0, 0, 255, 1.0)',
            backgroundColor: 'rgba(0, 0, 255, 1.0)',
            data: this.state.containerData.map((data) => data.usage.cpu),
          },
          {
            label: 'CPU Limit',
            fill: false,
            borderColor: 'rgba(255, 0, 0, 1.0)',
            backgroundColor: 'rgba(255, 0, 0, 1.0)',
            data: this.state.containerData.map((data) => data.spec.cpu.limit),
          },
        ]
      };
      const memoryData = {
        labels: this.state.containerData.map((data) => new Date(data.timestamp)),
        datasets: [
          {
            label: 'Memory',
            borderColor: 'rgba(0, 0, 255, 1.0)',
            backgroundColor: 'rgba(0, 0, 255, 1.0)',
            data: this.state.containerData.map((data) => (data.usage.memory / 1024 / 1024)),
          },
          {
            label: 'Memory Limit',
            fill: false,
            borderColor: 'rgba(255, 0, 0, 1.0)',
            backgroundColor: 'rgba(255, 0, 0, 1.0)',
            data: this.state.containerData.map((data) => (data.spec.memory.limit / 1024 / 1024)),
          },
        ]
      };
      const options = {
        animation: {
          duration: 0,
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                second: 'mm:ss',
              }
            }
          }]
        }
      };
      const memoryOptions = {
        ...options,
        scales: {
          ...options.scales,
          yAxes: [{
            ticks: {
              callback: (value) => `${value} MB`,
              beginAtZero: true,
            }
          }]
        }
      };

      const cpuOptions = {
        ...options,
        scales: {
          ...options.scales,
          yAxes: [{
            ticks: {
              callback: (value) => `${value}m`,
              beginAtZero: true,
            }
          }]
        }
      };
      console.log('memoryData', memoryData);
      return (
        <div>
          <Link to={`/`}>Back To Containers</Link>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 600,
              }}
            >
              <Line
                data={cpuData}
                options={cpuOptions}
                width={600}
                height={250}
              />
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 600,
              }}
            >
              <Line
                data={memoryData}
                options={memoryOptions}
                width={600}
                height={250}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div>Container has died :(</div>
          <Link to={`/`}>Back To Containers</Link>
        </div>
      );
    }
  }
}
