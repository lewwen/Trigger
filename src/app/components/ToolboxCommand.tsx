import * as React from 'react';
import { DragSource } from 'react-dnd';
import { TOOLBOX_COMMAND } from '../constants/DragTypes';
import { MetaNode } from '../types';

export interface ToolboxCommandProps extends React.Props<ToolboxCommand> {
    command: MetaNode;
    connectDragSource?: (any) => any;
}

@DragSource<ToolboxCommandProps>(
    TOOLBOX_COMMAND,
    {
        beginDrag: (props, monitor) => ({ key: props.command.key })
    },
    (connect, monitor) => ({ connectDragSource: connect.dragSource()})
)
class ToolboxCommand extends React.Component<ToolboxCommandProps, any> {
    render() {
        var { command, connectDragSource } = this.props;

        return connectDragSource(
            <div className="drag-handle">
                <span className="toolbox-command">
                    {command.text}
                </span>
            </div>
        );
    }
}

export default ToolboxCommand;
