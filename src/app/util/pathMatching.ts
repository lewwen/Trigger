import { Seq } from 'immutable';
import { ContainerTypes, MetaNode, MetaType } from '../../app/types';
import { MetaContext, getDirectChildren } from '../../app/MetaContext';
import MetaQueryable from '../../app/util/MetaQueryable';
import { TriggerState } from '../TriggerState';

interface TypeInfoNode {
    typeMeta: number;
    nodes: number[];
    linkedTypes: number[];
}

export var getMetaForType = (context: MetaContext, node: MetaNode): MetaNode => {
    if (node.containerType === ContainerTypes.VALUE) {
        var metaKey = context.typing.filter(t => t.type.equals(node.type)).first().meta;
        
        if (metaKey != null) {
            node = context.nodes.get(metaKey);
        }
    }
    
    return node;
}

var getChildrenExtended = (context: MetaContext, node: MetaNode): MetaNode[] => {
    return getDirectChildren(context.nodes, getMetaForType(context, node));
}

export var getSiblingsForType = (context: MetaContext, filter: MetaType, parent: MetaNode): MetaNode[] => {
    var filterInfo = context.typing.filter(t => t.type.equals(filter)).first();
    
    if (filterInfo.distanceForLinkedNodes.get(parent.key) == null) {
        return [];
    }
    
    var allChildren = Seq(getChildrenExtended(context, parent));
    
    return allChildren.
        map(n => ({ node: n, distance: filterInfo.distanceForLinkedNodes.get(n.key)})).
        filter(n => n.distance != null).
        sortBy(n => n.distance).
        map(n => n.node).toArray();       
}

export var getSiblingsByType = (state: TriggerState, filter: MetaType, parent: MetaNode): MetaNode[] => {
    var filterInfo = state.context.typing.filter(t => t.type.equals(filter)).first();
    
    if (filterInfo.type.type !='' && filterInfo.distanceForLinkedNodes.get(parent.key) == null && parent.key != 1) {
        return [];
    }
    
    var allChildren = Seq(getChildrenExtended(state.context, parent));

    if (state.variables.count() == 0){
        return allChildren.
            map(n => ({ node: n, distance: filterInfo.distanceForLinkedNodes.get(n.key)})).
            filter(n => n.distance != null && n.node.id != 'variables'&& n.node.id != 'setvariable').
            sortBy(n => n.distance).
            map(n => n.node).toArray();

    }
    else{
        return allChildren.
            map(n => ({ node: n, distance: filterInfo.distanceForLinkedNodes.get(n.key)})).
            filter(n => n.distance != null && n.node.id != 'setvariable').
            sortBy(n => n.distance).
            map(n => n.node).toArray();
    }
    
       
}

export var getSiblingsByTypeTask = (state: TriggerState, filter: MetaType, parent: MetaNode): MetaNode[] => {
   
    var allChildren = Seq(getChildrenExtended(state.context, parent));

    if (state.variables.count() == 0){
        return allChildren.
            map(n => ({ node: n, distance: 1})).
            filter(n => n.distance != null && n.node.id != 'variables'&& n.node.id != 'setvariable').
            sortBy(n => n.distance).
            map(n => n.node).toArray();

    }
    else{
        return allChildren.
            map(n => ({ node: n, distance: 1})).
            filter(n => n.distance != null && n.node.id != 'setvariable').
            sortBy(n => n.distance).
            map(n => n.node).toArray();
    }
    
       
}