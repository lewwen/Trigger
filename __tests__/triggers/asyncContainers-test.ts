import { addCommand, addContainer, changeId, extendContainer, deleteContainer } from '../../src/app/actions/CommandActions';

import { buildContext, runActions } from '../lib/testBuilder';
import { textCommand, containerWithAsyncChildOfType, textValue } from '../lib/testSchema';
import SchemaChecker from '../lib/SchemaChecker';

describe('async containers', () => {
    //simple
    /*** zzzz
    it('drill down to the loading placeholder while container is loading', () => {
        var containerId1 = 'async1';
        var context = buildContext(textCommand, containerWithAsyncChildOfType('text', containerId1));

        var result = runActions([], context);

        
        //get the container below async1
        //make sure it is the loading placeholder
    });
    
    it('change a loading container to another loading container', () => {
        var containerId1 = 'async1';
        var containerId2 = 'async2';
        var context = buildContext(textCommand, containerWithAsyncChildOfType('text', containerId1), containerWithAsyncChildOfType('text', containerId2));

        var result = runActions([
            (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node(containerId1).target(), containerId2)
        ], context);

        new SchemaChecker(result).
            navigate(path => path.node('textCommand').node('params').node('textParam')).
            check(containerWithAsyncChildOfType('text', containerId2));
            
        //get the container below async2
        //make sure it is the loading placeholder
    });
    
    it('change a loading container to a non async container', () => {
        var containerId1 = 'async1';
        var context = buildContext(textCommand, containerWithAsyncChildOfType('text', containerId1), textValue);

        var result = runActions([
            (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node(containerId1).target(), 'text01')
        ], context);

        new SchemaChecker(result).
            navigate(path => path.node('textCommand').node('params').node('textParam')).
            check(textValue);
    });
    */
});