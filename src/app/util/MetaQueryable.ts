import { Map, Iterable, Seq } from 'immutable';
import { Container, MetaNode, ContainerTypes } from '../types';
import { MetaContext } from '../MetaContext';

class MetaQueryable {
    context: MetaContext;
    nodes: Iterable<number, MetaNode>;

    constructor(context: MetaContext, nodes: Iterable<number, MetaNode>) {
        this.context = context;
        this.nodes = nodes;
    }

    static fromContext(context: MetaContext): MetaQueryable {
        return new MetaQueryable(context, context.nodes);
    }

    changeContext(context: MetaContext): MetaQueryable {
        return new MetaQueryable(context, this.nodes);
    }

    parent(): MetaQueryable {
        var results = this.nodes.map(n => this.context.nodes.get(n.parent));
        return new MetaQueryable(this.context, results);
    }

    children(): MetaQueryable {
        var results = this.nodes.flatMap(n => this.context.nodes.filter(c => c.parent === n.key).valueSeq());
        return new MetaQueryable(this.context, results);
    }

    withId(id: string): MetaQueryable {
        const results = this.nodes.filter(n => n.id === id).valueSeq();
        return new MetaQueryable(this.context, results);
    }

    toArray(): MetaNode[] {
        return this.nodes.toArray();
    }

    single(): MetaQueryable {
        return new MetaQueryable(this.context, this.nodes.take(1));
    }

    first(): MetaNode {
        return this.nodes.first();
    }

    filter(filterer: ((node: MetaNode) => boolean)): MetaQueryable {
        return new MetaQueryable(this.context, this.nodes.filter(filterer).valueSeq());
    }
}

export default MetaQueryable;
