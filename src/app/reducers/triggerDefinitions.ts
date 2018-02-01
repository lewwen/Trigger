import { Map, List } from 'immutable';

import { TriggerDefinition, TriggerDefinitionNode } from '../types';
import { TriggerState } from '../TriggerState';
import { LOAD_TRIGGER_DEFINITIONS, LOAD_TRIGGER, SAVE_TRIGGER, DELETE_TRIGGER, SELECT_TRIGGER } from '../constants/ActionTypes';
import { isEditTrigger, EditTriggerAction, isNewTrigger} from '../actions/TriggerLoadingActions';
import { BaseAction } from '../actions/CommandActions';

export default (state: TriggerState, action: BaseAction): TriggerState => {
    switch (action.type) {
        case LOAD_TRIGGER_DEFINITIONS:
            return state.setIn(['definitions', 'definitions'], List((action as any).definitions));
        case LOAD_TRIGGER:
            var trigger: number = (action as any).trigger;
            var nodes: TriggerDefinitionNode = (action as any).nodes;
        
            return state.setIn(['definitions', 'nodes', trigger], nodes);
        case DELETE_TRIGGER:
            let id = (action as any).trigger;
            let deleteTrigger = state.definitions.definitions.findIndex((x) => x.id == id);            
        
            return state.removeIn(['definitions', 'definitions', deleteTrigger]);
        case SELECT_TRIGGER:
            var trigger: number = (action as any).trigger;
            
            return state.setIn(['definitions', 'selected'], trigger);    
       
    }

    if (isEditTrigger(action)) {
        let id = action.trigger;
        let trigger = state.definitions.definitions.findEntry((x) => x.id == id);
        let coppiedTragger = Object.assign({},trigger[1], getNewValue(action));
        return state.setIn(['definitions', 'definitions', trigger[0]], coppiedTragger);
    }

    if(isNewTrigger(action)){
        var newTriggerDefinition ={id: -1,  name: "", type: action.triggerType, enabled: false, logExceptions: false};
        var triggerDefinions = state.definitions.definitions.push(newTriggerDefinition);        
        return state.setIn(['definitions', 'definitions'],triggerDefinions);
          //state.setIn(['definitions','selected'],-1);
    }

    return state;
}

function getNewValue(action: EditTriggerAction): any {
    if(action.key == "enabled"){
        return {enabled:action.value};
    }
     if(action.key == "name"){
        return {name:action.value};
    }
     if(action.key == "logExceptions"){
        return {logExceptions:action.value};
    }
    return {};
}