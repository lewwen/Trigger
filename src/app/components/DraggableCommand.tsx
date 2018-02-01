import { Map } from 'immutable';
import * as React from 'react';
import { Container } from '../types';
import { MetaContext } from '../MetaContext';
import CommandParameter from './CommandParameter'

import { DragSource } from 'react-dnd';
import { EXISTING_COMMAND } from '../constants/DragTypes';

interface DraggableCommandProps extends React.Props<DraggableCommand> {
    container: Container;
    children: Container[];
    containers: Map<number, Container>;
    context: MetaContext;
    deletable?: boolean;
    actions: any;
    connectDragSource?: (any) => any;
}

@DragSource<DraggableCommandProps>(
    EXISTING_COMMAND,
    {
        beginDrag: (props, monitor) => ({ key: props.container.key })
    },
    (connect, monitor) => ({ connectDragSource: connect.dragSource()})
)
class DraggableCommand extends React.Component<DraggableCommandProps, any> {
    render() {
        const { container, children, deletable, actions, containers, context, connectDragSource } = this.props;

        const delButton = deletable ? <div className="groupbutton_small" onClick={() => actions.deleteContainer(container.key)}><a>Delete</a></div> : null;

        const commandName = context.nodes.get(container.meta).text;

        return connectDragSource(<div className="group command">
            {delButton}
            <h2>{commandName}</h2>

            <div className="parameters">
                {(children || []).map(child => <CommandParameter key={child.key} containers={containers} context={context} container={child} actions={actions} />)}
            </div>
        </div>);
    }
}

export default DraggableCommand;
