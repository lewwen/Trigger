import { Map, Seq } from 'immutable';
import MetaQueryable from '../../src/app/util/MetaQueryable';
import ContainerQueryable from '../../src/app/util/ContainerQueryable';

import { ContainerTypes, Container } from '../../src/app/types';
import { MetaContext } from '../../src/app/MetaContext';

import { NodeSchema, ContextBuilderSchema } from '../lib/testBuilder';

class MetaQueryableSelector implements NodeSchema {
    private queryable: MetaQueryable;

    constructor(queryable: MetaQueryable) {
        this.queryable = queryable;
    }

    static fromMeta(context: MetaContext): MetaQueryableSelector {
        return new MetaQueryableSelector(new MetaQueryable(context, Seq.of(context.nodes.get(context.contextKeys.global))));
    }

    target(): number {
        var first = this.queryable.first();

        return first && first.key;
    }

    node(id: string, other?: any, childSchema?: ContextBuilderSchema): MetaQueryableSelector {
        if (childSchema) throw new Error("QueryableSelector doesn't support childSchema");

        var matchedNodes = this.queryable.children().filter(node => node.id === id && (!other || Map<string, any>(other).every((value, key) => node.get(key) == value)));
        return new MetaQueryableSelector(matchedNodes);
    }

    private nodeWithType(id: string, other: any, childSchema: ContextBuilderSchema, type: ContainerTypes): MetaQueryableSelector {
        return this.node(id, Object.assign({ containerType: type }, other), childSchema);
    }

    input(id: string, other?: any, childSchema?: ContextBuilderSchema): MetaQueryableSelector {
        return this.node(id, Object.assign({ containerType: ContainerTypes.INPUT }, other), childSchema);
    }

    command(id: string, other?: any, childSchema?: ContextBuilderSchema): MetaQueryableSelector {
        return this.node(id, Object.assign({ containerType: ContainerTypes.COMMAND }, other), childSchema);
    }

    parameter(id: string, other?: any, childSchema?: ContextBuilderSchema): MetaQueryableSelector {
        return this.node(id, Object.assign({ containerType: ContainerTypes.PARAMETER }, other), childSchema);
    }

    value(id: string, type: string, other?: any, childSchema?: ContextBuilderSchema): MetaQueryableSelector {
        return this.node(id, Object.assign({ type, containerType: ContainerTypes.VALUE }, other), childSchema);
    }
}

export default MetaQueryableSelector;
