import { Map, Seq } from 'immutable';
import * as Immutable from 'immutable';
import MetaQueryable from '../../src/app/util/MetaQueryable';
import ContainerQueryable from '../../src/app/util/ContainerQueryable';

import { ContainerTypes, Container } from '../../src/app/types';
import { MetaContext } from '../../src/app/MetaContext';

import { NodeSchema, ContextBuilderSchema } from '../lib/testBuilder';

class ContainerQueryableSelector implements NodeSchema {
    private queryable: ContainerQueryable;
    private context: MetaContext;
    private filterIndex: number;

    constructor(context: MetaContext, queryable: ContainerQueryable, filterIndex?: number) {
        this.context = context;
        this.queryable = queryable;
        this.filterIndex = filterIndex;
    }

    static fromState(context: MetaContext, state: Map<number, Container>): ContainerQueryableSelector {
        return new ContainerQueryableSelector(context, new ContainerQueryable(state, Seq.of(<any>{ key: -1 })));
    }

    target(): number {
        var first = this.queryable.first();
        
        return first && first.key;
    }

    node(id: string, other?: any, childSchema?: ContextBuilderSchema): ContainerQueryableSelector {
        //if (childSchema) throw new Error("QueryableSelector doesn't support childSchema");

        var filterer = this.filterIndex == null ? node => node.id === id : (node, index) => index === this.filterIndex && node.id === id;
        var matchedNodes = this.queryable.children().filter(filterer);

        if (other) {
            if (other.type != null) {
                other.type = Seq(this.context.typing).filter(t => t.type.type == other.type).first().type;
            }
            
            var context = this.context;
            
            var otherSchema = Map<string, any>(other);
            matchedNodes = matchedNodes.filter(node => otherSchema.every((value, key) => {
                var collection = Immutable.fromJS(value);
                var contextNode = context.nodes.get(node.meta);
                
                if (collection !== value) {
                    return collection.equals(Immutable.fromJS(contextNode.get(key))) || collection.equals(Immutable.fromJS(node.get(key)));
                } else {
                    return Immutable.is(contextNode.get(key), value) || Immutable.is(node.get(key), value);
                }
            }));
        }

        return new ContainerQueryableSelector(this.context, matchedNodes);
    }
    
    child(index: number): ContainerQueryableSelector {
        var matchedNodes = this.queryable.children().filter((node, nodeIndex) => nodeIndex === index);
        return new ContainerQueryableSelector(this.context, matchedNodes);
    }

    input(id: string, other?: any, childSchema?: ContextBuilderSchema): ContainerQueryableSelector {
        return this.node(id, Object.assign({ containerType: ContainerTypes.INPUT }, other), childSchema);
    }

    command(id: string, other?: any, childSchema?: ContextBuilderSchema): ContainerQueryableSelector {
        return this.node(id, Object.assign({ containerType: ContainerTypes.COMMAND }, other), childSchema);
    }

    parameter(id: string, type: string, other?: any, childSchema?: ContextBuilderSchema): ContainerQueryableSelector {
        return this.node(id, Object.assign({ type, containerType: ContainerTypes.PARAMETER }, other), childSchema);
    }

    value(id: string, type: string, other?: any, childSchema?: ContextBuilderSchema): ContainerQueryableSelector {
        return this.node(id, Object.assign({ type, containerType: ContainerTypes.VALUE }, other), childSchema);
    }
}

export default ContainerQueryableSelector;
