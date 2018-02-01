import { Map } from 'immutable';

import MetaQueryableSelector from './lib/MetaQueryableSelector';
import ContainerQueryableSelector from './lib/ContainerQueryableSelector';

import { buildContext } from './lib/testBuilder';
import { textCommand, textValue, triggerCommand } from './lib/testSchema';
import { Container } from '../src/app/types';

describe('QueryableSelector', () => {
    describe('meta queries', () => {
        it('should find meta nodes', () => {
            var context = buildContext(textValue, triggerCommand);

            var queryable = MetaQueryableSelector.fromMeta(context);

            var nodeKey = context.nodes.filter(c => c.id === "text01").first().key;

            expect(queryable.node('text01').target()).toEqual(nodeKey);
        });

        it('should find deep meta nodes', () => {
            var context = buildContext(textCommand, textValue);

            var queryable = MetaQueryableSelector.fromMeta(context);

            var nodeKey = context.nodes.filter(c => c.id === 'textParam').first().key;

            expect(queryable.node('textCommand').node('params').parameter('textParam').target()).toEqual(nodeKey)
        });
    });

    describe('container queries', () => {
        var state = Map([
            [0, { key: 0, parent: -1, id: 'root' } as Container],
            [1, { key: 1, parent: 0, id: 'params' } as Container],
            [2, { key: 2, parent: 1, id: 'commands' } as Container],
            [3, { key: 3, parent: 2, id: 'textCommand' } as Container]
        ]);

        var queryable = ContainerQueryableSelector.fromState(null, state);

        it('should find container nodes', () => {
            expect(queryable.node('root').target()).toEqual(0);
        });

        it('should find deep container nodes', () => {
            var nodeKey = state.filter(c => c.id === 'textCommand').first().key;

            expect(queryable.node('root').node('params').node('commands').node('textCommand').target()).toEqual(3)
        });
    });
});
