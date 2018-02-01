import { Seq } from 'immutable';
import { Container, MetaNode, ContainerTypes, SubscriptionEntry, MetaSubscription, VariableEntry } from '../../types';
import { TriggerState } from '../../TriggerState';
import { nextKey, updateContext } from '../../MetaContext';

const defaultSubscriptionFields = [{ source: ["type"], target: ["type"] }];

export function applySubscriptionToMeta(state: TriggerState, subscription: SubscriptionEntry, meta: MetaNode): TriggerState {
    var fields = subscription.meta.fields || defaultSubscriptionFields;
    
    return fields.reduce((state, field) => state.setIn(['context', 'nodes', meta.key, ...field.source], getFieldValue(state, subscription, field)), state);
}

function getFieldValue(state: TriggerState, subscription: SubscriptionEntry, field: { source: string[], target: string[] }) {
    if (Seq(field.target).equals(Seq.of('id'))) {
        return subscription.targetEndpoint.id;
    } else {
        return state.context.nodes.getIn([subscription.targetEndpoint.meta, ...field.target]);
    }
}

export function addSubscriptionsToState(state: TriggerState, newSubscriptions: SubscriptionEntry[]): TriggerState {
    return state.set('subscriptions', newSubscriptions.reduce((items, entry) => items.push(entry), state.subscriptions));
}

function getSubscriptionSourceKey(state: TriggerState, source: Container, subscription: MetaSubscription) {
    if (!subscription.source) {
        return source.meta;
    }
    
    return state.context.nodes.filter(node => node.parent === state.context.contextKeys.global && node.id === subscription.source).first().key;
}

export function getNewSubscriptionsForParameters(state: TriggerState, parameters: Container[]): SubscriptionEntry[] {
    return Seq(parameters).flatMap(source => Seq(state.context.nodes.get(source.meta).subscriptions).map(subscription => createSubscriptionEntry(getSubscriptionSourceKey(state, source, subscription), parameters, subscription))).toArray();
}

export function getNewSubscriptionsForCommandValue(state: TriggerState, value: Container, parameters: Container[]): SubscriptionEntry[] {
    return Seq(state.context.nodes.get(value.meta).subscriptions).map(subscription => createSubscriptionEntry(getSubscriptionSourceKey(state, value, subscription), parameters, subscription)).toArray();
}

export function createSubscriptionEntry(source: number, parameters: Container[], subscription: MetaSubscription): SubscriptionEntry {
    var target = Seq(parameters).filter(param => param.id === subscription.target).first();

    return {
        source,
        targetParameter: target,
        targetEndpoint: null,
        meta: subscription
    }
}

export function createVariableWithSubscription(state: TriggerState, parameters: Container[], definer: Container): TriggerState {
    var variableCreation = createVariableMetaEntry(state);
    
    state = variableCreation.state;
    
    var commandMeta = state.context.nodes.get(definer.meta);

    var nameSubscription: MetaSubscription = {
        target: commandMeta.variable.name,
        fields: [
            { source: ["id"], target: ["id"] },
            { source: ["text"], target: ["id"] }
        ]
    }

    var valueSubscription: MetaSubscription = {
        target: commandMeta.variable.value,
        fields: [
            { source: ["type"], target: ["type"] }
        ]
    }

    var entry: VariableEntry = { definer: definer.key, meta: variableCreation.key };
    var getMetaSubscription = (meta: MetaSubscription) => createSubscriptionEntry(variableCreation.key, parameters, meta);

    return state.
        set('variables', state.variables.push(entry)).
        set('subscriptions', state.subscriptions.push(getMetaSubscription(nameSubscription), getMetaSubscription(valueSubscription)))
}

function createVariableMetaEntry(state: TriggerState): { key: number, state: TriggerState } {
    var meta = new MetaNode().
        set('key', nextKey(state.context)).
        set('parent', state.context.contextKeys.variables).
        set('containerType', ContainerTypes.VALUE);
    
    return {
        key: meta.key,
        state: state.set('context', updateContext(state.context, meta))
    };
}
