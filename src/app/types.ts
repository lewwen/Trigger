import { Map, List, Record } from 'immutable';
import MetaQueryable from './util/MetaQueryable';

export enum ContainerTypes {
    CONTAINER = -1,
    COMMAND = 0,
    PARAMETER = 1,
    VALUE = 2,
    INPUT = 3
}

export interface MetaSubscription {
    /**
    * The global context node where the subscription is being applied to.
    * If this is ommitted then it is assumed that the subscription is being applied to the current node.
    */
    source?: string;

    /**
    * The node where the subscription value is being retrieved from.
    */
    target: string;

    /**
    * The field values to copy.
    * If this is ommitted then all field values will be copied.
    */
    fields?: {
        source: string[],
        target: string[]
    }[];
}

export interface MetaTypeProps {
    type?: string;
    tags?: Map<string, any>;
}

const defaultMetaType: MetaTypeProps = {
    type: '',
    tags: Map<string, any>()
}

export class MetaType extends Record<MetaTypeProps>(defaultMetaType, 'MetaType') implements MetaTypeProps {
    type: string;
    tags: Map<string, any>;
}

type AsyncMetaInfo = { retrievalParams: { [id: string]: any; }, types: MetaType[] };

const defaultMetaNode: MetaNodeProps = {
    id: '',
    key: -1,
    parent: -1,
    text: '',
    type: new MetaType(),
    flags: [],
    displayFlags: [],
    containerType: ContainerTypes.CONTAINER,
    variable: null,
    subscriptions: [],
    async: null as AsyncMetaInfo
};

export class MetaNode extends Record<MetaNodeProps>(defaultMetaNode, 'MetaNode') implements MetaNodeProps {
    id: string;
    key: number;
    parent: number;
    text: string;
    type: MetaType;
    flags: string[];
    displayFlags: string[];
    containerType: ContainerTypes;
    variable: { name: string, value: string };
    subscriptions: MetaSubscription[];
    async: AsyncMetaInfo;
}

interface MetaNodeProps {
    key: number;
    parent: number;
    id?: string;
    text?: string;
    type: MetaType;
    flags?: string[];
    displayFlags?: string[];
    containerType?: ContainerTypes;
    variable?: { name: string, value: string }
    subscriptions?: MetaSubscription[];
    /** List of types that may be returned asynchronously. No list indicates this is not asynchronous. */
    async?: AsyncMetaInfo;
}

const defaultContainer: ContainerProps = {
    id: '',
    key: -1,
    parent: -1,
    parameter: -1,
    sequence: 0,
    meta: -1,
    canDrillDown: false,
    siblingMeta: [],
    errors: []
};

export class Container extends Record<ContainerProps>(defaultContainer, 'Container') implements ContainerProps {
    id: string;
    key: number;
    parent: number;
    parameter: number;
    sequence: number;
    meta: number;
    canDrillDown: boolean;
    siblingMeta: number[];
    errors: string[];
}

interface ContainerProps {
    key: number;
    parent: number;
    id: string;
    parameter: number;
    sequence: number;
    meta: number;
    canDrillDown: boolean;
    siblingMeta?: number[];
    errors?: string[];
}

export interface TriggerDefinitionNode {
    id: string;
    children?: TriggerDefinitionNode[];
}

export interface TriggerDefinition {
    id: number;
    name: string;
    type: string;
    enabled: boolean;
    logExceptions: boolean;
}

export interface SubscriptionEntry {
    /**
    * The node that requested the subscription (that will be receiving the value).
    */
    source: number;

    /**
    * The parameter that contains the endpoint targetted by the subscription.
    */
    targetParameter: Container;

    /**
    * The endpoint that is targetted by the subscription, this will be null if the query could not be completed, or has not been run yet.
    */
    targetEndpoint?: Container;

    /**
    * The meta which describes the query.
    */
    meta: MetaSubscription;
}

export interface VariableEntry {
    definer: number;
    meta: number;
}