import * as React from 'react';
import { Map, Seq } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { allActions as CommandActions } from '../actions/CommandActions';

import ContainerQueryable from '../util/ContainerQueryable';
import { Container, MetaNode } from '../types';
import { TriggerState } from '../TriggerState';

import { DropTarget } from 'react-dnd';
import { TOOLBOX_COMMAND, EXISTING_COMMAND } from '../constants/DragTypes';

interface CommandDropTargetProps extends React.Props<CommandDropTarget> {
    containerKey: number;
    containers?: Map<number, Container>;
    dropTarget?: (child: any) => any;
    actions?: any;
    insertBeforeKey?: number;
}

@connect(
    (state: TriggerState) => ({ containers: state.containers }),
    dispatch => ({ actions: bindActionCreators(CommandActions, dispatch) }))
@DropTarget(
    [TOOLBOX_COMMAND, EXISTING_COMMAND],
    {
        canDrop(props: CommandDropTargetProps, monitor) {
            if (monitor.getItemType() === EXISTING_COMMAND) {
                const { containers, containerKey, insertBeforeKey } = props;
                
                let existingCommandKey = monitor.getItem() as { key: number };
                
                if (insertBeforeKey === existingCommandKey.key) {
                    return false;
                }
                
                const existingCommand = containers.get(existingCommandKey.key);
                const targetCommand = containers.get(containerKey);
                
                const droppingInsideItself = new ContainerQueryable(containers, Seq.of(targetCommand)).isChildOf(existingCommand.key);
                return !droppingInsideItself;
            }
            
            return true;
        },
        drop(props: CommandDropTargetProps, monitor, component: CommandDropTarget) {
            if (monitor.didDrop()) {
                return;
            }
            
            const { containerKey, insertBeforeKey, actions } = props;
            
            switch (monitor.getItemType()) {
                case TOOLBOX_COMMAND:
                    const commandToCreate = monitor.getItem() as { key: number };
        
                    actions.addCommand(containerKey, commandToCreate.key, insertBeforeKey);
                    break;
                case EXISTING_COMMAND:
                    const existingCommand = monitor.getItem() as { key: number };
                    
                    actions.moveCommand(existingCommand.key, containerKey, insertBeforeKey);
                    break;
            } 
        }
    },
    (connect, monitor) => ({ dropTarget: connect.dropTarget() })
)
export default class CommandDropTarget extends React.Component<any, any> {
    render() {
        const { dropTarget } = this.props;

        return dropTarget(<div>
        <div style={{ paddingBottom: 20, paddingTop: 20 }} />
            {this.props.children}            
        </div>);
    }
}
