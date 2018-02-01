import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import storeCreator from './store/configureStore';

import { TriggerDefinition, TriggerDefinitionNode } from './types'
import * as TriggerLoadingActions from './actions/TriggerLoadingActions';
import { allActions as CommandActions } from './actions/CommandActions';
import { createMetaContext, SimpleContextNode } from './util/convertContext';

import TriggersComponent from './pages/Triggers';
import { TriggerState }from './TriggerState';

var store = null;

Triggers.init = (context: SimpleContextNode, triggers: TriggerDefinition[]) => {
	var builtContext = createMetaContext(context); 
	
	store = storeCreator(builtContext);
	
	store.dispatch(TriggerLoadingActions.loadTriggerDefinitions(triggers));
}

Triggers.load = (triggerId: number, triggerNodes: TriggerDefinitionNode) => {
	store.dispatch(TriggerLoadingActions.loadTrigger(triggerId, triggerNodes));
	store.dispatch(TriggerLoadingActions.selectTrigger(triggerId));	
};

Triggers.new = (triggerType:string) => {
	var State = store.getState() as TriggerState;
	store.dispatch(CommandActions.addCommand(-1, State.context.contextKeys.triggerCommand));	
	store.dispatch(TriggerLoadingActions.newTrigger(triggerType));
}

Triggers.render = () => {
	ReactDOM.render(<Provider store={store}>
        <TriggersComponent />
	</Provider>, document.getElementById('root'));
}

if (module.hot) {
	module.hot.accept('./pages/Triggers', () => {
		var NewComponent = require('./pages/Triggers').default;
		ReactDOM.render(<Provider store={store}>
			<NewComponent />
		</Provider>, document.getElementById('root'));
	});
}
