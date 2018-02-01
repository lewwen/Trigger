import { Map } from 'immutable';
import { Container, TriggerDefinitionNode } from '../types';

function saveTrigger(trigger: Map<number, Container>): TriggerDefinitionNode {
	return getNode(trigger, trigger.first());
}

function getNode(trigger: Map<number, Container>, container: Container): TriggerDefinitionNode {
	return {
		id: container.id,
		children: getChildren(trigger, container)
	};
}

function getChildren(trigger: Map<number, Container>, container: Container): TriggerDefinitionNode[] {
	return trigger.filter(n => n.parent === container.key).sortBy(n => n.sequence).map(n => getNode(trigger, n)).toArray();
}

export default saveTrigger;