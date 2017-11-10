import React, { Component } from 'react';
import BarChart from './BarChart';

export default class Containers extends Component {
  constructor({ match }) {
    super();
    this.state = {
      usage: {},
      limits: {},
    };
  }

  componentDidMount() {
    const containerId = this.props.match.params.containerId;
    this.intervalId = setInterval(() => {
      fetch(`/api/containers/${containerId}/`)
       .then(response => response.json())
       .then(containerData => this.setState({ ...containerData }));
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return (
      <div>
        <div>{decodeURIComponent(this.props.match.params.containerId)}</div>
        <div>{JSON.stringify(this.state)}</div>
        <BarChart data={[5,10,1,3]} size={[500,500]} />
      </div>
    );
  }
}
