import { Container } from '../../src/app/types';
import ContainerQueryable from '../../src/app/util/ContainerQueryable';
import ContainerQueryableSelector from './ContainerQueryableSelector';
import { SchemaBuilder } from './testBuilder';
import { TriggerState } from '../../src/app/TriggerState';
import { Map, Seq } from 'immutable';

class SchemaChecker {
    private state: TriggerState;
    private queryable: ContainerQueryable;

    constructor(state: TriggerState, queryable?: ContainerQueryable) {
        this.state = state;

        this.queryable = queryable || new ContainerQueryable(state.containers, Seq.of(<Container>{ key: -1 }));
    }

    check(path: SchemaBuilder): SchemaChecker {
        return this.checkAt(0, path);
    }

    checkAt(index: number, path: SchemaBuilder): SchemaChecker {
        var selector = new ContainerQueryableSelector(this.state.context, this.queryable, index);

        var result = path(selector);

        expect(result.target()).not.toBeNull();
        expect(result.target()).not.toBeUndefined();

        return this;
    }

    navigate(path: SchemaBuilder): SchemaChecker {
        var selector = new ContainerQueryableSelector(this.state.context, this.queryable);

        var result = path(selector);

        var targetKey = result.target();

        expect(targetKey).not.toBeNull();
        expect(targetKey).not.toBeUndefined();

        var targetContainer = this.state.containers.get(targetKey);

        return new SchemaChecker(this.state, new ContainerQueryable(this.state.containers, Seq.of(targetContainer)));
    }

    noChildren(): SchemaChecker {
        expect(this.queryable.children().toArray().length).toEqual(0);

        return this;
    }

    currentSelection(): Container[] {
        return this.queryable.toArray();
    }
}

export default SchemaChecker;
