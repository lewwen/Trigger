import { Iterable, Map, List, Seq } from 'immutable';
import { Container, MetaNode, SubscriptionEntry, VariableEntry, ContainerTypes } from '../../types';
import { TriggerState } from '../../TriggerState';
import { ADD_CONTAINER, ADD_COMMAND, DELETE_CONTAINER, EXTEND_CONTAINER, CHANGE_CONTAINER_ID, MOVE_COMMAND, LOAD_NODES } from '../../constants/ActionTypes';
import ContainerQueryable from '../../util/ContainerQueryable';
import MetaQueryable from '../../util/MetaQueryable';
import { isCollection } from '../../util/MetaHelper';
import { getChildren, getFirstChild,hasNoChild } from '../../util/Containers';
import { importSimpleMetaNode, addMetaNodeTyping, removeAsyncTypes, rebuildTypeCache, removeMetaNode, removeMetaNodeTyping } from '../../util/convertContext';

import strings from '../../strings';
import { isValidDate } from '../../util/DateValidation';

import { addSubscriptionsToState, applySubscriptionToMeta, getNewSubscriptionsForParameters, getNewSubscriptionsForCommandValue, createSubscriptionEntry, createVariableWithSubscription } from './subscriptions';
import { getSiblingsByType, getMetaForType, getSiblingsByTypeTask } from '../../util/pathMatching';
import { CommonTypes, cloneNode, updateContext } from '../../MetaContext';
import { BaseAction, isAddCommand, isAddContainer, isChangeId, isDeleteContainer, isExtendContainer, isMoveCommand, isLoadNodes } from '../../actions/CommandActions';

export default (state: TriggerState, action: BaseAction): TriggerState => {
    if (isAddCommand(action)) {
        let { parent, command, addBeforeKey } = action;

        let commandMeta = state.context.nodes.get(command);
        var sequenceSpace = createSequenceSpaceForContainer(state, parent, addBeforeKey);
        
        state = sequenceSpace.state;
        
        let addedContainer = makeContainer(state, parent, null, commandMeta).set('sequence', sequenceSpace.sequence);
        state = saveContainer(state, addedContainer);

        return addCommandChildren(state, commandMeta, addedContainer, parent).state;
    } else if (isAddContainer(action)) {
        let { key } = action;

        let parameter = state.containers.get(key);
        
        return addContainersToParameter(state, parameter, getNextSequenceForContainer(state, key));
    } else if (isExtendContainer(action)) {
        return extendContainer(state, action.key);
    } else if (isChangeId(action)) {
        let { key, id  } = action;

        let containerToChange = state.containers.get(key);
        let metaOfChangedContainer = state.context.nodes.get(containerToChange.meta);       
        let surroundingParameter = state.containers.get(containerToChange.parameter);  
        
        if (state.context.nodes.get(state.context.nodes.get(metaOfChangedContainer.parent).parent).containerType == ContainerTypes.INPUT) {
            containerToChange = containerToChange.
                set('id', id).
                set('errors', validateInputContainerValue(state, id, metaOfChangedContainer));
            
            state = saveContainer(state, containerToChange);   
            return updateSubscriptionValuesForParameter(state, surroundingParameter, containerToChange);
        }

        state = deleteContainerChildren(state, containerToChange);

        let changedContainerParent = state.containers.get(containerToChange.parent);

        state= addContainersToPath(state, surroundingParameter, changedContainerParent, containerToChange.sequence, id, true, key);

        if(surroundingParameter.id == 'workflow'){
            var metaKey = state.context.typing.filter(t => t.type.type == 'task' && t.type.tags.get('workflow') == id);
            var metaForType = state.context.nodes.get(metaKey.first().meta)           
            if (metaForType.async != null) {
                return state.setIn(['context', 'loadingNodes'], state.context.loadingNodes.push(metaForType.key));
            }
        }
        
        if(id == 'gettasktemplate'){
           let workflowSurroundingParameter=getFirstChild(state.containers,getFirstChild(state.containers,containerToChange))
           let workflowLookup=getFirstChild(state.containers,getFirstChild(state.containers,workflowSurroundingParameter))
           let workflowContainerToChange=getFirstChild(state.containers,getFirstChild(state.containers,workflowLookup))
           state=updateSubscriptionValuesForParameter(state, workflowSurroundingParameter, workflowContainerToChange);
       }

         
       
       
        return state;

    } else if (isDeleteContainer(action)) {
        let { key } = action;

        let container = state.containers.get(key);

        if (container) {
            return deleteContainer(state, container);
        }
    } else if (isMoveCommand(action)) {
        let { command, parent, addBeforeKey } = action;
        
        let existingCommand = state.containers.get(command);
        let commandsBelowCurrent = new ContainerQueryable(state.containers, Seq.of(existingCommand)).parent().children().filter(node => node.sequence > existingCommand.sequence).toArray();
        
        state = saveContainers(state, commandsBelowCurrent, change => change.set('sequence', change.sequence - 1));
        
        var sequenceSpace = createSequenceSpaceForContainer(state, parent, addBeforeKey);
        
        state = sequenceSpace.state;
        
        return saveContainer(state, existingCommand.
                                        set('parent', parent).
                                        set('sequence', sequenceSpace.sequence));
    } else if (isLoadNodes(action)) {
        let { key, nodes } = action;
        
        state = state.setIn(['context', 'loadingNodes'], state.context.loadingNodes.filterNot(n => n === key));
        
        let parent = state.context.nodes.get(key);
        
        {
            let context = Seq(nodes).reduce((context, node) => importSimpleMetaNode(context, parent, node), state.context);
            context = removeAsyncTypes(context, parent);
            context = rebuildTypeCache(context);
            
            state = state.set('context', context);
        }
        
        var nodesWhereInSiblings = state.containers.filter(n => Seq(n.siblingMeta).contains(key));
        state = nodesWhereInSiblings.reduce((state, n) => {
            var parameter = state.context.nodes.get(state.containers.get(n.parameter).meta);
            var parent = state.containers.get(n.parent);
            var parentMeta = state.context.nodes.get(parent.meta);
            
            var siblingMeta = getSiblingsByType(state, parameter.type, parentMeta).map(sibling => sibling.key);
            
            return Seq(siblingMeta).contains(n.key) ? state : state.setIn(['containers', n.key, 'siblingMeta'], siblingMeta);
        }, state);

        
        
        if(parent.type.type =='task'){
            let taskmeta = state.context.nodes
            .filter(x => x.type.type == 'lookup' 
            && x.type.tags.get('lookup') == 55
            && x.id ==parent.type.tags.get('workflow'))
            .first();

            let containerUpdated  = state.containers.filter(c => c.meta === taskmeta.key).first();
            if (containerUpdated != null){
                return updateSubscriptionValuesForParameter(state, state.containers.get(containerUpdated.parameter), containerUpdated);
            }
   }
        
        

        //Caculate the child nodes of anywhere this node is selected
        return state.containers.
            filter(c => c.meta === key).
            reduce((state, container) => addContainerEntriesRecursively(state, state.containers.get(container.parameter), container, 0), state);
    }

    return state;
}

function createSequenceSpaceForContainer(state: TriggerState, parent: number, addBeforeKey?: number): { sequence: number, state: TriggerState } {
    if (!addBeforeKey) {
        return { state, sequence: getNextSequenceForContainer(state, parent) };
    }
    
    var containerToAddBefore = state.containers.get(addBeforeKey);
    var containersAfterThisContainer = getChildren(state.containers, parent).filter(node => node.sequence >= containerToAddBefore.sequence);
    
    return {
        state: saveContainers(state, containersAfterThisContainer, change => change.set('sequence', change.sequence + 1)),
        sequence: containerToAddBefore.sequence  
    }
}

function getNextSequenceForContainer(state: TriggerState, parent: number) {
    var existingContainers = getChildren(state.containers, parent);
    var getNextSequence = () => Seq(existingContainers).max((a, b) => a.sequence - b.sequence).sequence + 1;
    return existingContainers.length === 0 ? 0 : getNextSequence();
}

function validateInputContainerValue(state: TriggerState, id: string, meta: MetaNode): string[] {
    if (meta.type.type === "number" && isNaN(Number(id))) {
        return [strings.notANumber];
    } else if (meta.type.type === "date" && !isValidDate(id)) {
        return [strings.notADate];
    }
    
    return [];
}

function saveContainers(state: TriggerState, containers: Container[], updater: (change: Container) => Container): TriggerState {
    return containers.reduce((state, container) => saveContainer(state, updater(container)), state);
}

function deleteContainer(state: TriggerState, container: Container): TriggerState {
    //#TEST Make sure that subscriptions have tests around deleting containers with subscriptions to/from them   

    state = deleteContainerChildren(state, container);
    
    //TODO: If this is a command, then remove the command meta, when removing the meta make sure to remove any subscriptions on it too
    //TODO: When removing a meta entry make sure anywhere using it is reset
   
    if (state.variables.filter(x => x.definer == container.key).count() == 0){
        return state.deleteIn(['containers', container.key]);
    }
    else
    {       
        var variables = state.variables.filter(x => x.definer != container.key);
        var metaForVariable = state.variables.filter(x => x.definer == container.key).first().meta;
        //delete all subscriptions which source is metaForVariable
        var subscriptions = state.subscriptions.filter(x => x.source != metaForVariable);
        var containers = state.containers.filter(x => x.meta == metaForVariable);
       
        //remove variable and set meta (of variable)'s parent to null
         state= state.deleteIn(['containers', container.key]).setIn(['context','nodes', metaForVariable,'parent'],null).setIn(['variables'],variables).setIn(['subscriptions'],subscriptions);
        // find all container who's meta is metaForVariable , and reset them
         state =containers.reduce((state,container) => resetParentContainer(state,container),state);
         return state;      
    }    
}

function resetParentContainer(state: TriggerState,container: Container):TriggerState
{
    let parentContainer = state.containers.get(container.parent);
    let surroundingParameter = state.containers.get(parentContainer.parameter);
    let changedContainerParent = state.containers.get(parentContainer.parent);
    state = deleteContainerChildren(state, parentContainer);
    state= addContainersToPath(state, surroundingParameter, changedContainerParent, parentContainer.sequence, parentContainer.id, true, parentContainer.key);
    return state;
}

function deleteContainerChildren(state: TriggerState, container: Container): TriggerState {
    return getChildren(state.containers, container.key).reduce((state, child) => deleteContainer(state, child), state);
}

function makeContainer(state: TriggerState, parent: number, parameter: number, meta: MetaNode): Container {
    return new Container().
        set('key', getNextKey(state.containers)).
        set('id', meta.id).
        set('parent', parent).
        set('parameter', parameter).
        set('meta', meta.key);
}

function saveContainer(state: TriggerState, container: Container): TriggerState {
    return state.setIn(['containers', container.key], container);
}

function addCommandChildren(state: TriggerState, meta: MetaNode, container: Container, commandContainer: number): { state: TriggerState, valueContainer: Container } {
    var valueContainer: Container = null;
    var parameters: Container[];
    var children = new MetaQueryable(state.context, Seq.of(meta)).children().toArray();
    
    for (var child of children) {
        var commandChild = makeContainer(state, container.key, commandContainer, child);      
        state = saveContainer(state, commandChild);

        if (child.id === "params") {
            var parameterMetas = new MetaQueryable(state.context, Seq.of(child)).children().toArray();
            parameters = parameterMetas.map((param, index) => {
                var createdParameter = makeContainer(state, commandChild.key, commandContainer, param).set('sequence', index);
                
                state = saveContainer(state, createdParameter);

                return createdParameter;
            });
            var subscriptions = getNewSubscriptionsForParameters(state, parameters);
            if (meta.variable != null) {
                state = createVariableWithSubscription(state, parameters, container);
            }

            state = addSubscriptionsToState(state,  subscriptions);

            var parametersToPopulate = Seq(parameters).
                filterNot(param => isCollection(state.context.nodes.get(param.meta))).
                sortBy(param => !state.subscriptions.some(sub => sub.source === param.meta));
            
            state = parametersToPopulate.reduce((state, param, index) => addContainersToParameter(state, param, index), state);
        }

        if (child.id === "value") {
            valueContainer = commandChild;
        }        
    }
   
    if (valueContainer != null && typeof(parameters) !='undefined') {
        let valueSubscriptions = getNewSubscriptionsForCommandValue(state, commandChild, parameters);   
        state = addSubscriptionsToState(state, valueSubscriptions);
      }
     
     //if command is set variable, need refresh all variable list
     if (meta.id == 'setvariable' && state.variables.count() !=0){
         var variableMetas = state.variables.map(x => x.meta);
         var containers = state.containers.filter(x => variableMetas.contains(x.meta));
         state =containers.reduce((state,container) => resetParentContainer(state,container),state);
     }

    return { state, valueContainer };
}


function addContainersToParameter(state: TriggerState, container: Container, sequence: number): TriggerState {
    return addContainersToPath(state, container, container, sequence);
}

var addContainersToPath = addContainerEntriesRecursively;

function addContainerEntriesRecursively(state: TriggerState, parameter: Container, parent: Container, sequence: number, selectedId?: string, extending?: boolean, key?: number): TriggerState {
    var parameterMeta = state.context.nodes.get(parameter.meta);
    var parentMeta = state.context.nodes.get(parent.meta);   
    
    if (!extending && reachedEndOfPath(state, parent, parentMeta, parameter, parameterMeta)) {  
                
        if(parameter.id == 'workflow'){
            var metaKey = state.context.typing.filter(t => t.type.type == 'task' && t.type.tags.get('workflow') == parent.id);
            var metaForType = state.context.nodes.get(metaKey.first().meta)           
            if (metaForType.async != null) {
                return state.setIn(['context', 'loadingNodes'], state.context.loadingNodes.push(metaForType.key));
            }
        }
        state = updateSubscriptionValuesForParameter(state, parameter, parent);
        return state;       
    }
    
    if (parent === parameter) {
        parentMeta = state.context.nodes.get(state.context.contextKeys.global);
    }
    var siblings;
    if(state.context.nodes.get(parentMeta.parent).id =='gettasktemplate' || state.context.nodes.get(parentMeta.parent).id =='getprojecttemplate'){
        siblings = getSiblingsByTypeTask(state, parameterMeta.type, parentMeta);
    }
    else{
        siblings = getSiblingsByType(state, parameterMeta.type, parentMeta);
    }
    
        
     if (parent.id =='criteria') {
            siblings = siblings.filter(x => x.id =='comparison')
     }
    if (siblings.length === 0) {       
        throw new Error('No siblings found for parameter');
    }

    var meta = selectedId ? (siblings.filter(sibling => sibling.id === selectedId)[0] || siblings[0]) : siblings[0];

    var nextChildSiblings = getSiblingsByType(state, parameterMeta.type, meta);
    
    var child = makeContainer(state, parent.key, parameter.key, meta).
        set('siblingMeta', siblings.map(sibling => sibling.key)).
        set('canDrillDown', nextChildSiblings.length >0).
        set('sequence', sequence);

    if (key != null) {
        child = child.set('key', key);
    }   

    state = saveContainer(state, child);

    if (meta.containerType === ContainerTypes.COMMAND) {
        var shouldClone = meta.key !== state.context.contextKeys.triggerCommand; //Ideally should check if this has subscriptions, since that is what the cloning is for
        
        if (shouldClone) {
            var cloneOutput = cloneNode(state.context, meta, meta.parent);
            
            meta = cloneOutput.node;
            state = state.set('context', cloneOutput.context);
       }
        
        child = child.set('meta', meta.key);
        state = saveContainer(state, child);
        
        var addedCommandChildren = addCommandChildren(state, meta, child, parameter.key);

        if (!addedCommandChildren.valueContainer) {
            throw new Error('Command with no \'value\' found');
        }
        
        child = addedCommandChildren.valueContainer;
        state = addedCommandChildren.state;
        
        meta = state.context.nodes.get(child.meta);
        state = addedCommandChildren.state;
    }

    var metaForType = getMetaForType(state.context, meta);
    if (metaForType.async != null) {   
        //state = state.setIn(['context', 'loadingNodes'], state.context.loadingNodes.push(221));    
        return state.setIn(['context', 'loadingNodes'], state.context.loadingNodes.push(metaForType.key));
    }

    var finalState = addContainerEntriesRecursively(state, parameter, child, 0, selectedId);
    return finalState;
}

function reachedEndOfPath(state: TriggerState, container: Container, containerMeta: MetaNode, parameter: Container, parameterMeta: MetaNode): boolean {
    if (container === parameter) {return false;}
    var typeMatch : boolean;
    //if (parameterMeta.type.equals(CommonTypes.CONTAINER)||parameterMeta.type.equals(CommonTypes.TEXT)){
    if (parameterMeta.type.type == CommonTypes.CONTAINER.type || parameterMeta.type.type == CommonTypes.TEXT.type){
        typeMatch = containerMeta.containerType === ContainerTypes.VALUE;
    }
    else{
        typeMatch = parameterMeta.type.equals(containerMeta.type)
    }

    //var typeMatch = (parameterMeta.type.equals(CommonTypes.CONTAINER)||parameterMeta.type.equals(CommonTypes.TEXT)) ? containerMeta.containerType === ContainerTypes.VALUE : parameterMeta.type.equals(containerMeta.type);
    return typeMatch &&  hasNoChild(state.containers, container.key);
}

function updateSubscriptionValuesForParameter(state: TriggerState, parameter: Container, value: Container): TriggerState {
    var subscriptionsOfThisParameter = state.subscriptions.filter(sub => sub.targetParameter === parameter);
    if (subscriptionsOfThisParameter.count() == 0){ return state;}
    
    var subscriptions = state.subscriptions.map(sub => {
        if (sub.targetParameter !== parameter) {
            return sub;
        }        
        return Object.assign({}, sub, { targetEndpoint: value });
    }).toList();
    
    state = state.set('subscriptions', subscriptions);
    
    state = subscriptions.
        filter(sub => sub.targetParameter === parameter).
        reduce((state, sub) => {
            var meta = state.context.nodes.get(sub.source);  
            state = applySubscriptionToMeta(state, sub, meta);
            
            var changes = state.context.nodes.get(meta.key);   
                 
           return propagateMetaChanges(state, meta, changes);
    }, state);

      var subs = state.subscriptions.filter(x => x.targetParameter === parameter).map(x => x.source);
      var containers = state.containers.filter(x => subs.contains(x.meta));

      var a = state.containers.
        filter(container => subscriptions.filter(sub => sub.targetParameter === parameter)
        .some(subscription => subscription.source === container.meta));

    return state.containers.
        filter(container => subscriptions.filter(sub => sub.targetParameter === parameter)
        .some(subscription => subscription.source === container.meta))
        .reduce((state, affectedParameter) => updateContainerAffectedByChange(state, affectedParameter), state);
}

function propagateMetaChanges(state: TriggerState, before: MetaNode, after: MetaNode): TriggerState {
   
    if (before.id !== after.id) {
        let containersToUpdate = state.containers.filter(n => n.meta === after.key);        
        state = containersToUpdate.reduce((state, container) => state.setIn(['containers', container.key, 'id'], after.id), state);
    }
    
     
    if (!before.type.equals(after.type)) {
        let parentMeta = state.context.nodes.get(after.parent);        
        
        //clear context.typing.matches which matchingNode == after.key
        //then add matches for after
        
        if (parentMeta.id != 'gettasktemplate'){
            let reInsertNode = (node: MetaNode, parent: MetaNode) => addMetaNodeTyping(removeMetaNodeTyping(state.context, node), Seq.of(node), node.type, parent);        
            let context = rebuildTypeCache(reInsertNode(after, parentMeta));      
            state = state.set('context', context);        
       }
       
        let containersToUpdate = getContainersAffectedByMetaChange(state, after);
        
        state = containersToUpdate.reduce((state, affectedContainer) => {
            var parameterContainer = state.containers.get(affectedContainer.parameter);
            var parameterMeta = state.context.nodes.get(parameterContainer.meta);
            var currentParentMeta = affectedContainer.parent === affectedContainer.parameter ? state.context.nodes.get(state.context.contextKeys.global) : parentMeta;         
            var siblings = getSiblingsByType(state, parameterMeta.type, currentParentMeta);    
            if (affectedContainer.id =='comparison') {
                siblings = siblings.filter(x => x.id =='comparison')
            }     
            return state.setIn(['containers', affectedContainer.key, 'siblingMeta'], siblings.map(sibling => sibling.key));
        }, state);
    }  
    return state;
}

function getContainersAffectedByMetaChange(state: TriggerState, parent: MetaNode): Iterable<number, Container> {
   
    var parameterChildren = state.containers.filter(value => value.parent === value.parameter);
    
    if (parent.key == state.context.contextKeys.global) {       
        return parameterChildren;
    } else {
        var affectedChildren = state.containers.
            filterNot(value => value.parent === -1).
            filter(value => state.containers.get(value.parent).meta === parent.key);            
        return parameterChildren.concat(affectedChildren);
    }     
}

function updateContainerAffectedByChange(state: TriggerState, affectedContainer: Container): TriggerState {
    var meta = state.context.nodes.get(affectedContainer.meta);
    var parameter = meta.containerType === ContainerTypes.PARAMETER ? affectedContainer : state.containers.get(affectedContainer.parameter);
    var hasChildren = getChildren(state.containers, affectedContainer).length !== 0;

    if (hasChildren) state = deleteContainerChildren(state, affectedContainer);

    return addContainersToPath(state, parameter, affectedContainer, 0, null, hasChildren);
}

function extendContainer(state: TriggerState, key: number): TriggerState {
    var containerToExtend = state.containers.get(key);
    var containerToExtendMeta = state.context.nodes.get(containerToExtend.meta);

    var surroundingParameter = state.containers.get(containerToExtend.parameter);
    var surroundingParameterMeta = state.context.nodes.get(surroundingParameter.meta);

    return addContainersToPath(state, surroundingParameter, containerToExtend, 0, null, true);
}

function getNextKey(containers: Map<number, Container>): number {
    return containers.isEmpty() ? 0 : containers.max((node1, node2) => node1.key - node2.key).key + 1;
}
