import { Map, Seq } from 'immutable';
import { ContainerTypes, MetaNode, MetaType } from '../../src/app/types';
import { MetaContext } from '../../src/app/MetaContext';
import MetaQueryable from '../../src/app/util/MetaQueryable';
import { getSiblingsForType } from '../../src/app/util/pathMatching';
import { SimpleContextNode, createMetaContext, SimpleMetaType } from '../../src/app/util/convertContext';

interface SimpleTypeInfoNode {
    typeMeta: MetaNode;
    nodes: string[];
    linkedTypes: MetaNode[];
}

var getNodeByID = (context: MetaContext, id: string): MetaNode => {
    return MetaQueryable.fromContext(context).withId(id).first();
}

export var simpleGetSiblingsForType = (context: SimpleContextNode, filterType: string, parent: string): string[] => {
    var builtContext = createMetaContext(context);
    var typeNode = Seq(builtContext.typing).filter(n => n.type.type === filterType).first().type;
    
    var childSiblingsForType = getSiblingsForType(builtContext, typeNode, getNodeByID(builtContext, parent));
    return childSiblingsForType.map(n => n.id);
}

export var simpleTypeMatch = (filter: SimpleMetaType, type: SimpleMetaType) => {
    var convertType = (type: SimpleMetaType) => new MetaType({ type: type.type, tags: Map(type.tags) });
    var convertMeta = (type: SimpleMetaType) => new MetaNode().set('type', convertType(type)).set('containerType', ContainerTypes.VALUE); 
    return false;
    //return typeMatch(convertType(filter), convertMeta(type));
}