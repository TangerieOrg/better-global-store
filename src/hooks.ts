import { useEffect, useState } from "preact/hooks";
import type { ActionPayloadMap, Store } from "./store.ts";

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