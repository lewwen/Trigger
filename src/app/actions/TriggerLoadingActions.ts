import { LOAD_TRIGGER_DEFINITIONS, LOAD_TRIGGER, DELETE_TRIGGER, SELECT_TRIGGER, EDIT_TRIGGER,NEW_TRIGGER} from '../constants/ActionTypes';
import { TriggerDefinition, TriggerDefinitionNode } from '../types';

export interface BaseAction {
    type: string;
}

export function loadTriggerDefinitions(triggers: TriggerDefinition[]) {
    return {
		type: LOAD_TRIGGER_DEFINITIONS,
		definitions: triggers
	}
}

export interface LoadTriggerAction extends BaseAction {
    trigger: number;
    nodes: TriggerDefinitionNode;
}

export function loadTrigger(trigger: number, nodes: TriggerDefinitionNode): LoadTriggerAction {
    return { type: LOAD_TRIGGER, trigger, nodes }
}

export function deleteTrigger(trigger: number) {
    return { type: DELETE_TRIGGER, trigger }
}

export function selectTrigger(trigger: number) {
    return { type: SELECT_TRIGGER, trigger }
}

export interface EditTriggerAction extends BaseAction {
    trigger: number;
    key: string;
    value: string;
    
}

export interface NewTriggerAction extends BaseAction {
    triggerType: string;
}

export function editTrigger(trigger: number,key: string, value):EditTriggerAction {
    return { type: EDIT_TRIGGER,
        trigger,
        key,
        value }
}

export function newTrigger(triggerType: string):NewTriggerAction {
    return { type: NEW_TRIGGER,
        triggerType}
}

export function isEditTrigger(action: BaseAction): action is EditTriggerAction {
    return action.type === EDIT_TRIGGER;
}

export function isNewTrigger(action: BaseAction): action is NewTriggerAction {
    return action.type === NEW_TRIGGER;
}

export const allActions = {
    loadTriggerDefinitions,
    loadTrigger,
    deleteTrigger,
    selectTrigger,
    editTrigger,
    newTrigger
}