import { Map, OrderedMap, Seq,  SetIterable, Iterable, Record, List } from 'immutable';
import * as Immutable from 'immutable';
import { MetaNode, MetaType, ContainerTypes,  } from './types';
import MetaQueryable from './util/MetaQueryable';
import { makeMap } from './util/collections';

export const CommonTypes = {
    COMMAND: new MetaType({ type: 'command' }),
    TEXT: new MetaType({ type: 'text' }),
    CONTAINER: new MetaType({ type: 'container' })
};

const defaultMetaContext: MetaContextProps = {
    nodes: OrderedMap<number, MetaNode>(),
    contextKeys: { global: -1, triggerCommand: -1, type: -1, variables: -1 },
    typing: List<MetaTypeInfo>(),
    loadingNodes: List<number>()
}
    
export class MetaContext extends Record<MetaContextProps>(defaultMetaContext, 'MetaContext') implements MetaContextProps {
    nodes: OrderedMap<number, MetaNode>;
    contextKeys: MetaContextKeys;
    typing: List<MetaTypeInfo>;
    loadingNodes: List<number>;
}
    
interface MetaContextProps {
    nodes: OrderedMap<number, MetaNode>;
    contextKeys: MetaContextKeys;
    typing: List<MetaTypeInfo>;
    loadingNodes: List<number>;
}

export interface MetaContextKeys {
    global: number;
    type: number;
    triggerCommand: number;
    variables: number;
}

var nodeMatchesType = (type: MetaType, node: MetaNode) => {
    if (type.equals(CommonTypes.COMMAND)) {
        return node.containerType === ContainerTypes.COMMAND;
    } else if (type.equals(CommonTypes.CONTAINER)) {
        return node.containerType === ContainerTypes.VALUE;
    } else {
        var mightEventuallyMatch = node.async != null && Seq(node.async.types).some(asyncType => type.equals(asyncType));
        var typesMatch = node.containerType === ContainerTypes.VALUE && node.type == type;
        return mightEventuallyMatch || typesMatch;
    }
};

/*
export var setupLinkedTypes = (context: MetaContext): MetaContext => {

    var GetDistinctCurrentNode =(typeInfo : MetaTypeInfo) => {
       return [...new Set(typeInfo.matches.map(x => x.currentNode).toArray())];
    }     
  
   var matches=context.typing.filter(a =>a.type.type !='container')
   .flatMap(x => GetDistinctCurrentNode(x).map(y => ({ targetType: x.type.type, targetTags:  x.type.tags, currentNode: y })))
   .toArray();
   var allMatches : {targetType:string; targetTags:Map<string,any>; currentNode:number;}[];
  
    allMatches = Object.assign(matches);
  /*
    var allMatches = context.typing.filter(a => a.type.type != 'container')
    .flatMap(x => GetDistinctCurrentNode(x)
    .map(y => ({ targetType: x.type.type, targetTags:  x.type.tags as Map<string, any>, currentNode: y })));


    var typingMetaNotNull = context.typing.filter(x => x.meta >0);

    var typing = context.typing.map(typeInfo => Object.assign({}, typeInfo, {
        linkedTypes: typingMetaNotNull.
            filter(otherType => typeInfo.type != otherType.type
            && allMatches.findIndex(n => n.currentNode == otherType.meta && n.targetType == typeInfo.type.type
            && n.targetTags === typeInfo.type.tags) > -1
            ).
            map(t => t.type).toArray()
    }));

    return context.set('typing', typing);  
}*/

  export var setupLinkedTypes = (context: MetaContext): MetaContext => {
   var allMatches = context.typing
    .filter(a => a.type.type != 'container')
    .flatMap(typeInfo => typeInfo.matches.map(x => x.currentNode).map(y => ({
        targetType: typeInfo.type.type as string,
        targetTags:  typeInfo.type.tags as Map<string, any>,
        currentNode: y as number
    }))).groupBy(match => match.currentNode).toMap();

    var typing = context.typing.map(typeInfo => Object.assign({}, typeInfo, {
        linkedTypes: context.typing.filter(otherType => otherType.meta > 0
                && typeInfo.type != otherType.type
                && allMatches.get(otherType.meta)
                && allMatches.get(otherType.meta).some(n => n.targetType == typeInfo.type.type && n.targetTags === typeInfo.type.tags) 
            ).map(t => t.type).toArray()
    }));

    return context.set('typing', typing);      
}

export var setupLinkedNodes = (context: MetaContext): MetaContext => {
    var typing = context.typing.map(type => Object.assign({}, type, { distanceForLinkedNodes: getLinkedTypes(context, type.type, 0) }));
    return context.set('typing', typing);   
}

var getTypeInfo = (context: MetaContext, type: MetaType) => {   
    return context.typing.filter(t => t.type.equals(type)).first();
}

var getLinkedTypes = (context: MetaContext, type: MetaType, depth: number, matchDistances = Map<number, number>()): Map<number, number> => {
    var typeInfo = getTypeInfo(context, type);
    
    matchDistances = typeInfo.matches.reduce((matchDistances, match) => setDistance(matchDistances, match.currentNode, match.distance + depth * 5), matchDistances);
    
    if (depth !== 2) {
        matchDistances = Seq(typeInfo.linkedTypes).reduce((matchDistances, linkedType) => getLinkedTypes(context, linkedType, depth + 1, matchDistances), matchDistances);
    }
    
    return matchDistances;
}

var setDistance = (matchDistances: Map<number, number>, node: number, distance: number): Map<number, number> => {
    return matchDistances.get(node) == null || matchDistances.get(node) > distance ? matchDistances.set(node, distance) : matchDistances;
}

export var getDirectChildren = (nodes: OrderedMap<number, MetaNode>, node: MetaNode): MetaNode[] => {
    return nodes.filter(n => n.parent === node.key).toArray();
};

export var getChildrenDeep = (nodes: OrderedMap<number, MetaNode>, node: MetaNode): SetIterable<number> => {
    return Seq(getDirectChildren(nodes, node)).flatMap(child => Seq.of(child.key).concat(getChildrenDeep(nodes, child)));
};

export var updateContext = (context: MetaContext, node: MetaNode): MetaContext => context.setIn(['nodes', node.key], node);

export var removeNode = (context: MetaContext, node: MetaNode): MetaContext => context.removeIn(['nodes', node.key]);

export var nextKey = (context: MetaContext) => context.nodes.max((a, b) => a.key - b.key).key + 1;

export var cloneNode = (context: MetaContext, node: MetaNode, parent: number): { context: MetaContext, node: MetaNode } => {
    var newNode = node.set('key', nextKey(context)).set('parent', parent);
        
    context = updateContext(context, newNode);
    
    context = context.nodes.
        filter(n => n.parent == node.key).
        reduce((context, child) => context = cloneNode(context, child, newNode.key).context, context);
    
    return {
        context,
        node: newNode
    }
}

export interface TypeMatchEntry {
    matchingNode: number;
    currentNode: number;
    distance: number;
    asyncMatch: boolean;
}

export interface MetaTypeInfo {
    type: MetaType;
    /**
     * The nodes that eventually match this type, and how many different ways it matches, so matches can be removed
    */
    matches: List<TypeMatchEntry>;
    
    /**
     * Other types that lead to this type
    **/
    linkedTypes: MetaType[];
    
    /**
     * All nodes that eventually lead to this type, even through other types
    **/
    distanceForLinkedNodes: Map<number, number>;
    
    /**
     * The type meta node in the context
    **/
    meta?: number;
}