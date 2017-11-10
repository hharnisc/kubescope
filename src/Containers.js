import React, { Component } from 'react';
import { Link } from 'react-router-dom';


export default class Containers extends Component {
  constructor() {
    super();
    this.state = {
      containers: [],
    };
  }

  componentDidMount() {
    fetch('/api/containers/')
     .then(response => response.json())
     .then(containers => this.setState({ containers }));
  }

  renderPods({ pods }) {
    return pods.map((pod) =>
      <li key={pod}>
        <Link to={`/containers/${encodeURIComponent(pod)}/`}>{pod}</Link>
      </li>);
  }

  renderContainer({ container }) {
    return (
      <li>
        <ul>
          <div>{container}</div>
          {this.renderPods({ pods: this.state.containers[container] })}
        </ul>
      </li>
    );
  }

  render() {
    return Object.keys(this.state.containers)
      .map((container) => <ul key={container}>{this.renderContainer({ container })}</ul>);
  }
}
