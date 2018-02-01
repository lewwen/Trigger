import * as React from 'react';
import { Map } from 'immutable';
import { Container } from '../types';
import { TriggerState } from '../TriggerState';
import { MetaContext } from '../MetaContext';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { allActions as CommandActions } from '../actions/CommandActions';

import CommandParameter from './CommandParameter';

let TaskTrigger = ({ containers = null as Map<number, Container>, context = null as MetaContext, actions = null }) => <CommandParameter
    container={containers.get(5)}
    containers={containers}
    context={context}
    actions={actions}
/>

export default connect((state: TriggerState) => ({ containers: state.containers, context: state.context }), dispatch => ({ actions: bindActionCreators(CommandActions, dispatch) }))(TaskTrigger);