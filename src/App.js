import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import Containers from './Containers';
import Container from './Container';

export default () =>
  <Router>
   <div>
    <Route
     path={'/containers/:containerId'}
     component={Container}
    />
    <Route
      exact path={'/'}
      component={Containers}
    />
   </div>
  </Router>;
