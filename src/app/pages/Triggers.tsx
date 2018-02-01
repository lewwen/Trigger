import * as React from 'react';
import { List } from 'immutable';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { allActions as TriggerLoadingActions } from '../actions/TriggerLoadingActions';

import { TriggerDefinition } from '../types';
import { TriggerState } from '../TriggerState';
import strings from '../strings';

import SearchItems from '../components/SearchItems';
import Link from '../components/MaintenanceLink';
import Toolbox from '../components/Toolbox';
import TriggerEditor from '../components/TriggerEditor';
import MaintSection from '../components/MaintSection';

const MaintHeader = ({ text = '' }) => <div className="mainHeader">
    <span id="lblPageHeader">{text}</span>
</div>;

@DragDropContext(HTML5Backend)
@connect((state: TriggerState) => ({ triggers: state.definitions.definitions, selectedTrigger: state.definitions.definitions.filter(d => d.id == state.definitions.selected).first() }), dispatch => ({ actions: bindActionCreators(TriggerLoadingActions, dispatch) }))
export default class Triggers extends React.Component<any, any> {
	render() {
		const triggers: List<TriggerDefinition> = this.props.triggers.filter(t => t.id !== -1);
		const actions = this.props.actions;
		const selectedTrigger: TriggerDefinition = this.props.selectedTrigger;
		
		const taskTriggers = triggers.filter(t => t.type == 'task').map(t => ({ id: t.id.toString(), text: t.name })).toArray();
		const projectTriggers = triggers.filter(t => t.type == 'project').map(t => ({ id: t.id.toString(), text: t.name })).toArray();
        
        var selectedTriggerId = selectedTrigger && selectedTrigger.id;
        if (typeof(selectedTriggerId) == "undefined") {selectedTriggerId = -1;}

        var selectedTriggerUrl='Triggers.aspx'
        var pageHeader = strings.addATaskTrigger;
        if (selectedTriggerId == -1 && selectedTrigger.type == 'project')
        {
            pageHeader = 'Add a Project Trigger';
            selectedTriggerUrl = selectedTriggerUrl + '?project';
        }
        if (selectedTriggerId != -1 && selectedTrigger.type == 'project')
        {
            pageHeader = 'Editing a Project Trigger "' + selectedTrigger.name + '"';
            selectedTriggerUrl = selectedTriggerUrl + '?id=' + selectedTriggerId + '&project';
        }
        if (selectedTriggerId != -1 && selectedTrigger.type == 'task')
        {
            pageHeader = 'Editing a Task Trigger "' + selectedTrigger.name + '"';
            selectedTriggerUrl = selectedTriggerUrl + '?id=' + selectedTriggerId;
        }      
		    
		return <div>
            <MaintHeader text={pageHeader}/>
            <table>
                <tbody>
                    <tr>
                        <td className="leftItems">
                            <MaintSection>
                                <Link url="MaintMaintenance.aspx" icon="cog-back" text={strings.maintenanceMenu} />
                                <Link url="Triggers.aspx" icon="cog-add" text={strings.addATaskTrigger} />
                                <Link url="Triggers.aspx?project" icon="cog-add" text={strings.addAProjectTrigger} />
                            </MaintSection>
                            <Toolbox />
                            <MaintSection title={strings.taskTriggers}>
                                <SearchItems items={taskTriggers} selectedId={selectedTriggerId} selectedTriggerUrl={selectedTriggerUrl} urlCreator={(id) => `Triggers.aspx?id=${id}`} onDelete={(id) => this.props.actions.deleteTrigger(id)} />
                            </MaintSection>
                            <MaintSection title={strings.projectTriggers}>
                                <SearchItems items={projectTriggers} selectedId={selectedTriggerId} selectedTriggerUrl={selectedTriggerUrl} urlCreator={(id) => `Triggers.aspx?id=${id}&project=yes`} onDelete={(id) => this.props.actions.deleteTrigger(id)} />
                            </MaintSection>
                        </td>
                        <td>
                            <TriggerEditor />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>;
	}
}