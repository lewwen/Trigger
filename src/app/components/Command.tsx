import { Map, Seq } from 'immutable';
import * as React from 'react';
import { Container } from '../types';
import { MetaContext } from '../MetaContext';
import CommandParameter from './CommandParameter';

let Command = ({ container = null as Container, parameters = null as Container[], containers = null as Map<number, Container>, context = null as MetaContext, actions = null }) => {
    const commandName = context.nodes.get(container.meta).text;

    return <div className="group command">
        <h2>{commandName}</h2>

        <div className="parameters">
            {Seq(parameters || []).sortBy(c => c.sequence).map(child => <CommandParameter key={child.key} containers={containers} context={context} container={child} actions={actions} />)}
        </div>
    </div>;
};

export default Command;
