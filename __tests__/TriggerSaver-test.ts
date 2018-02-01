import { Map } from 'immutable';
import { Container, TriggerDefinitionNode } from '../src/app/types';
import saveTrigger from '../src/app/util/TriggerSaver';

describe('TriggerSaver', () => {
    describe('saving', () => {
        it('should save', () => {
            var state = Map([
                [0, { key: 0, parent: -1, id: 'root' } as Container],
                [1, { key: 1, parent: 0, id: 'params' } as Container],
                [2, { key: 2, parent: 1, id: 'commands' } as Container],
                [3, { key: 3, parent: 2, id: 'textCommand' } as Container]
            ]);

            
    
            var savedTrigger = saveTrigger(state);

            var expectedResult: TriggerDefinitionNode = {
                id: 'root',
                children: [{
                    id: 'params',
                    children: [{
                        id: 'commands',
                        children: [{
                            id: 'textCommand',
                            children: []
                        }]
                    }]
                }]
            }

            expect(savedTrigger).toEqual(expectedResult);
        });
    
        it('should follow sequence correctly', () => {
            var state = Map([
                [0, { key: 0, parent: -1, id: 'root' } as Container],
                [1, { key: 1, parent: 0, id: 'node1', sequence: 1 } as Container],
                [2, { key: 2, parent: 0, id: 'node2', sequence: 0 } as Container]
            ]);
    
            var savedTrigger = saveTrigger(state);

            var expectedResult: TriggerDefinitionNode = {
                id: 'root',
                children: [{
                    id: 'node2', children: []
                }, {
                    id: 'node1', children: []
                }]
            }

            expect(savedTrigger).toEqual(expectedResult);
        });
    });
});
