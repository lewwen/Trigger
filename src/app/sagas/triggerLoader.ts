import { Seq } from 'immutable';
import { takeLatest, SagaIterator } from 'redux-saga';
import { take, call, put, race, select } from 'redux-saga/effects';
import { TriggerState } from '../TriggerState';
import { LOAD_TRIGGER } from '../constants/ActionTypes';
import { TriggerDefinitionNode, Container, MetaNode, ContainerTypes } from '../types';

import MetaQueryable from '../util/MetaQueryable';
import ContainerQueryable from '../util/ContainerQueryable';
import { LoadTriggerAction } from '../actions/TriggerLoadingActions';
import { addCommand, changeId, addContainer, extendContainer } from '../actions/CommandActions'
import { isCollection } from '../util/MetaHelper';

export default function* triggerLoader() {
    yield* takeLatest(LOAD_TRIGGER, loadTrigger);
}

function* loadTrigger(action: LoadTriggerAction) {
    yield setupCommand(action.nodes, -1, 0);
}

function* setupCommand(node: TriggerDefinitionNode, parent: number, index: number): SagaIterator {
    var commandMeta = globalContextQuery(yield select()).filter(n => n.containerType == ContainerTypes.COMMAND && n.id == node.id).first();
    yield put(addCommand(parent, commandMeta.key));
    
    var command = getChildContainerAtIndex(yield select(), parent, index);
    
    yield call(setupCommandChildren, command, node);
}

function* setupCommandChildren(command: Container, node: TriggerDefinitionNode): SagaIterator {   
    
    var paramsContainer = stateQuery(yield select(), command).children().withId("params").first();   
    var paramsNode = Seq(node.children).filter(n => n.id == "params").first();    
    yield call(setupParameters, paramsNode, command, paramsContainer);
}

function getChildContainerAtIndex(state: TriggerState, parent: number, index: number) {
    if (parent === -1) {
        return state.containers.first();
    }    
    var parentContainer = state.containers.get(parent);   
    return stateQuery(state, parentContainer).children().nodes.sortBy(c => c.sequence).skip(index).first();
}

function* setupParameters(node: TriggerDefinitionNode, command: Container, params: Container): SagaIterator {
    if (params == null || node.children == null) { 
        //we not go further if params is empty
    }
    else{       
     for (var paramNode of node.children) {
        let state: TriggerState = yield select();
        let param = stateQuery(state, params).children().withId(paramNode.id).first();
       
        if (param == null) {
            throw new Error(`Parameter '${paramNode.id}' not found in command '${state.context.nodes.get(command.meta).text}'`);
        }
        
        let paramMeta = state.context.nodes.get(param.meta);
        
        if (isCollection(paramMeta)) {
            if (paramNode.children == null) {
                continue;
            }
            
            let index = 0;
            for (let paramChildNode of paramNode.children) {
                if (paramMeta.type.type == "command") {                    
                    yield call(setupCommand, paramChildNode, param.key, index++);
                } else {                   
                    yield call(setupContainerAddition, paramChildNode, param.key, index++);
                }
            }
        } else {               
            yield call(setupContainerID, paramNode.children[0], stateQuery(state, param).children().first());
            }
      }
    }
}

function* setupContainerID(node: TriggerDefinitionNode, container: Container): SagaIterator {
    if (container==null){
       // console.log("container is not definited");
    }
    else{
    yield call(waitForMetaToLoad, container);   
    var state: TriggerState = yield select();
    var isLegacyLookup = state.containers.get(container.parent).id == "lookup" && container.siblingMeta.length == 1 && container.id != node.id;
    if (isLegacyLookup) {
        container = stateQuery(state, container).children().first();
    }
     
    if (container.id != node.id) {        
        yield put(changeId(container.key, node.id));    
        container = yield call(getContainerWhenMatchesID, node, container);
        state = yield select();
    }
     
    if (node.children != null && node.children.length > 0) {       
        yield call(setupContainer, node, container);        
    }
    }
    
}

function* setupContainer(node: TriggerDefinitionNode, container: Container): SagaIterator {
    var state: TriggerState = yield select();
    var containerMeta = state.context.nodes.get(container.meta);     
    if (containerMeta.containerType === ContainerTypes.COMMAND) {
        yield call(setupCommandChildren, container, node);
    } else {
        var shouldDrillDown = container.canDrillDown && stateQuery(state, container).children().nodes.count() === 0;
        if (shouldDrillDown) {
            yield put(extendContainer(container.key));
            state = yield select();
        }         
        yield call(setupContainerID, node.children[0], stateQuery(state, container).children().first());
    }
}

function* waitForMetaToLoad(container: Container): SagaIterator {
    if (container.meta == null){
        console.log(container.toJS());
    }    
    while (((yield select()) as TriggerState).context.loadingNodes.contains(container.meta)) {
        yield take('*');
    }
}

function* setupContainerAddition(node: TriggerDefinitionNode, parent: number, index: number): SagaIterator {
    yield put(addContainer(parent));
    
    var container = getChildContainerAtIndex((yield select()) as TriggerState, parent, index);   
    yield call(setupContainerID, node, container);
}

function* getContainerWhenMatchesID(node: TriggerDefinitionNode, container: Container): SagaIterator {
    while ((container = ((yield select()) as TriggerState).containers.get(container.key)).id != node.id) {
        yield take('*');
    }
    
    return container;
}

function globalContextQuery(state: TriggerState): MetaQueryable {
    return contextQuery(state, state.context.nodes.get(state.context.contextKeys.global)).children();
}

function contextQuery(state: TriggerState, ...nodes: MetaNode[]): MetaQueryable {
    return new MetaQueryable(state.context, Seq(nodes));
}

function stateQuery(state: TriggerState, ...containers: Container[]): ContainerQueryable {
    return new ContainerQueryable(state.containers, Seq(containers));
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))