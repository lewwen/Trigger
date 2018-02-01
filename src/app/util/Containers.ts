import { Map } from 'immutable';
import { Container } from '../types';

export function getChildren(containers: Map<number, Container>, parent: Container | number): Container[] {
	var parentKey = parent instanceof Container ? parent.key : parent;

	return containers.filter(x => x.parent == parentKey).sortBy(x => x.sequence).toArray();
}

export function getFirstChild(containers: Map<number, Container>, parent: Container | number): Container {
	return getChildren(containers, parent)[0];
}

export function hasNoChild(containers: Map<number, Container>, parent: Container | number): boolean {
	var parentKey = parent instanceof Container ? parent.key : parent;
	return containers.filter(x => x.parent == parentKey).count() == 0;
}