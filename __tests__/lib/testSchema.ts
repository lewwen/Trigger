import { NodeSchema } from './testBuilder';

export var triggerCommand = (schema: NodeSchema) => schema.
    command('trigger').node('params', {}, children => {
        children.parameter('fields', 'container', { flags: ['collection'] });
        children.parameter('criteria', 'boolean', { flags: ['collection'] });
        children.parameter('commands', 'command', { flags: ['collection'] });
        children.parameter('workflow', 'lookup', { tags: { lookup: '55' } });
    });

export var commandCollectionCommand = (schema: NodeSchema) => schema.
    command('commandCollection').
        node('params').
            parameter('commands', 'command', { flags: ['collection'] });

export var textCommand = (schema: NodeSchema) => schema.
    command('textCommand').
        node('params').
            parameter('textParam', 'text');

export var textCollectionCommand = (schema: NodeSchema) => schema.
    command('textCollection').
        node('params').
            parameter('texts', 'text', { flags: ['collection'] });

export var comparisonCommand = (schema: NodeSchema) => schema.
    command('comparison').
        node('params', {}, children => {
            children.parameter('left', 'container');
            children.parameter('right', 'container', { subscriptions: [{ target: 'left' }] });
        });

export var setVariableCommand = (schema: NodeSchema) => schema.
    command('setVariable', { variable: { name: ".params.name", value: ".params.value"}}).
        node('params', {}, children => {
            children.parameter('name', 'text');
            children.parameter('value', 'container');
        });

export var commandWithAnyTypeParam = (schema: NodeSchema) => schema.
    command('commandWithAnyTypeParam').
        node('params').
            parameter('any', 'container');

export var commandThatAppliesTypeToContextNode = (contextNode: string) => (schema: NodeSchema) => schema.
    command('commandThatAppliesTypeToContextNode').
        node('params').
            parameter('any', 'container', {
                subscriptions: [{
                    source: contextNode,
                    target: 'any',
                    fields: [{
                        source: ['type'],
                        target: ['type']
                    }] }] });

export var commandThatAppliesIDToTagOnContextNode = (contextNode: string, tagName: string) => (schema: NodeSchema) => schema.
    command('commandThatAppliesIDToTagOnContextNode').
        node('params').
            parameter('any', 'container', {
                subscriptions: [{
                    source: contextNode,
                    target: 'any',
                    fields: [{
                        source: ['type', 'tags', tagName],
                        target: ['id']
                    }] }] });

export var containerWithAsyncChildOfType = (type: string, id: string) => (schema: NodeSchema) => schema.
    node(id, { async: [{ type }] });

export var textInput = (text: string) => (schema: NodeSchema) => schema.
        input('input').
            node('text').
                value(text, 'text');

export var textValue = (schema: NodeSchema) => schema.
    value('text01', 'text');

export var textValueCommand = (schema: NodeSchema) => schema.
    command('textValueCommand', {}, children => {
        children.node('params').parameter('textParam', 'text');
        children.value('value', 'text');
    });

export var textValue2 = (schema: NodeSchema) => schema.
    value('text02', 'text');

export var booleanValue = (schema: NodeSchema) => schema.
    value('bool01', 'boolean');

export var textToUpperCommand = (schema: NodeSchema) => schema.
    command('toUpper', {}, children => {
        children.node('params');
        children.value('value', 'text');
    });

export var textLengthCommand = (schema: NodeSchema) => schema.
    command('length', {}, children => {
        children.node('params');
        children.value('value', 'number');
    });

export var toStringCommand = (schema: NodeSchema) => schema.
    command('toString', {}, children => {
        children.node('params');
        children.value('value', 'text');
    });
