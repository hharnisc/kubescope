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

  renderPods({ container, pods }) {
    return pods.map((pod) =>
      <li
        key={pod}
        style={{
          marginTop: '1rem',
        }}
      >
        <Link
          to={`/containers/${encodeURIComponent(pod)}/?container=${container}`}
        >
          {pod}
        </Link>
      </li>);
  }

  renderContainer({ container }) {
    return (
      <li>
        <ul
          key={container}
          style={{
            listStyleType: 'none',
            padding: 0,
          }}
        >
          <div><h2>{container}</h2></div>
          {this.renderPods({
            pods: this.state.containers[container],
            container
          })}
        </ul>
      </li>
    );
  }

  render() {
    return (
      <div>
        {Object.keys(this.state.containers)
          .map((container) =>
            <ul
              key={container}
              style={{
                listStyleType: 'none',
                padding: 0,
              }}
            >
              {this.renderContainer({ container })}
            </ul>)}
      </div>
    );
  }
}
