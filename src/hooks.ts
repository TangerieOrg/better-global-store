import { useEffect, useState } from "preact/hooks";
import type { ActionPayloadMap, Store } from "./store.ts";

/**
 * 
 * @example
 * ```tsx
 * const useStore = createUseStore(store);
 * function Element() {
 *     const key = useStore(state => state.key);
 *     useEffect(() => console.log(key), [key]);
 *     return <h1>{key}</h1>
 * }
 * ```
 */
export function createUseStore<
    TState,
    TActions extends ActionPayloadMap<TActions>
>(store : Store<TState, TActions>): { (): TState; <R>(selector: (state: TState) => R): R; } {
    const { get, subscribe } = store;

    function use() : TState;
    function use<R>(selector : (state : TState) => R) : R;
    function use(selector : (state : TState) => unknown = (state : TState) => state) {
        const [local, setLocal] = useState(selector(get()));

        useEffect(() => subscribe(selector, v => setLocal(v)), []);

        return local;
    }

    return use;
}