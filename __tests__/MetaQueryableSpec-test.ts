import { Seq } from 'immutable';
import MetaQueryable from '../src/app/util/MetaQueryable';
import { MetaNode } from '../src/app/types';
import { SimpleContextNode, createMetaContext } from '../src/app/util/convertContext';
import { MetaContext } from '../src/app/MetaContext';

var contextNodes: SimpleContextNode = {
    id: 'root',
    children: [{
        id: 'types',
        children: [{
            id: 'text'
        }, {
            id: 'number',
            children: [{
                id: 'tostring'
            }]
        }]
    }, {
        id: 'global',
        children: [{
            id: 'container',
            children: [{
                id: 'num1'
            }, {
                id: 'num2'
            }, {
                id: 'text1'
            }]
        }, {
            id: 'computed'
        }, {
            id: 'variables'
        }]
    }]
};

//var context = createMetaContext(contextNodes);

var root = new MetaNode().
        set('key', 0).
        set('id', 'root').
        set('text', 'Root');
    
var context = new MetaContext().setIn(['nodes', root.key], root);

describe('MetaQueryable', () => {
    describe('toArray', () => {
        it('should return all results as an array', () => {
            const nodes = [new MetaNode().set("id", "")];

            const query = new MetaQueryable(context, Seq(nodes));

            expect(query.toArray()).toEqual(nodes);
        });
    });

    describe('first', () => {
        it('should return the first result', () => {
            const node = new MetaNode();

            const query = new MetaQueryable(context, Seq.of(node));

            expect(query.first()).toEqual(node);
        });
    });

    describe('withKey', () => {
        it('should filter the context to a given key', () => {
            const results = MetaQueryable.fromContext(context).filter(n => n.key === 0).toArray();

            expect(results.length).toBeGreaterThan(0);

            results.forEach(result => {
                expect(result.key).toEqual(0);
            });
        });
    });

    describe('withId', () => {
        it('should filter the context to a given id', () => {
            const results = MetaQueryable.fromContext(context).withId("root").toArray();

            expect(results.length).toBeGreaterThan(0);

            results.forEach(result => {
                expect(result.id).toEqual('root');
            });
        });
    });
/*
    describe('children', () => {
        it('should return the children of each node in the results', () => {
            expect(MetaQueryable.fromContext(context).filter(n => n.key === 6).children().toArray().length).toEqual(3);
        });
    });
*/
});
