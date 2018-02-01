import { Map, Seq } from 'immutable';
import * as React from 'react';
import { Container } from '../types';
import { MetaContext } from '../MetaContext';
import CommandParameter from './CommandParameter';
import ParameterInput from './ParameterInput';

let CommandValue = ({ container = null as Container, parameters = null as Container[], containers = null as Map<number, Container>, 
    context = null as MetaContext, actions = null, valueContainer = null as Container, showDrillDrow = null as boolean }) => {
    const commandName = context.nodes.get(container.meta).text;

    return <div><div className="group command">
        <h2>{commandName}</h2>

        <div className="parameters">
            {Seq(parameters || []).sortBy(c => c.sequence).map(child => <CommandParameter key={child.key} containers={containers} context={context} container={child} actions={actions} />)}
        </div>        
    </div>
        <div>
        <ParameterInput container={valueContainer} containers={containers} context={context} actions={actions} />
    </div>
    {showDrillDrow? <a href="#" onClick={() => actions.extendContainer(valueContainer.key)}>
            ..
        </a>: null}     
        </div>;
    
};

export default CommandValue;