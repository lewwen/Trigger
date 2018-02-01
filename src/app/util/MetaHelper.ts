import { Seq } from 'immutable';
import { MetaNode, ContainerTypes } from '../types';

export function isCollection(meta: MetaNode): boolean {
    return Seq(meta.flags).contains("collection");
}
