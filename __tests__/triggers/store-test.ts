import { Map, Iterable } from 'immutable';
import { Container, MetaNode, ContainerTypes } from '../../src/app/types';

import { addCommand, addContainer, changeId, extendContainer, deleteContainer } from '../../src/app/actions/CommandActions';

import SchemaChecker from '../lib/SchemaChecker';
import MetaQueryableSelector from '../lib/MetaQueryableSelector';
import ContainerQueryableSelector from '../lib/ContainerQueryableSelector';
import { buildContext, buildContextWithTypes, runActions, NodeSchema } from '../lib/testBuilder';
import { triggerCommand, textCommand, commandCollectionCommand, textCollectionCommand, setVariableCommand, textInput, textValue,
    textValue2, booleanValue, textToUpperCommand, textLengthCommand, toStringCommand, commandWithAnyTypeParam, comparisonCommand,
    commandThatAppliesTypeToContextNode, commandThatAppliesIDToTagOnContextNode, textValueCommand } from '../lib/testSchema';

describe('trigger store', () => {
    describe('init', () => {
        it('should load from a blank state with a value set', () => {
            var context = buildContext(textCommand, textValue);
console.log(context.toJS());
            var result = runActions([], context);
            console.log(result.toJS());
            expect(result.definitions.count()).toBeGreaterThan(0);
            new SchemaChecker(result).
                check(textCommand).
                navigate(path => path.node('textCommand').node('params').node('textParam')).
                check(textValue);
        });

        it('should load from a blank state with an input container', () => {
            var context = buildContext(textCommand, textInput("textinput"));

            var result = runActions([], context);

            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam')).
                check(textInput('textinput'));
        });
    });

    describe('addCommand', () => {
        it('should add commands to a command collection parameter', () => {
            var context = buildContext(commandCollectionCommand, textCommand, textValue);

            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target())
            ], context);

            new SchemaChecker(result).
                navigate(path => path.node('commandCollection').node('params').node('commands')).
                check(textCommand).
                navigate(path => path.node('textCommand').node('params').node('textParam')).
                check(textValue);
        });

        it('should add sibling meta to the available options', () => {
            var context = buildContext(commandCollectionCommand, textCommand, textValue, textValue2);

            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target())
            ], context);

            var siblingMeta = context.nodes.filter(node => node.id == 'text01' || node.id == "text02").map(node => node.key).toArray();

            new SchemaChecker(result).
                navigate(path => path.node('commandCollection').node('params').node('commands')).
                check(textCommand).
                navigate(path => path.node('textCommand').node('params').node('textParam')).
                check(schema => schema.node('text01', { siblingMeta }));
        });

        it('should set sequence correctly when adding multiple commands', () => {
            var context = buildContext(commandCollectionCommand, textCommand, textValue);

            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target()),
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('commandCollection').target())
            ], context);
            
            var commands = new SchemaChecker(result).navigate(path => path.node('commandCollection').node('params').node('commands'))
            
            commands.checkAt(0, schema => schema.node('textCommand', { sequence: 0 }));
            commands.checkAt(1, schema => schema.node('commandCollection', { sequence: 1 }));
        });

        it('should set sequence correctly when adding command before an existing command', () => {
            var context = buildContext(commandCollectionCommand, textCommand, textValue);

            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target()),
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('commandCollection').target()),
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target(), state.node('commandCollection').node('params').node('commands').node('commandCollection').target())
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('commandCollection').node('params').node('commands')).
                checkAt(1, schema => schema.node('commandCollection', { sequence: 2 }));
        });
    });

    describe('addContainer', () => {
        it('should add a container to a collection parameter', () => {
            var context = buildContext(textCollectionCommand, textValue);

            var result = runActions([
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target())
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCollection').node('params').node('texts')).
                check(textValue);
        });

        it('should add two containers to a collection parameter', () => {
            var context = buildContext(textCollectionCommand, textValue);

            var result = runActions([
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target()),
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target())
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCollection').node('params').node('texts')).
                checkAt(0, textValue).
                checkAt(1, textValue);
        });

        it('should set sequence correctly', () => {
            var context = buildContext(textCollectionCommand, textValue);

            var result = runActions([
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target()),
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target()),
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target())
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCollection').node('params').node('texts')).
                checkAt(0, schema => schema.node('text01', { sequence: 0 })).
                checkAt(1, schema => schema.node('text01', { sequence: 1 })).
                checkAt(2, schema => schema.node('text01', { sequence: 2 }));
        });
    });

    describe('deleteContainer', () => {
        it('should remove an added container', () => {
            var context = buildContext(textCollectionCommand, textValue);

            var result = runActions([
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target()),
                (meta, state) => deleteContainer(state.node('textCollection').node('params').node('texts').node('text01').target())
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCollection').node('params').node('texts')).
                noChildren();
        });

        it('should remove an added command', () => {
            var context = buildContext(commandCollectionCommand, textCommand, textValue);

            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target()),
                (meta, state) => deleteContainer(state.node('commandCollection').node('params').node('commands').node('textCommand').target())
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('commandCollection').node('params').node('commands')).
                noChildren();
        });
    });

    describe('changeId', () => {
        it('should change added container ID', () => {
            var context = buildContext(textCommand, textValue, textValue2);

            var result = runActions([
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('text01').target(), 'text02')
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam')).
                check(textValue2);

            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam').node('text02')).
                noChildren();
        });

        it('should change input container ID', () => {
            var context = buildContext(textCommand, textInput("textinput"));

            var result = runActions([
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('input').node('text').node('textinput').target(), 'newvalue')
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam')).
                check(textInput('newvalue'));
        });

        it('should change nested container ID', () => {
            var context = buildContext(textCommand, schema => schema.node('first', {}, children => {
                textValue(children);
                textValue2(children);
            }), schema => schema.node('second', {}, children => {
                textValue(children);
                textValue2(children);
            }));

            var result = runActions([
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('first').node('text01').target(), 'text02'),
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('first').node('text02').target(), 'text01'),
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('first').target(), 'second'),
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('second').node('text01').target(), 'text02'),
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam').node('second')).
                check(textValue2);

            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam').node('second').node('text02')).
                noChildren();
        });
    });
    
    describe('addCommand + changeId', () => {
        it('should add command properly when selecting a command as an option', () => {
            var context = buildContext(commandCollectionCommand, textValue, textValueCommand);

            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textValueCommand').target()),
                (meta, state) => changeId(state.node('commandCollection').node('params').node('commands').node('textValueCommand').node('params').node('textParam').node('text01').target(), 'textValueCommand')
            ], context);

            new SchemaChecker(result).
                navigate(path => path.node('commandCollection').node('params').node('commands').node('textValueCommand').node('params').node('textParam')).
                check(textValueCommand).
                navigate(path => path.node('textValueCommand').node('params').node('textParam')).
                check(textValue);
        });
    });

    describe('changeId + changeId', () => {
        it('should change a value and then change it back', () => {
            var context = buildContext(textCommand, textValue, textValue2);

            var result = runActions([
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('text01').target(), 'text02'),
                (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('text02').target(), 'text01')
            ], context);
            
            var siblingMeta = context.nodes.filter(node => node.id == 'text01' || node.id == "text02").map(node => node.key).toArray();

            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam')).
                check(textValue).
                check(schema => schema.node('text01', { siblingMeta }));

            new SchemaChecker(result).
                navigate(path => path.node('textCommand').node('params').node('textParam').node('text01')).
                noChildren();
        });
    });

    describe('computed tags on context nodes', () => {
        it('should be applied', () => {
            var receivedNodeID = 'taggedNode';
            var nodeReceivingType = (schema: NodeSchema) => schema.node(receivedNodeID);

            var result = runActions([], buildContext(commandThatAppliesTypeToContextNode(receivedNodeID), textValue, nodeReceivingType));

            var taggedNode = result.context.nodes.filter(n => n.id == receivedNodeID).first();
            var targetNode = result.context.nodes.filter(n => n.id == 'text01').first(); 
            
            expect(taggedNode.type.equals(targetNode.type)).toBeTruthy();
        });

        it('should change when the tag value changes', () => {
            var receivedNodeID = 'taggedNode';
            var nodeReceivingType = (schema: NodeSchema) => schema.node(receivedNodeID);

            var result = runActions([
                (meta, state) => changeId(state.node('commandThatAppliesTypeToContextNode').node('params').node('any').node('text01').target(), 'text02')
            ], buildContext(commandThatAppliesTypeToContextNode(receivedNodeID), textValue, textValue2, nodeReceivingType));

            var taggedNode = result.context.nodes.filter(n => n.id == receivedNodeID).first();
            var targetNode = result.context.nodes.filter(n => n.id == 'text02').first(); 
            
            expect(taggedNode.type.equals(targetNode.type)).toBeTruthy();
        });

        it('should receive tag values from input containers', () => {
            var receivedNodeID = 'taggedNode';
            var tag = 'tag01';
            var nodeReceivingType = (schema: NodeSchema) => schema.node(receivedNodeID);

            var context = buildContext(commandThatAppliesIDToTagOnContextNode(receivedNodeID, tag), textInput('initialValue'), nodeReceivingType);

            var result = runActions([], context);
            
            var taggedNode = result.context.nodes.filter(n => n.id == receivedNodeID).first();
            var targetNode = result.context.nodes.filter(n => n.id == 'initialValue').first(); 
            
            expect(taggedNode.type.tags.get('tag01')).toEqual('initialValue');
        });

        it('should update tag values from input containers', () => {
            var receivedNodeID = 'taggedNode';
            var tag = 'tag01';
            var nodeReceivingType = (schema: NodeSchema) => schema.node(receivedNodeID);

            var context = buildContext(commandThatAppliesIDToTagOnContextNode(receivedNodeID, tag), textInput('oldValue'), nodeReceivingType);

            var result = runActions([
                (meta, state) => changeId(state.node('commandThatAppliesIDToTagOnContextNode').node('params').node('any').node('input').node('text').node('oldValue').target(), 'newValue')
            ], context);
            
            var taggedNode = result.context.nodes.filter(n => n.id == receivedNodeID).first();
            var targetNode = result.context.nodes.filter(n => n.id == 'newValue').first(); 
            
            expect(taggedNode.type.tags.get('tag01')).toEqual('newValue');
        });

        it('display a tag attached container type\'s children', () => {
            var receivedNodeID = 'taggedNode';
            var tag = 'tag01';
            var nodeReceivingType = (schema: NodeSchema) => schema.value(receivedNodeID, 'blob', { tags: { 'tag01': 'default' } });
            
            var context = buildContextWithTypes(
                commandCollectionCommand, {
                globals: [textValue, nodeReceivingType, textCommand, commandThatAppliesIDToTagOnContextNode(receivedNodeID, tag)],
                types: [
                    (schema: NodeSchema) => schema.value('blob', 'blob', { tags: { 'tag01': 'default' } }).value('childNumber', 'number'),
                    (schema: NodeSchema) => schema.value('blob', 'blob', { tags: { 'tag01': 'text01' } }).value('childText', 'text')
                ]
            });
/*zzzzzzzzz
            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('commandThatAppliesIDToTagOnContextNode').target()),
                (meta, state) => changeId(state.node('commandCollection').node('params').node('commands').node('commandThatAppliesIDToTagOnContextNode').node('params').node('any').node('text01').target(), 'taggedNode'),
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target())
            ], context);
            
            var siblingMeta = context.nodes.filter(node => node.id == 'text01' || node.id == 'blob').map(node => node.key).toArray();

            new SchemaChecker(result).
                navigate(path => path.node('commandCollection').node('params').node('commands').node('textCommand').node('params').node('textParam')).
                check(schema => schema.value('text01', 'text', { siblingMeta }));
                */
        });
    });
    
    describe('addContainer + changeId', () => {
        it('should preserve order of container after changing ID', () => {
            var context = buildContext(textCollectionCommand, textValue, textValue2);

            var result = runActions([
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target()),
                (meta, state) => addContainer(state.node('textCollection').node('params').node('texts').target()),
                (meta, state) => changeId(state.node('textCollection').node('params').node('texts').child(1).target(), 'text02')
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('textCollection').node('params').node('texts')).
                checkAt(1, schema => schema.node('text02', { sequence: 1 }));
        });
    });
/*zzzzzzzzzz
    describe('computed tags on trigger container nodes', () => {
        it('should be applied', () => {
            var context = buildContext(comparisonCommand, textValue, booleanValue);

            var result = runActions([], context);
            
            var siblingMeta = context.nodes.filter(node => node.id == 'text01').map(node => node.key).toArray();

            new SchemaChecker(result).
                navigate(path => path.node('comparison').node('params').node('right')).
                check(schema => schema.node('text01', { siblingMeta }));
        });

        it('should change when the tag value changes', () => {
            var context = buildContext(comparisonCommand, textValue, booleanValue);

            var result = runActions([
                (meta, state) => changeId(state.node('comparison').node('params').node('left').node('text01').target(), 'bool01')
            ], context);
            
            new SchemaChecker(result).
                navigate(path => path.node('comparison').node('params').node('right')).
                check(booleanValue);
        });
    });
*/
    describe('variables', () => {
        it('should create the variable', () => {
            var context = buildContext(commandCollectionCommand, setVariableCommand, textCommand, textValue, textInput('var01'));

            var result = runActions([
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('setVariable').target()),
                (meta, state) => changeId(state.node('commandCollection').node('params').node('commands').node('setVariable').node('params').node('name').node('text01').target(), 'input'),
                (meta, state) => addCommand(state.node('commandCollection').node('params').node('commands').target(), meta.node('textCommand').target())
            ], context);
            
            var siblingMeta = context.nodes.filter(node => node.id == 'text01' || node.id == "input" || node.id == "variables").map(node => node.key).toArray();

            new SchemaChecker(result).
                navigate(path => path.node('commandCollection').node('params').node('commands').node('textCommand').node('params').node('textParam')).
                check(schema => schema.node('text01', { siblingMeta }));
        });
    });

    describe('container drill down', () => {
        describe('visuals', () => {
            it("don't show if type can't drill down", () => {
                var context = buildContext(textCommand, textValue);

                var result = runActions([], context);
                    
                var node = result.containers.filter(n => n.id == 'text01').first();
                expect(node.canDrillDown).toBeFalsy();
            });
            
            it("show for simple drill down", () => {
                var context = buildContextWithTypes(textCommand, { types: [schema => schema.value('text', 'text', {}, child => textToUpperCommand(child))], globals: [textValue] });

                var result = runActions([], context);
                    
                var node = result.containers.filter(n => n.id == 'text01').first();
                expect(node.canDrillDown).toBeTruthy();
            });
        });
        
        describe('functionality', () => {
            it('should work correctly one level deep', () => {
                var context = buildContextWithTypes(textCommand, { types: [schema => schema.value('text', 'text', {}, child => textToUpperCommand(child))], globals: [textValue] });

                var result = runActions([], context);
                    
                new SchemaChecker(result).
                    navigate(path => path.node('textCommand').node('params').node('textParam')).
                    check(textValue);

                new SchemaChecker(result).
                    navigate(path => path.node('textCommand').node('params').node('textParam').node('text01')).
                    noChildren();
            });

            it('should work correctly after drilling down', () => {
                var context = buildContextWithTypes(textCommand, { types: [schema => schema.value('text', 'text', {}, child => textToUpperCommand(child))], globals: [textValue] });

                var result = runActions([
                    (meta, state) => extendContainer(state.node('textCommand').node('params').node('textParam').node('text01').target())
                ], context);
                    
                new SchemaChecker(result).
                    navigate(path => path.node('textCommand').node('params').node('textParam').node('text01')).
                    check(textToUpperCommand);

                new SchemaChecker(result).
                    navigate(path => path.node('textCommand').node('params').node('textParam').node('text01').node('toUpper').node('value')).
                    noChildren();
            });

            it('command that leads to another command (which should have another command transforming its result)', () => {
                var context = buildContextWithTypes(textCommand, {
                    types: [
                        schema => schema.node('text', { type: 'text' }, child => {
                            textToUpperCommand(child);
                            textLengthCommand(child);
                        }),
                        schema => schema.node('number', { type: 'number' }, child => toStringCommand(child))],
                    globals: [textValue]
                });
/*zzzzzzzzz
                var result = runActions([
                    (meta, state) => extendContainer(state.node('textCommand').node('params').node('textParam').node('text01').target()),
                    (meta, state) => changeId(state.node('textCommand').node('params').node('textParam').node('text01').node('toUpper').target(), 'length')
                ], context);
                    
                new SchemaChecker(result).
                    navigate(path => path.node('textCommand').node('params').node('textParam').node('text01')).
                    check(textLengthCommand);

                new SchemaChecker(result).
                    navigate(path => path.node('textCommand').node('params').node('textParam').node('text01').node('length').node('value')).
                    check(toStringCommand);
                */
            });
        });
    });

    describe('async containers', () => {
        //#TEST:10 Figure out / add testing for async containers

        it('should load async children when they are the initially selected path', () => {
            //Add a command with a text parameter
            //Add an async type node that is hinted to have a text child node
            //Add a container pointing at that async type node

            //Set up its real children to be returned by the async handler

            //Call
        });

        it('should load async children after switching to them from another selected path', () => {
            //Add a command with a text parameter
            //Add a text container
            //Add an async type node that is hinted to have a text child node
            //Add a container pointing at that async type node
            //Set up its real children to be returned by the async handler
        });

        it('should load async children of a variable', () => {

        });
    });

    //#TEST:30 Command dragging from + dropping to
})