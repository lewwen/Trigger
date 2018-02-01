import { Iterable, Map } from 'immutable';

export function makeMap<K, V, NK>(iterable: Iterable<K, V>, keySelector: (value: V) => NK): Map<NK, V> {
    return Map(iterable.map<[NK, V]>(v => [keySelector(v), v]));
}