import trigger from './trigger/reducer';
import triggerDefinitions from './triggerDefinitions';

import { TriggerState } from '../TriggerState';

export default (state: TriggerState, action: any): TriggerState => {
    return triggerDefinitions(trigger(state, action), action)
}