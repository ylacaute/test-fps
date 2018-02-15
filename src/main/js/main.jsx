import React from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import Application from './Application.jsx'
import logoClickCount from 'redux/reducer/Logo';
import LoggerMiddleware from 'redux/middleware/Logger';

const store = createStore(
  combineReducers({
    logoClickCount,
  }),
  applyMiddleware(
    LoggerMiddleware
  )
);

render(
  <Provider store={store}>
    <Application />
  </Provider>,
  document.getElementById('react-app')
);
