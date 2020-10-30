import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as clonedeep from 'lodash.clonedeep';
import { getStore } from './services/store';
import App from './components/app';
import './index.scss';
import 'font-awesome/css/font-awesome.min.css';
export const RootContext = createContext({
  getInitialState: _ => { }
});

getStore().then(store => {
  // disconnect initialState from store state
  const initialState = clonedeep(store.getState());

  ReactDOM.render(
    <RootContext.Provider value={{
      // always return new references
      getInitialState: _ => clonedeep(initialState)
    }}>
      <Provider store={store}>
        <App />
      </Provider>,
  </RootContext.Provider>,
    document.getElementById('root')
  );
})

