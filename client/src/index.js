import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as clonedeep from 'lodash.clonedeep';
import { getInitialState, getStore } from './services/store';
import App from './components/app';
import './index.scss';
import 'font-awesome/css/font-awesome.min.css';
export const RootContext = createContext({
  getInitialState: _ => { }
});

getStore().then(store => {
  console.log(store.getState());

  ReactDOM.render(
    <RootContext.Provider value={{
      getInitialState: _ => clonedeep(store.getState())
    }}>
      <Provider store={store}>
        <App />
      </Provider>,
  </RootContext.Provider>,
    document.getElementById('root')
  );
})

