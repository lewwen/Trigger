import { ContainerTypes, MetaNode, MetaType } from '../../src/app/types';

import { simpleGetSiblingsForType, simpleTypeMatch } from '../lib/pathMatchingUtil';

//     describe('type matching', () => {
//         it('should match simple types', () => {
//             var filter = { type: "match" };
//             
//             var matchingType = { type: "match" };
//             var nonMatchingType = { type: "nonMatch" };
//             
//             expect(simpleTypeMatch(filter, matchingType)).to.be.true;
//             expect(simpleTypeMatch(filter, nonMatchingType)).to.be.false;
//         });
//         
//         it('should match types with tags', () => {
//             var filter = { type: "type", tags: { tag: 1 } };
//             
//             var matchingType = { type: "type", tags: { tag: 1 } };
//             
//             var nonMatchingType1 = { type: "type", tags: { tag: 5 } };
//             var nonMatchingType2 = { type: "type" };
//             
//             expect(simpleTypeMatch(filter, matchingType)).to.be.true;
//             expect(simpleTypeMatch(filter, nonMatchingType1)).to.be.false;
//             expect(simpleTypeMatch(filter, nonMatchingType2)).to.be.false;
//         });
// 
//         it('should match a tagged type when the filter type has no tag', () => {
//             var filter = { type: "task" };
//             
//             var matchingType = { type: "task", tags: { workflow: 10032 } };
//             
//             expect(simpleTypeMatch(filter, matchingType)).to.be.true;
//         });
// 
//         it('should match a flagged type when the filter type has no flag', () => {
//             var filter = { type: "type" };
//             
//             var matchingType = { type: "type", flags: ['good'] };
//             
//             expect(simpleTypeMatch(filter, matchingType)).to.be.true;
//         });
// 
//         it('ignore collection flag', () => {
//             var filter = { type: "type", flags: ['collection'] };
//             
//             var matchingType = { type: "type" };
//             
//             expect(simpleTypeMatch(filter, matchingType)).to.be.true;
//         });
// 
//         it('allow any type to match \'container\' type', () => {
//             var filter = { type: "container" };
//             
//             var matchingType = { type: "type" };
//             var anotherMatchingType = { type: "anothertype" };
//             
//             expect(simpleTypeMatch(filter, matchingType)).to.be.true;
//             expect(simpleTypeMatch(filter, anotherMatchingType)).to.be.true;
//         });
//     });

describe('path matching', () => {
    it('should get paths one layer deep (directly returning type)', () => {
        //Make context
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'text01',
                    type: 'text'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types',
                children: [{
                    id: 'number',
                    type: 'number',
                    children: [{
                        id: 'tostring',
                        children: [{
                            id: 'value',
                            type: 'text'
                        }]
                    }]
                }]
            }]
        };
        
        //Get paths
        
        //Make sure it equals something
        var expectedPaths = [['global'], ['types', 'number', 'tostring']];
    });
    
    it('should get paths two layers deep (indirectly returning type)', () => {
    });
    
    it('should get paths three layers deep (indirectly returning type)', () => {
    });
});

describe('path sibling retrieval', () => {
    it('should get siblings for simple path', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'text01',
                    containerType: ContainerTypes.VALUE,
                    type: 'text'
                }, {
                    id: 'text02',
                    containerType: ContainerTypes.VALUE,
                    type: 'text'
                }, {
                    id: 'variables',                   
                    type: 'variables'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types'
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['text01', 'text02']);
        expect(simpleGetSiblingsForType(context, 'text', 'text01')).toEqual([]);
    });
    
    it('should get siblings for type joined path', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'num01',
                    containerType: ContainerTypes.VALUE,
                    type: 'number'
                }, {
                    id: 'date01',
                    containerType: ContainerTypes.VALUE,
                    type: 'date'
                },{
                    id: 'variables',
                    containerType: ContainerTypes.VALUE,
                    type: 'variables'
                },
                
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types',
                children: [{
                    id: 'number',
                    containerType: ContainerTypes.VALUE,
                    type: 'number',
                    children: [{
                        id: 'tostring',
                        children: [{
                            id: 'value',
                            containerType: ContainerTypes.VALUE,
                            type: 'text'
                        }]
                    }]
                }]
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['num01']);
        expect(simpleGetSiblingsForType(context, 'text', 'num01')).toEqual(['tostring']);
        expect(simpleGetSiblingsForType(context, 'text', 'tostring')).toEqual(['value']);
    });
    
    it('should get siblings with simple and joined path', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'text01',
                    containerType: ContainerTypes.VALUE,
                    type: 'text'
                }, {
                    id: 'num01',
                    containerType: ContainerTypes.VALUE,
                    type: 'number'
                }, {
                    id: 'date01',
                    containerType: ContainerTypes.VALUE,
                    type: 'date'
                },
                {
                    "id": "variables",
                    "text": "Variables"
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types',
                children: [{
                    id: 'number',
                    containerType: ContainerTypes.VALUE,
                    type: 'number',
                    children: [{
                        id: 'tostring',
                        children: [{
                            id: 'value',
                            containerType: ContainerTypes.VALUE,
                            type: 'text'
                        }]
                    }]
                }]
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['text01', 'num01']);
        expect(simpleGetSiblingsForType(context, 'text', 'num01')).toEqual(['tostring']);
        expect(simpleGetSiblingsForType(context, 'text', 'text01')).toEqual([]);
    });
    
    it('should get siblings where target type loops upon itself directly', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'text01',
                    containerType: ContainerTypes.VALUE,
                    type: 'text'
                }, {
                    id: 'date01',
                    containerType: ContainerTypes.VALUE,
                    type: 'date'
                },
                {
                    id: 'variables',                   
                    type: 'variables'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types',
                children: [{
                    id: 'text',
                    containerType: ContainerTypes.VALUE,
                    type: 'text',
                    children: [{
                        id: 'tolower',
                        children: [{
                            id: 'value1',
                            containerType: ContainerTypes.VALUE,
                            type: 'text'
                        }]
                    }, {
                        id: 'toupper',
                        children: [{
                            id: 'value2',
                            containerType: ContainerTypes.VALUE,
                            type: 'text'
                        }]
                    }]
                }]
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['text01']);
        expect(simpleGetSiblingsForType(context, 'text', 'text01')).toEqual(['tolower', 'toupper']);
        expect(simpleGetSiblingsForType(context, 'text', 'tolower')).toEqual(['value1']);
        expect(simpleGetSiblingsForType(context, 'text', 'toupper')).toEqual(['value2']);
        expect(simpleGetSiblingsForType(context, 'text', 'value1')).toEqual(['tolower', 'toupper']);
        expect(simpleGetSiblingsForType(context, 'text', 'value2')).toEqual(['tolower', 'toupper']);
    });
    
    it('should get siblings where target type is two steps away', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'date01',
                    containerType: ContainerTypes.VALUE,
                    type: 'date'
                }, {
                    id: 'lookup01',
                    containerType: ContainerTypes.VALUE,
                    type: 'lookup'
                },{
                    id: 'variables',                   
                    type: 'variables'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types',
                children: [{
                    id: 'date',
                    containerType: ContainerTypes.VALUE,
                    type: 'date',
                    children: [{
                        id: 'day',
                        containerType: ContainerTypes.VALUE,
                        type: 'number'
                    }]
                }, {
                    id: 'number',
                    containerType: ContainerTypes.VALUE,
                    type: 'number',
                    children: [{
                        id: 'tostring',
                        children: [{
                            id: 'value',
                            containerType: ContainerTypes.VALUE,
                            type: 'text'
                        }]
                    }]
                }]
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['date01']);
        expect(simpleGetSiblingsForType(context, 'text', 'date01')).toEqual(['day']);
        expect(simpleGetSiblingsForType(context, 'text', 'day')).toEqual(['tostring']);
        expect(simpleGetSiblingsForType(context, 'text', 'tostring')).toEqual(['value']);
        expect(simpleGetSiblingsForType(context, 'text', 'value')).toEqual([]);
    });
    
    it('should get all matched siblings when multiple types match', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'date01',
                    containerType: ContainerTypes.VALUE,
                    type: 'date'
                }, {
                    id: 'lookup01',
                    containerType: ContainerTypes.VALUE,
                    type: 'lookup'
                },{
                    id: 'variables',                   
                    type: 'variables'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types'
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'container', 'global')).toEqual(['date01', 'lookup01']);
    });
    
    it('should get siblings based on an async type hint', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'blob',
                    async: {
                        retrievalParams: {},
                        types: [{
                            type: 'text'
                        }]
                    }
                },{
                    id: 'variables',                   
                    type: 'variables'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types'
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['blob']);
    });
    
    it('should get siblings based on an async type hint on a meta type linking', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'blob',
                    type: 'linkedtype',
                    containerType: ContainerTypes.VALUE
                },{
                    id: 'variables',                   
                    type: 'variables'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            }, {
                id: 'types',
                children: [{
                    type: 'linkedtype',
                    containerType: ContainerTypes.VALUE,
                    async: {
                        retrievalParams: {},
                        types: [{
                            type: 'text'
                        }]
                    }
                }]
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['blob']);
    });
    
    it('should get siblings based on an async type hint on a child node on a meta type linking', () => {
        var context = {
            id: 'root',
            children: [{
                id: 'global',
                children: [{
                    id: 'blob',
                    type: 'linkedtype',
                    containerType: ContainerTypes.VALUE
                },{
                    id: 'variables',                   
                    type: 'variables'
                },
                {
                    id: 'trigger',
                    containerType: ContainerTypes.COMMAND,
                    type: 'command'}]
            
            }, {
                id: 'types',
                children: [{
                    type: 'linkedtype',
                    containerType: ContainerTypes.VALUE,
                    children: [{
                        id: 'field',
                        async: {
                            retrievalParams: {},
                            types: [{
                                type: 'text'
                            }]
                        }
                    }]
                }]
            }]
        };
        
        expect(simpleGetSiblingsForType(context, 'text', 'global')).toEqual(['blob']);
    });
});