import { Map } from 'immutable';
import * as React from 'react';
import ParameterInput from './ParameterInput';
import { Container } from '../types';
import { MetaContext } from '../MetaContext';

import { getChildren } from '../util/Containers';

let ContainerCollection = ({ container = null as Container, containers = null as Map<number, Container>, context = null as MetaContext, actions = null }) => {
    const nextContainers = getChildren(containers, container.key);

    const parameterEntries = nextContainers.map(param => <div key={param.key}>
        <ParameterInput container={param} containers={containers} context={context} actions={actions} />
    </div>);

    return <div>
        {parameterEntries}
        <div>
            <button className="fbutton" onClick={() => actions.addContainer(container.key)}>Add</button>
        </div>
    </div>;
};

export default ContainerCollection;
