import { SimpleContextNode, createMetaContext } from '../src/app/util/convertContext';
import { ContainerTypes } from '../src/app/types';

describe('MetaContext', () => {
    it('should get all containers grouped by their type', () => {
        var context = {           
          id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'trigger',
                    containerType: 0,
                    type: 'command',
                    children: [{
                      id: 'params',
                      children: [{
                        id: 'workflow',
                        text: 'Workflow',
                        containerType: 1,
                        type: 'lookup',
                        tags: {
                            lookup: 55
                        },
                        subscriptions: [{
                            source: 'triggertask',
                            target: 'workflow',
                            fields: [{
                                source: ['type', 'tags', 'workflow'],
                                target: ['id']
                            }]
                        }]
                    }, {
                        id: 'fieldstowatch',
                        text: 'Watched Fields',
                        containerType: 1,
                        type: 'container',
                        flags: ['collection']
                      }, {
                        id: 'criteria',
                        text: 'Criteria',
                        containerType: 1,
                        type: 'boolean',
                        flags: ['collection']
                      }, {
                        id: 'commands',
                        text: 'Commands',
                        containerType: 1,
                        type: 'command',
                        flags: ['collection']
                      }]
                    }]
                }, {
                    id: 'input',
                    text: 'Input',
                    containerType: 3,
                    children: [{
                      id: 'text',
                      text: 'Text',
                      children: [{
                        id: '',
                        containerType: 2,
                        type: 'text'
                      }]
                    }, {
                      id: 'number',
                      text: 'Number',
                      children: [{
                        id: '',
                        containerType: 2,
                        type: 'number'
                      }]
                    }, {
                      id: 'boolean',
                      text: 'Checkbox',
                      children: [{
                        id: '',
                        containerType: 2,
                        type: 'boolean'
                      }]
                    }, {
                      id: 'lookup',
                      text: 'Lookup',
                      children: [{
                        id: '55',
                        text: 'Work Flow',
                        async: {
                            retrievalParams: { lookup: 55 },
                            types: [{
                                type: 'lookup',
                                tags: {
                                    lookup: 55
                                }
                            }]
                        }
                      }, {
                        id: '50',
                        text: 'People',
                        async: {
                            retrievalParams: { lookup: 50 },
                            types: [{
                                type: 'lookup',
                                tags: {
                                    lookup: 50
                                }
                            }]
                        }
                      }]
                    }]
                }, {
                    id: 'showerror',
                    text: 'Show Error',
                    containerType: 0,
                    tags: { 'toolbox': 'Thingies' },
                    type: 'command',
                    children: [{
                      id: 'params',
                      children: [{
                        id: 'error',
                        text: 'Error',
                        containerType: 1,
                        type: 'text'
                      }]
                    }]
                }, {
                    "id": "save",
                    "text": "Save",
                    "containerType": 0,
                    "children": [{
                        "id": "params",
                        "text": "Parameters",
                        "children": [{
                            "id": "object",
                            "text": "Object",
                            "containerType": 1,
                            "type": "container",
                            "flags": ["saveable"]
                        }, {
                            "id": "changes",
                            "text": "Field Changes",
                            "containerType": 1,
                            "type": "fieldchange",
                            "flags": ["collection"]
                        }]
                    }],
                    "type": "command",
                    "tags": {
                        "toolbox": "Actions"
                    }
                }, {
                    "id": "change",
                    "text": "Change Field",
                    "containerType": 0,
                    "displayFlags": ["noheader"],
                    "children": [{
                        "id": "params",
                        "text": "Parameters",
                        "children": [{
                            "id": "field",
                            "text": "Set",
                            "containerType": 1,
                            "displayFlags": ["inline"],
                            "type": "container",
                            "flags": ["writable"]
                        }, {
                            "id": "value",
                            "text": "To",
                            "containerType": 1,
                            "displayFlags": ["inline"],
                            "type": "container",
                            subscriptions: [{
                                target: 'field'
                            }]
                        }]
                    }, {
                        "id": "value",
                        "text": "Value",
                        "containerType": 2,
                        "type": "fieldchange"
                    }],
                    "type": "command"
                }, {
                    "id": "setvariable",
                    "text": "Set Variable",
                    "containerType": 0,
                    variable: {
                        name: 'name',
                        value: 'value'
                    },
                    tags: {
                        toolbox: 'Thingies2'
                    },
                    "children": [{
                        "id": "params",
                        "text": "Parameters",
                        "children": [{
                            "id": "name",
                            "text": "Name",
                            "containerType": 1,
                            "type": "text"
                        }, {
                            "id": "value",
                            "text": "Value",
                            "containerType": 1,
                            "type": "container"
                        }]
                    }],
                    "type": "command"
                }, {
                    id: 'comparison',
                    text: 'Comparison',
                    containerType: 0,
                    type: 'command',
                    children: [{
                      id: 'params',
                      children: [{
                        id: 'left',
                        text: 'Left',
                        containerType: 1,
                        type: 'container'
                      }, {
                        id: 'right',
                        text: 'Right',
                        containerType: 1,
                        type: 'container',
                        subscriptions: [{
                            target: 'left',
                            fields: [{
                                source: ['type'],
                                target: ['type']
                            }]
                        }]
                      }]
                    }, {
                      id: 'value',
                      containerType: 2,
                      type: 'boolean'
                    }]
                }, {
                    id: 'if',
                    text: 'If',
                    containerType: 0,
                    tags: { 'toolbox': 'Thingies' },
                    type: 'command',
                    children: [{
                      id: 'params',
                      children: [{
                        id: 'condition',
                        text: 'Condition',
                        containerType: 1,
                        type: 'boolean'
                      }, {
                        id: 'then',
                        text: 'Then',
                        containerType: 1,
                        type: 'command',
                        flags: ['collection']
                      }, {
                        id: 'else',
                        text: 'Else',
                        containerType: 1,
                        type: 'command',
                        flags: ['collection']
                      }]
                    }]
                }, {
                    id: 'budget',
                    text: 'Budget',
                    containerType: 0,
                    tags: { 'toolbox': 'Thingies2' },
                    type: 'command',
                    children: [{
                      id: 'params',
                      children: [{
                        id: 'message',
                          text: 'Message',
                        containerType: 1,
                        type: 'text'
                      }, {
                        id: 'budget',
                          text: 'Budget',
                        containerType: 1,
                        type: 'number'
                      }]
                    }]
                }, {
                    id: 'thingy',
                    text: 'Thingy',
                    children: [{
                        id: 'one',
                        text: 'One',
                        containerType: 2,
                        type: 'number'
                    }, {
                        id: 'two',
                        text: 'Two',
                        containerType: 2,
                        type: 'number'
                    }]
                }, {
                    id: 'triggerproject',
                    text: 'Trigger Project',
                    containerType: 2,
                    type: 'project'
                }, {
                    id: 'triggertask',
                    text: 'Trigger Task',
                    containerType: 2,
                    type: 'task'
                }, {
                    "id": "variables",
                    "text": "Variables"
                }]
            }, {
                id: 'types',
                children: [{
                    id: 'text',
                    containerType: 2,
                    type: 'text',
                    children: [{
                      id: 'length',
                      text: 'Length',
                      containerType: 0,
                      type: 'command',
                      children: [{
                        id: 'value',
                        containerType: 2,
                        type: 'number'
                      }]
                  }]
                }, {
                    id: 'number',
                    containerType: 2,
                    type: 'number',
                    children: [{
                      id: 'tostring',
                      text: 'To String',
                      containerType: 0,
                      type: 'command',
                      children: [{
                        id: 'value',
                        containerType: 2,
                        type: 'text'
                      }]
                  }, {
                      id: 'double',
                      text: 'Double',
                      containerType: 0,
                      type: 'command',
                      children: [{
                        id: 'value',
                        containerType: 2,
                        type: 'number'
                      }]
                  }]
                }, {
                    containerType: 2,
                    type: 'task',
                    tags: { 'workflow': '1' },
                      children: [{
                        id: 'field1',
                        text: 'Field 01 (number)',
                        containerType: 2,
                        type: 'number'
                      }, {
                        id: 'field2',
                        text: 'Field 02 (text)',
                        containerType: 2,
                        type: 'text'
                      }]
                }, {
                    containerType: 2,
                    type: 'task',
                    tags: { 'workflow': '2' },
                      children: [{
                        id: 'field3',
                        text: 'Field 03 (number)',
                        containerType: 2,
                        type: 'number'
                      }, {
                        id: 'field4',
                        text: 'Field 04 (text)',
                        containerType: 2,
                        type: 'text'
                      }]
                }, {
                    containerType: 2,
                    type: 'task',
                    tags: { 'workflow': '3' },
                      children: [{
                        id: 'field5',
                        text: 'Field 05 (number)',
                        containerType: 2,
                        type: 'number'
                      }, {
                        id: 'field6',
                        text: 'Field 06 (text)',
                        containerType: 2,
                        type: 'text'
                      }]
                }, {
                    containerType: 2,
                    type: 'project',
                    children: [{
                        id: 'id',
                        text: 'ID',
                        containerType: 2,
                        type: 'number'
                    }, {
                        id: 'name',
                        text: 'Name',
                        containerType: 2,
                        type: 'text'
                    }, {
                        id: 'budget',
                        text: 'Budget',
                        containerType: 2,
                        type: 'number'
                    }, {
                        id: 'importantguy',
                        text: 'Important Guy',
                        containerType: 2,
                        type: 'lookup',
                        tags: { lookup: 50 }
                    }, {
                        id: 'creationdate',
                        text: 'Creation Date',
                        containerType: 2,
                        type: 'date'
                    }, {
                        "id": "tasktemplate",
                        "text": "Task Template",
                        "containerType": 0,
                        "children": [{
                            "id": "params",
                            "text": "Parameters",
                            "children": [{
                                "id": "workflow",
                                "text": "Workflow",
                                "containerType": 1,
                                "type": "lookup",
                                "tags": { "lookup": 55 }
                            }]
                        }, {
                            "id": "value",
                            "text": "Value",
                            "containerType": 2,
                            "type": "task",
                            subscriptions: [{
                                target: 'workflow',
                                fields: [{
                                    source: ['type', 'tags', 'lookup'],
                                    target: ['id']
                                }]
                            }]
                        }],
                        "type": "command"
                    }]
                }]
            }]        
        };
        
        var expectedTypes = [
            { typeMeta: { type: 'text' }, nodes: ['text01', 'value', 'text'], linkedTypes: [{ type: 'number' }] },
            { typeMeta: { type: 'number' }, nodes: ['number'], linkedTypes: [] }
        ];
        
        var fullContext = createMetaContext(context);

        //console.log(JSON.stringify(fullContext.typing));

        console.log(fullContext.typing.count());
        
        expect(fullContext.typing.count()).toEqual(14);
        //TEST
    });
});