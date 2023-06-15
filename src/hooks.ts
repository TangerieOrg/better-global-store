import { useEffect, useState } from "preact/hooks";
import { ActionPayloadMap, Store } from "./store";



export function createUseStore<
    TState,
    TActions extends ActionPayloadMap<TActions>
>(store : Store<TState, TActions>) {
    const { get, subscribe } = store;

    function use() : TState;
    function use<R>(selector : (state : TState) => R) : R;
    function use(selector : (state : TState) => any = (state : TState) => state) {
        const [local, setLocal] = useState(selector(get()));

        useEffect(() => subscribe(state => setLocal(selector(state))), []);

        return local;
    }

    return use;
}