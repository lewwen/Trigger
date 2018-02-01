import { Map, Set, List } from 'immutable';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducer from '../reducers/index';
import { MetaContext } from '../MetaContext';
import { addCommand } from '../actions/CommandActions';

import containerLoader from '../sagas/containerLoader';
import triggerLoader from '../sagas/triggerLoader';

import { MetaType, MetaNode, Container, SubscriptionEntry, VariableEntry, TriggerDefinition, TriggerDefinitionNode } from '../types';
import { TriggerState, TriggerDefinitionState } from '../TriggerState';

const sagaMiddleware = createSagaMiddleware();

const finalCreateStore: any = compose(
  applyMiddleware(sagaMiddleware)
  ,
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

export default (context: MetaContext) => {
    var defaultState = new TriggerState().set('context', context);
    var store = finalCreateStore(reducer, defaultState);
    
    sagaMiddleware.run(containerLoader);
    sagaMiddleware.run(triggerLoader);

    if (module.hot) {
      module.hot.accept('../reducers/index', () => {
        var nextReducer = require('../reducers/index').default;
        store.replaceReducer(nextReducer);
      });
    }

    return store;
}
