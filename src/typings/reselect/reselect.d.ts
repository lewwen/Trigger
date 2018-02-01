declare module Reselect {
    function createSelector<S, T, R>(inputSelectors: [(state: S) => T], resultFunc: (arg1: T) => R): (state: S) => R;
    function createSelector<S, T, T2, R>(inputSelectors: [(state: S) => T, (state: S) => T2], resultFunc: (arg1: T, arg2: T2) => R): (state: S) => R;
    function createSelector<S, T, T2, T3, R>(inputSelectors: [(state: S) => T, (state: S) => T2, (state: S) => T3], resultFunc: (arg1: T, arg2: T2, arg3: T3) => R): (state: S) => R;
    function createSelector<S, T, T2, T3, T4, R>(inputSelectors: [(state: S) => T, (state: S) => T2, (state: S) => T3, (state: S) => T4], resultFunc: (arg1: T, arg2: T2, arg3: T3, arg4: T3) => R): (state: S) => R;
    
    function createSelector<S, T, R>(inputSelector1: (state: S) => T, resultFunc: (arg1: T) => R): (state: S) => R;
    function createSelector<S, T, T2, R>(inputSelector1: (state: S) => T, inputSelector2: (state: S) => T2, resultFunc: (arg1: T, arg2: T2) => R): (state: S) => R;
    function createSelector<S, T, T2, T3, R>(inputSelector1: (state: S) => T, inputSelector2: (state: S) => T2, inputSelector3: (state: S) => T3, resultFunc: (arg1: T, arg2: T2, arg3: T3) => R): (state: S) => R;
    function createSelector<S, T, T2, T3, T4, R>(inputSelector1: (state: S) => T, inputSelector2: (state: S) => T2, inputSelector3: (state: S) => T3, inputSelector4: (state: S) => T4, resultFunc: (arg1: T, arg2: T2, arg3: T3, arg4: T4) => R): (state: S) => R;
    
    //function createSelector(inputSelectors: any[], resultFunc: (...args) => any): (state: any) => any;
    //function createSelector<S>(...args): (state: S) => any;
}

declare module "reselect" {
    export = Reselect;
}