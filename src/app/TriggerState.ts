import { Map, List, Record } from 'immutable';
import { Container, SubscriptionEntry, VariableEntry, TriggerDefinition, TriggerDefinitionNode } from './types';
import { MetaContext } from './MetaContext';

const defaultTriggerDefinitionState: TriggerDefinitionStateProps = {
    selected: -1,
    definitions: List<TriggerDefinition>(),
    nodes: Map<number, TriggerDefinitionNode>()
}

export class TriggerDefinitionState extends Record<TriggerDefinitionStateProps>(defaultTriggerDefinitionState, 'TriggerState') implements TriggerDefinitionState {
    selected: number;
    definitions: List<TriggerDefinition>;
    nodes: Map<number, TriggerDefinitionNode>;
}

export interface TriggerDefinitionStateProps {
    selected: number;
    definitions: List<TriggerDefinition>;
    nodes: Map<number, TriggerDefinitionNode>;
}

const defaultTriggerState: TriggerStateProps = {
    context: new MetaContext(),
    containers: Map<number, Container>(),
    subscriptions: List<SubscriptionEntry>(),
    variables: List<VariableEntry>(),
    definitions: new TriggerDefinitionState()
}

export class TriggerState extends Record<TriggerStateProps>(defaultTriggerState, 'TriggerState') implements TriggerStateProps {
    context: MetaContext;
    containers: Map<number, Container>;
    subscriptions: List<SubscriptionEntry>;
    variables: List<VariableEntry>;
    definitions: TriggerDefinitionState;
}

interface TriggerStateProps {
    context: MetaContext;
    containers: Map<number, Container>;
    subscriptions: List<SubscriptionEntry>;
    variables: List<VariableEntry>;
    definitions: TriggerDefinitionState;
}