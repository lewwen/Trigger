import { ADD_COMMAND, DELETE_CONTAINER, MOVE_COMMAND, CHANGE_CONTAINER_ID, ADD_CONTAINER, EXTEND_CONTAINER, LOAD_NODES } from '../constants/ActionTypes';
import { SimpleContextNode } from '../util/convertContext';

export interface BaseAction {
    type: string;
}

export function isAddCommand(action: BaseAction): action is AddCommandAction {
    return action.type === ADD_COMMAND;
}

interface AddCommandAction extends BaseAction {
    parent: number;
    command: number;
    addBeforeKey?: number;
}

export function addCommand(parent: number, command: number, addBeforeKey?: number): AddCommandAction {
    return {
        type: ADD_COMMAND,
        parent,
        command,
        addBeforeKey
    }
}

export function isDeleteContainer(action: BaseAction): action is DeleteContainerAction {
    return action.type === DELETE_CONTAINER;
}

interface DeleteContainerAction extends BaseAction {
    key: number;
}

export function deleteContainer(key: number): DeleteContainerAction {
    return {
        type: DELETE_CONTAINER,
        key
    }
}

export function isAddContainer(action: BaseAction): action is AddContainerAction {
    return action.type === ADD_CONTAINER;
}

interface AddContainerAction extends BaseAction {
    key: number;
}

export function addContainer(key: number): AddContainerAction {
    return {
        type: ADD_CONTAINER,
        key
    }
}

export function isMoveCommand(action: BaseAction): action is MoveCommandAction {
    return action.type === MOVE_COMMAND;
}

interface MoveCommandAction extends BaseAction {
    command: number;
    parent: number;
    addBeforeKey: number;
}

export function moveCommand(command: number, parent: number, addBeforeKey?: number): MoveCommandAction {
    return {
        type: MOVE_COMMAND,
        command,
        parent,
        addBeforeKey
    }
}

export function isChangeId(action: BaseAction): action is ChangeIdAction {
    return action.type === CHANGE_CONTAINER_ID;
}

interface ChangeIdAction extends BaseAction {
    key: number;
    id: string;
}

export function changeId(key: number, id: string): ChangeIdAction {
    return {
        type: CHANGE_CONTAINER_ID,
        key,
        id
    }
}

export function isExtendContainer(action: BaseAction): action is ExtendContainerAction {
    return action.type === EXTEND_CONTAINER;
}

interface ExtendContainerAction extends BaseAction {
    key: number;
}

export function extendContainer(key: number): ExtendContainerAction {
    return {
        type: EXTEND_CONTAINER,
        key
    }
}

export function isLoadNodes(action: BaseAction): action is LoadNodesAction {
    return action.type === LOAD_NODES;
}

interface LoadNodesAction extends BaseAction {
    key: number;
    nodes: SimpleContextNode[];
}

export const allActions = {
    addCommand,
    deleteContainer,
    addContainer,
    moveCommand,
    changeId,
    extendContainer
}