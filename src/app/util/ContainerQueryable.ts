import { Map, Seq, Iterable } from 'immutable';
import { Container, ContainerTypes } from '../types';

class ContainerQueryable {
    containers: Map<number, Container>;
    nodes: Iterable<number, Container>;

    constructor(containers: Map<number, Container>, nodes: Iterable<number, Container>) {
        this.containers = containers;
        this.nodes = nodes;
    }

    children(): ContainerQueryable {
        var results = this.nodes.flatMap(n => this.containers.filter(c => c.parent === n.key).valueSeq());
        return new ContainerQueryable(this.containers, results);
    }

    parent(): ContainerQueryable {
        return new ContainerQueryable(this.containers, this.nodes.map(n => this.containers.get(n.parent)));
    }

    final(): Container {
        var lastChild = this.first();

        if (!lastChild) {
            return null;
        }

        var nextChild: Container;

        while ((nextChild = Seq(new ContainerQueryable(this.containers, Seq.of(lastChild)).children().toArray()).last()) != null) {
            lastChild = nextChild;
        }

        return lastChild;
    }

    withKey(key: number): ContainerQueryable {
        const results = this.nodes.filter(n => n.key === key).valueSeq();
        return new ContainerQueryable(this.containers, results);
    }

    withId(id: string): ContainerQueryable {
        const results = this.nodes.filter(n => n.id === id).valueSeq();
        return new ContainerQueryable(this.containers, results);
    }

    toArray(): Container[] {
        return this.nodes.toArray();
    }

    single(): ContainerQueryable {
        return new ContainerQueryable(this.containers, this.nodes.take(1));
    }

    first(): Container {
        return this.nodes.first();
    }

    filter(filterer: (node: Container, index: number) => boolean): ContainerQueryable {
        return new ContainerQueryable(this.containers, this.nodes.filter(filterer));
    }
    
    isChildOf(container: number): boolean {
        var next = <ContainerQueryable>this;
        var parent: Container = this.first();
        
        while (parent) {
            if (parent.key === container) {
                return true;
            }
            
            next = next.parent();
            parent = next.first();
        }
        
        return false;
    }
}

export default ContainerQueryable;
