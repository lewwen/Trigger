import { Map } from 'immutable';
import { Container, MetaNode, ContainerTypes } from '../../src/app/types';
import { TriggerState } from '../../src/app/TriggerState';
import { MetaContext } from '../../src/app/MetaContext';
import { SimpleContextNode, createMetaContext } from '../../src/app/util/convertContext';
import { addCommand } from '../../src/app/actions/CommandActions';

import storeCreator from '../../src/app/store/configureStore';

import MetaQueryable from '../../src/app/util/MetaQueryable';
import ContainerQueryable from '../../src/app/util/ContainerQueryable';

import MetaQueryableSelector from './MetaQueryableSelector';
import ContainerQueryableSelector from './ContainerQueryableSelector';

export interface NodeSchema {
    node(id: string, other?: {}, childSchema?: SchemaBuilderNoReturn): NodeSchema;
    input(id: string, other?: {}, childSchema?: SchemaBuilderNoReturn): NodeSchema;
    command(id: string, other?: {}, childSchema?: SchemaBuilderNoReturn): NodeSchema;
    parameter(id: string, type: string, other?: {}, childSchema?: SchemaBuilderNoReturn): NodeSchema;
    value(id: string, type: string, other?: {}, childSchema?: SchemaBuilderNoReturn): NodeSchema;
    target(): number;
}

export declare type SchemaBuilder = (schema: NodeSchema) => NodeSchema;
declare type SchemaBuilderNoReturn = (schema: NodeSchema) => void;

export declare type ContextBuilderSchema = (schema: ContextBuilder) => void;

class ContextBuilder implements NodeSchema {
    root: SimpleContextNode;

    constructor(root: SimpleContextNode) {
        this.root = root;
    }

    target(): number {
        return -1;
    }

    node(id: string, other = {}, childSchema?: ContextBuilderSchema): ContextBuilder {
        var newChild = <SimpleContextNode>Object.assign({}, other, { id, text: id});

        if (!this.root.children) {
            this.root.children = [];
        }
        
        this.root.children.push(newChild);

        var newContext = new ContextBuilder(newChild);

        if (childSchema) {
            childSchema(newContext);
        }

        return newContext;
    }

    input(id: string, other = {}, childSchema?: ContextBuilderSchema): ContextBuilder {
        return this.node(id, Object.assign({ containerType: ContainerTypes.INPUT }, other), childSchema);
    }

    command(id: string, other = {}, childSchema?: ContextBuilderSchema): ContextBuilder {
        return this.node(id, Object.assign({ containerType: ContainerTypes.COMMAND }, other), childSchema);
    }

    parameter(id: string, type: string, other = {}, childSchema?: ContextBuilderSchema): ContextBuilder {
        return this.node(id, Object.assign({ type, containerType: ContainerTypes.PARAMETER }, other), childSchema);
    }

    value(id: string, type: string, other = {}, childSchema?: ContextBuilderSchema): ContextBuilder {
        return this.node(id, Object.assign({ type, containerType: ContainerTypes.VALUE }, other), childSchema);
    }
}

export function buildContext(defaultCommand: SchemaBuilder, ...schemas: SchemaBuilder[]): MetaContext {
    return buildContextWithTypes(defaultCommand, { globals: schemas, types: [] });
}

export function buildContextWithTypes(defaultCommand: SchemaBuilder, schemas: { types: SchemaBuilder[], globals: SchemaBuilder[] }): MetaContext {
    var root = new ContextBuilder({ id: 'root' , text:"test"});

    var globalKey = root.node('global', {}, child => {
        defaultCommand(child);

        schemas.globals.forEach(schema => {
            schema(child);
        });
    }).target();

    var typeKey = root.node('types', {}, child => {
        schemas.types.forEach(schema => {
            schema(child);
        });
    }).target();
    var context = createMetaContext(root.root);    

    context.contextKeys.triggerCommand = context.nodes.filter(n => n.containerType === ContainerTypes.COMMAND).first().key;
    
    return context;
}

export function runActions(actionCreators: ((meta: MetaQueryableSelector, state: ContainerQueryableSelector) => {})[], context: MetaContext): TriggerState {
    var store = storeCreator(context);
    
    store.dispatch(addCommand(-1, context.contextKeys.triggerCommand));

    actionCreators.forEach(actionCreator => {
        var triggerState = store.getState();
        var metaQuery = MetaQueryableSelector.fromMeta(context);
        var stateQuery = ContainerQueryableSelector.fromState(context, triggerState.containers);
        var action = actionCreator(metaQuery, stateQuery);

        store.dispatch(action);
    });

    return store.getState();
}