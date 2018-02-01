import { Map, Seq } from 'immutable';
import * as React from 'react';
import strings from '../strings';
import { Container, TriggerDefinition } from '../types';
import { TriggerState } from '../TriggerState';
import { MetaContext } from '../MetaContext';
import { connect } from 'react-redux';
import { allActions as TriggerActions } from '../actions/TriggerLoadingActions';

import { bindActionCreators } from 'redux';
import { allActions as CommandActions } from '../actions/CommandActions';

import TriggerEntry from '../components/TriggerEntry';
import ParameterInput from './ParameterInput';
import MaintSection from './MaintSection';
import ContainerQueryable from '../util/ContainerQueryable';

let WorkflowEntrySectionImpl = ({ showWorkFlow = false as boolean, containers = null as Map<number, Container>, context = null as MetaContext, actions = null }) => { 
	const workflow = new ContainerQueryable(containers, Seq.of(containers.first())).children().withId('params').children().withId('workflow').first();
    
    
    if (workflow == null || showWorkFlow == false) {
        return null;
    }
    
    return <tr>
        <td className="prompt">
            {strings.workflow}:
        </td>
        <td>
            <ParameterInput container={workflow} containers={containers} context={context} actions={actions} />
        </td>
    </tr>;
};

let WorkflowEntrySection = connect((state: TriggerState) => {
    var selectedTrigger : TriggerDefinition;
    selectedTrigger=state.definitions.definitions.filter(d => d.id == state.definitions.selected).first();
    var showWF : boolean;
    if (typeof(selectedTrigger) == "undefined")
    {showWF = false;}
    else{
       showWF =  selectedTrigger.type == "task";
    }
    return { showWorkFlow: showWF,   containers: state.containers, context: state.context }
}, dispatch => {
    return { actions: bindActionCreators(CommandActions, dispatch) }
})(WorkflowEntrySectionImpl);

let TriggerDetails = ({ trigger = null as TriggerDefinition, actions = null }) => <MaintSection title={strings.triggerDetails}>
    <table className="itoolsform" cellSpacing={0} cellPadding={2}>
        <tbody>
            <tr>
                <td className="manprompt">
                    {strings.name}:
                </td>
                <td>
                    <input name="triggerNameTextBox" type="text" onChange={event => actions.editTrigger(trigger.id,"name", (event.target as HTMLInputElement).value)} 
                    value={trigger.name} size={32} id="triggerNameTextBox" />
                </td>
            </tr>
            <tr>
                <td className="prompt">
                    {strings.enabled}:
                </td>
                <td>
                    <input id="enabledCheckBox" type="checkbox" name="enabledCheckBox" onChange={event => actions.editTrigger(trigger.id, "enabled", (event.target as HTMLInputElement).checked)} checked={trigger.enabled} />
                </td>
            </tr>
            <tr>
                <td className="prompt">
                    {strings.logErrorsForSysAdmin}:
                </td>
                <td>
                    <div>
                        <input id="addExceptionLogEntryCheckbox" type="checkbox" name="addExceptionLogEntryCheckbox" onChange={event => actions.editTrigger(trigger.id, "logExceptions", (event.target as HTMLInputElement).checked)} checked={trigger.logExceptions} />
                    </div>
                </td>
            </tr>
            <WorkflowEntrySection />
        </tbody>
    </table>
</MaintSection>;

let TriggerEditor = ({ trigger = null as TriggerDefinition, actions = null }) => {
    if (!trigger) return null;
    
    return <div>
        <TriggerDetails trigger={trigger} actions={actions} />
        <TriggerEntry  />
    </div>;
}

export default connect(
	(state: TriggerState) => ({ trigger: state.definitions.definitions.filter(d => d.id == state.definitions.selected).first() }),
	dispatch => ({ actions: bindActionCreators(TriggerActions, dispatch) })
)(TriggerEditor);