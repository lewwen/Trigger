import { Map } from 'immutable';
import * as React from 'react';

import { Container } from '../types';
import { MetaContext } from '../MetaContext';

import ParameterInput from './ParameterInput';

let CommandParameter = ({ container = null as Container, containers = null as Map<number, Container>, context = null as MetaContext, actions = null }) => <fieldset>
    <legend>{context.nodes.get(container.meta).text}</legend>
    <div>
        <ParameterInput container={container} containers={containers} context={context} actions={actions} />
    </div>
</fieldset>;

export default CommandParameter;