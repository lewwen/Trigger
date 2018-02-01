import * as React from 'react';

import DraggableCommand from './DraggableCommand';
import CommandDropTarget from './CommandDropTarget';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Map } from 'immutable';
import { Container, MetaNode } from '../types';
import { TriggerState } from '../TriggerState';
import { MetaContext } from '../MetaContext';
import { allActions as CommandActions } from '../actions/CommandActions';

import { getChildren } from '../util/Containers';

interface Props {
    containerKey: number,
    containers: Map<number, Container>,
    context: MetaContext,
    actions: any
}

let _CommandCollection = ({ containerKey = 0, containers = null as Map<number, Container>, context = null as MetaContext, actions = null }) => {
    const commands = getChildren(containers, containerKey);

    return <div className="commands">
        {commands.map(x => <CommandDropTarget key={x.key} containerKey={containerKey} insertBeforeKey={x.key}>
            <DraggableCommand containers={containers} context={context} container={x} children={getChildren(containers, getChildren(containers, x.key)[0].key)} deletable={true} actions={actions} />
        </CommandDropTarget>)}
        <CommandDropTarget containerKey={containerKey} />
    </div>;
}

const CommandCollection = connect(
    (state: TriggerState, ownProps?: Props) => ({ containers: state.containers, context: state.context }),
    dispatch => ({ actions: bindActionCreators(CommandActions, dispatch) }))
(_CommandCollection);

export default CommandCollection;