import { Map, Seq, OrderedMap, List, Iterable } from 'immutable';
import { MetaNode, MetaType, ContainerTypes } from '../types';
import { MetaContext, MetaContextKeys, setupLinkedNodes, setupLinkedTypes, CommonTypes, TypeMatchEntry, MetaTypeInfo } from '../MetaContext';

export interface SimpleMetaType {
    type?: string;
    tags?: { [id: string]: any };
}

export interface SimpleContextNode {
    id?: string;
    text?: string;
    type?: string;
    tags?: { [id: string]: any };
    flags?: string[];
    containerType?: ContainerTypes;
    children?: SimpleContextNode[];
    variable?: { name: string, value: string };
    subscriptions?: any[];
    async?: { retrievalParams: { [id: string]: any; }, types: SimpleMetaType[] };
}

export var createMetaContext = (simpleContext: SimpleContextNode): MetaContext => {
    var root = new MetaNode().
        set('key', 0).
        set('id', 'root').
        set('text', 'Root');
    
    var context = new MetaContext().setIn(['nodes', root.key], root);
    context = addNodeForNewContext(context, root, simpleContext.children);
    
    var contextKeys = Object.assign({}, context.contextKeys, {
        global: context.nodes.filter(n => n.parent === 0 && n.id === 'global').first().key,
        type: context.nodes.filter(n => n.parent === 0 && n.id === 'types').first().key,
        variables: 0,
        triggerCommand: context.nodes.filter(n => n.containerType === ContainerTypes.COMMAND).first().key
    });

if (context.nodes.filter(n => n.parent === contextKeys.global && n.id === 'variables').count() >0){
    contextKeys.variables = context.nodes.filter(n => n.parent === contextKeys.global && n.id === 'variables').first().key;}

    context = context.set('contextKeys', contextKeys);
    
    return setupLinkedNodes(setupLinkedTypes(context));
}

export var importSimpleMetaNode = (context: MetaContext, parent: MetaNode, node: SimpleContextNode): MetaContext => {
    return addNodeForNewContext(context, parent, [node]);
}

export var addMetaNodeTyping = (context: MetaContext, metas: Iterable<number, MetaNode>, type: MetaType, parent: MetaNode): MetaContext => {
    var values = metas.filter(meta => meta.containerType === ContainerTypes.VALUE);
    var commands = metas.filter(meta => meta.containerType === ContainerTypes.COMMAND);
    
    if (!values.isEmpty()) {
        context = addTypeInfoForMeta(context, values, parent, CommonTypes.CONTAINER);
        context = addTypeInfoForMeta(context, values, parent, type);
    }
    
    if (!commands.isEmpty()) {
        context = addTypeInfoForMeta(context, commands, parent, CommonTypes.COMMAND);
    }
    
    return metas.
        filter(meta => meta.async != null).
        flatMap(meta => Seq(meta.async.types).map(type => ({ meta, type })))
        .reduce((context, x) => addTypeInfoForMeta(context, Seq.of(x.meta), parent, x.type, true /* asyncMatch */), context);
}

var calculateNodeType = (type: SimpleMetaType): MetaType => {
    return new MetaType({ type: type.type, tags: Map(type.tags) });
}

var addTypeInfoForMeta = (context: MetaContext, entries: Iterable<number, MetaNode>, parent: MetaNode, nodeType: MetaType, asyncMatch = false) => {
    var type = context.typing.filter(t => t.type.equals(nodeType)).first();
    var index = -1;
    
    if (type == null) {
        type = { type: nodeType, linkedTypes: [], matches: List<TypeMatchEntry>(), distanceForLinkedNodes: Map<number, number>() };
        index = context.typing.count();
        context = updateType(context, index, type);
    } else {
        index = context.typing.indexOf(type);
    }
    
    let distance = parent.containerType == ContainerTypes.COMMAND ? 2 : asyncMatch ? 1 : 0;
    let newMatches = entries.map(meta => ({ matchingNode: meta.key, currentNode: meta.key, distance, asyncMatch }));
    type = Object.assign({}, type, { matches: type.matches.concat(newMatches).toList() });
    
    context = updateType(context, index, type);
    
    let [current, currentParent] = [parent, context.nodes.get(parent.parent)];
    
    while (currentParent != null) {
        let newMatches = entries.map(meta => ({ matchingNode: meta.key, currentNode: current.key, distance, asyncMatch }));
        type = Object.assign({}, type, { matches: type.matches.concat(newMatches).toList() });
        context = updateType(context, index, type);
        
        [current, currentParent] = [currentParent, context.nodes.get(currentParent.parent)];
        
        if (current.containerType != ContainerTypes.INPUT) {
            distance += 1;
        }
    }
    
    if (!asyncMatch && !nodeType.equals(CommonTypes.CONTAINER) && parent.id === 'types' && !entries.isEmpty()) {
        type = Object.assign({}, type, { meta: entries.first().key });
        context = updateType(context, index, type);
    }
    
    return context;
}

var updateType = (context: MetaContext, index: number, type: MetaTypeInfo): MetaContext => {
    return context.setIn(['typing', index], type);
}

var addNodeForNewContext = (context: MetaContext, parent: MetaNode, nodes: SimpleContextNode[]): MetaContext => {
    var metas: { node: SimpleContextNode, meta: MetaNode}[] = [];
    
    for (let node of nodes) {
        let meta = getMetaForNode(context, parent, node);
        metas.push({ node, meta });
        context = context.setIn(['nodes', meta.key], meta);
    }
    
    context = Seq(metas).
        map(m => m.meta).
        groupBy(meta => meta.type).
        reduce((context, entries, type) => addMetaNodeTyping(context, entries, type, parent), context);
        
    return Seq(metas).
        filter(m => m.node.children != null).
        reduce((context, m) => addNodeForNewContext(context, m.meta, m.node.children), context);
}

var getMetaForNode = (context: MetaContext, parent: MetaNode, node: SimpleContextNode): MetaNode => {
    var nodeType = calculateNodeType(node);
    
    var meta = new MetaNode({ key: context.nodes.count(), parent: parent.key, type: nodeType });
    
    if (node.id != null) {
        meta = meta.set('id', node.id);
    }
    
    if (node.text != null) {
        meta = meta.set('text', node.text);
    }
    meta
    if (node.containerType != null) {
        meta = meta.set('containerType', node.containerType);
    }
    
    if (node.flags != null) {
        meta = meta.set('flags', node.flags);
    }
    
    if (node.subscriptions != null) {
        meta = meta.set('subscriptions', node.subscriptions);
    }
    
    if (node.variable != null) {
        meta = meta.set('variable', node.variable);
    }
    
    if (node.async != null) {
        var async = {
            retrievalParams: node.async.retrievalParams,
            types: node.async.types.map(t => calculateNodeType(t))
        };
        
        meta = meta.set('async', async);
    }
    
    return meta;
}

export var removeAsyncTypes = (context: MetaContext, node: MetaNode): MetaContext => {
    context = context.removeIn(['nodes', node.key, 'async']);
    
    context = context.set('typing', context.typing.map(n => Object.assign({}, n, { matches: n.matches.filterNot(m => m.matchingNode === node.key && m.asyncMatch).toList() })).toList());
    
    return context;
}

export var removeMetaNode = (context: MetaContext, node: MetaNode): MetaContext => {
    return removeMetaNodeTyping(context.removeIn(['nodes', node.key]), node);
}

export var removeMetaNodeTyping = (context: MetaContext, node: MetaNode): MetaContext => {
    return context.set('typing', context.typing.map(n => Object.assign({}, n, { matches: n.matches.filterNot(m => m.matchingNode === node.key).toList() })).toList());
}

export var rebuildTypeCache = (context: MetaContext): MetaContext => {
    return setupLinkedNodes(setupLinkedTypes(context));
}