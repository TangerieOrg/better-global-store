import { useEffect, useState } from "preact/hooks";
import { ActionPayloadMap, Store } from "./store";

export interface StoreHooks<TState> {
    use() : TState,
    use<R>(selector : (state : TState) => R) : R
}

export function useStore<
    TState,
    TActions extends ActionPayloadMap<TActions>
>(store : Store<TState, TActions>) : StoreHooks<TState> {
    const { get, subscribe } = store;

    function use() : TState;
    function use<R>(selector : (state : TState) => R) : R;
    // @ts-ignore
    function use<R = TState>(selector : (state : TState) => R = (state : TState) => state) {
        const [local, setLocal] = useState(selector(get()));

        useEffect(() => subscribe(state => setLocal(selector(state))), []);

        return local;
    }

    return {
        use
    };
}