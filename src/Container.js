import React, { Component } from 'react';
import { parse } from 'qs';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

export default class Containers extends Component {
  constructor({
    match,
    location,
  }) {
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
    const { container } = parse(this.props.location.search.substr(1));
    const containerId = decodeURIComponent(this.props.match.params.containerId);
    if (this.state.alive) {
      const cpuData = {
        labels: this.state.containerData.map((data) => new Date(data.timestamp)),
        datasets: [
          {
            label: 'CPU',
            borderColor: 'rgba(54, 162, 235, 1.0)',
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            data: this.state.containerData.map((data) => data.usage.cpu),
          },
          {
            label: 'CPU Limit',
            fill: false,
            borderColor: 'rgba(242, 113, 115, 1.0)',
            backgroundColor: 'rgba(242, 113, 115, 0.7)',
            data: this.state.containerData.map((data) => data.spec.cpu.limit),
          },
        ]
      };
      const memoryData = {
        labels: this.state.containerData.map((data) => new Date(data.timestamp)),
        datasets: [
          {
            label: 'Memory',
            borderColor: 'rgba(54, 162, 235, 1.0)',
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            data: this.state.containerData.map((data) => (data.usage.memory / 1024 / 1024)),
          },
          {
            label: 'Memory Limit',
            fill: false,
            borderColor: 'rgba(242, 113, 115, 1.0)',
            backgroundColor: 'rgba(242, 113, 115, 0.7)',
            data: this.state.containerData.map((data) => (data.spec.memory.limit / 1024 / 1024)),
          },
        ]
      };
      const options = {
        animation: {
          duration: 0,
        },
        elements: {
          line: {
            tension: 0,
          }
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
      return (
        <div>
          <h1>{container}</h1>
          <h3>{containerId}</h3>
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
              <h3>CPU</h3>
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
              <h3>Memory</h3>
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
      // TODO: keep displaying graph data if it exists and stop polling
      return (
        <div>
          <h1>{container}</h1>
          <h3>{containerId}</h3>
          <div>Container has died :(</div>
          <Link to={`/`}>Back To Containers</Link>
        </div>
      );
    }
  }
}
