import * as React from 'react';
import { KeyedSeq, Iterable, Seq } from 'immutable';
import { createSelector } from 'reselect';
import ToolboxCommand from './ToolboxCommand';
import { connect } from 'react-redux';

import { getDirectChildren } from '../MetaContext';
import { ContainerTypes, MetaNode } from '../types';
import { TriggerState } from '../TriggerState';
import { makeMap } from '../util/collections';

import MaintSection from './MaintSection';

type ToolboxCommandCategories = KeyedSeq<string, Iterable<number, MetaNode>>;

let Toolbox = ({ categories = null as ToolboxCommandCategories }) => {
    var commandCategories = categories.map((commands, category) => <div key={category}>
        <h3>{category}</h3>
        <div className="toolbox-command-section">
            {commands.map((command: MetaNode, key: number) => <ToolboxCommand key={command.key} command={command} />).toArray()}
        </div>
    </div>).toArray();

    return <MaintSection title="Command Toolbox">
        {commandCategories}
    </MaintSection>;
};

export default connect(
    createSelector(
        (state: TriggerState) => state.context,
        (context) => ({
            categories: Seq(getDirectChildren(context.nodes, context.nodes.get(context.contextKeys.global))).
                filter(n => n.containerType === ContainerTypes.COMMAND).
                groupBy(n => n.type.tags.get('toolbox') as string).
                filter((commands, category) => category != null).
                sortBy((value, key) => key)
        })
    )
)(Toolbox);
