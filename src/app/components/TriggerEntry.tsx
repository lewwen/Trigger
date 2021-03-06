import * as React from 'react';
import { Map, Seq } from 'immutable';
import { Container, TriggerDefinition } from '../types';
import { TriggerState } from '../TriggerState';
import { MetaContext } from '../MetaContext';
import strings from '../strings';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { allActions as CommandActions } from '../actions/CommandActions';

import ParameterInput from './ParameterInput';

import TriggerSaver from '../util/TriggerSaver';
import ContainerQueryable from '../util/ContainerQueryable';


let TriggerEntry = ({trigger = null as TriggerDefinition,  containers = null as Map<number, Container>, context = null as MetaContext, actions = null }) => {
	if (!containers || containers.isEmpty()) {
		return null;
	}
	
    const params = new ContainerQueryable(containers, Seq.of(containers.first())).children().withId('params').children();
	const watched = params.withId('fieldstowatch').first();
	const criteria = params.withId('criteria').first();
	const commands = params.withId('commands').first();
    
    const saveTrigger = () => {
        var triggerJson = JSON.stringify({ nodes: TriggerSaver(containers), definition: trigger});
			(document.getElementById('triggerStorage') as HTMLInputElement).value = triggerJson;
        var form = document.getElementById('triggerForm') as HTMLFormElement;
        form.submit();
    }

	const copyTrigger = () => {
        var triggerJson = JSON.stringify({ nodes: TriggerSaver(containers), definition: trigger});
 		(document.getElementById('triggerStorage') as HTMLInputElement).value = triggerJson + 'copytrigger';
        var form = document.getElementById('triggerForm') as HTMLFormElement;
        form.submit();
    }

	
	return <div>
		<div className="group parameter">
			<h2>{strings.watchedFields}</h2>
	
			<div className="section-contents">
				<ParameterInput container={watched} containers={containers} context={context} actions={actions} />
			</div>
		</div>
		<div className="group parameter">
			<h2>{strings.triggerCriteria}</h2>
	
			<div className="section-contents">
				<ParameterInput container={criteria} containers={containers} context={context} actions={actions} />
			</div>
		</div>
		<div className="group parameter">
			<h2>{strings.triggerCommands}</h2>
	
			<div className="section-contents">
				<ParameterInput container={commands} containers={containers} context={context} actions={actions} />
			</div>
		</div>
		<div>
			<button className="fbutton" onClick={saveTrigger}>{strings.save}</button>
			<button className="fbutton" onClick={copyTrigger}>{strings.copy}</button>
			<button className="fbutton" onClick={() => window.location.reload()}>{strings.reset}</button>
		</div>
	</div>;
}

export default connect(
	(state: TriggerState) => ({ trigger: state.definitions.definitions.filter(t => t.id == state.definitions.selected).first(), containers: state.containers, context: state.context }),
	dispatch => ({ actions: bindActionCreators(CommandActions, dispatch) })
)(TriggerEntry);