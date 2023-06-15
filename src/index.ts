import { useEffect, useState } from "preact/hooks";
import { produce, Draft, Immutable } from "immer";
import { createEmitter } from "./emitter";
import { merge } from "lodash";

export type StoreAction<TState, TPayload extends unknown[]> = (state : Draft<TState>, ...payload : TPayload) => void;

type ActionPayloadMap<TActions> = {
    [K in keyof TActions]: unknown[]
}

type ActionsInit<TState, TActions extends ActionPayloadMap<TActions>> = {
    [K in keyof TActions]: StoreAction<TState, TActions[K]>
}

type StoreInit<
    TState,
    TActions extends ActionPayloadMap<TActions>
> = {
    state : TState,
    actions: ActionsInit<TState, TActions>
}

type StoreActions<TActions extends ActionPayloadMap<TActions>> = {
    [K in keyof TActions]: (...payload : TActions[K]) => void;
}

export type StateSelector<TState, R = unknown> = (state : TState) => R;

type Store<
    TState,
    TActions extends ActionPayloadMap<TActions>
> = {
    get: () => TState,
    select: <R extends unknown>(selector : StateSelector<TState, R>) => R,
    use: () => TState,
    useSelector: <R extends unknown>(selector : StateSelector<TState, R>) => R
    actions: StoreActions<TActions>,
    emitter: ReturnType<typeof createEmitter<TState>>,
}


interface StoreOptions<TState> {
    // Returns true if the states are equal
    compare: (current : TState, next : TState) => boolean;
}

const getOptions = <TState>(options : Partial<StoreOptions<TState>>) => {
    options = merge<StoreOptions<TState>, Partial<StoreOptions<TState>>>({
        compare: (current, next) => current === next
    }, options)
    return options as StoreOptions<TState>;
}

export function createStore<
    TState,
    TActions extends ActionPayloadMap<TActions>
>(init : StoreInit<TState, TActions>, _opts : Partial<StoreOptions<TState>> = {}) {
    const options = getOptions(_opts);
    const emitter = createEmitter<TState>();

    let state : TState = init.state;
    const get = () => state;
    const select : Store<TState, TActions>["select"] = <R extends unknown>(selector : StateSelector<TState, R>) : R => selector(get())
    const set = (op : (d : Draft<TState>) => void) => {
        const nextState = produce<TState>(state, op);
        // state = produce<TState>(state, op);
        if(!options.compare(state, nextState)) {
            state = nextState;
            emitter.emit(state);
        }
    }

    // @ts-ignore
    const actions : StoreActions<TActions> = {};
    for(const key in init.actions) {
        const fullAction = init.actions[key];
        actions[key] = (...args) => set(draft => fullAction(draft, ...args));
    }

    const use = () => {
        const [local, setLocal] = useState(get());

        useEffect(() => emitter.subscribe(setLocal), []);

        return local;
    }

    const useSelector : Store<TState, TActions>["useSelector"] = <R extends unknown>(selector : StateSelector<TState, R>) : R => {
        const [local, setLocal] = useState(selector(get()));

        useEffect(() => emitter.subscribe(state => setLocal(selector(state))), []);

        return local;
    }

    const store : Store<TState, TActions> = {
        get,
        actions,
        use,
        emitter,
        useSelector,
        select
    }

    return store;
}