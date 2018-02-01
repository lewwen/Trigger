import { createSelector } from 'reselect';
import { TriggerState } from '../TriggerState';

export const toolboxSelector = createSelector(
    (state: TriggerState) => state.containers,
    (state) => state.variables,
    (containers, variables) => ({
        suk: true
    })
)