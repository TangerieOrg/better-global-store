
import { produce, Draft } from "immer";
import { merge } from "lodash";

type EmitterCallback<TState> = (state : TState) => any;

export type StoreAction<TState, TPayload extends unknown[]> = (state : Draft<TState>, ...payload : TPayload) => void;

export type ActionPayloadMap<TActions> = {
    [K in keyof TActions]: unknown[]
}

type ActionsInit<TState, TActions extends ActionPayloadMap<TActions>> = {
    [K in keyof TActions]: StoreAction<TState, TActions[K]>
}

type StoreInit<
    TState extends Exclude<any, Function>,
    TActions extends ActionPayloadMap<TActions>
> = {
    state : TState | (() => TState),
    actions: ActionsInit<TState, TActions>
}

type StoreActions<TActions extends ActionPayloadMap<TActions>> = {
    [K in keyof TActions]: (...payload : TActions[K]) => void;
}

export type StateSelector<TState, U> = (state : TState) => U;

export type StoreSetOperation<TState> = (d : Draft<TState>) => void;
export type StoreSet<TState> = (op : StoreSetOperation<TState>) => void;

export interface Store<
    TState,
    TActions extends ActionPayloadMap<TActions>
> {
    get() : TState,
    set: StoreSet<TState>,
    select<R extends unknown>(selector : StateSelector<TState, R>) : R,
    actions: StoreActions<TActions>,
    subscribe: (cb : EmitterCallback<TState>) => () => boolean,
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

function applyActions<
    TState,
    TActions extends ActionPayloadMap<TActions>
>(initActions : ActionsInit<TState, TActions>, set : StoreSet<TState>) : StoreActions<TActions> {
    const actions : Partial<StoreActions<TActions>> = {};
    for(const key in initActions) {
        const fullAction = initActions[key];
        actions[key] = (...args) => set(draft => fullAction(draft, ...args));
    }
    return actions as StoreActions<TActions>;
}

export function createStore<
    TState,
    TActions extends ActionPayloadMap<TActions>
>(init : StoreInit<TState, TActions>, _opts : Partial<StoreOptions<TState>> = {}) {
    type TStore = Store<TState, TActions>;

    const options = getOptions(_opts);
    const subs = new Map<Symbol, EmitterCallback<TState>>();

    const emit = (state : TState) => subs.forEach(cb => cb(state));
    const subscribe : TStore["subscribe"] = (cb) => {
        const key = Symbol();
        subs.set(key, cb);
        return () => subs.delete(key);
    }

    let state : TState = init.state instanceof Function ? init.state() : init.state;
    const get : TStore["get"] = () => state;
    const select : TStore["select"] = <R extends unknown>(selector : StateSelector<TState, R>) : R => selector(get())
    const set : TStore["set"] = op => {
        const nextState = produce<TState>(state, op);
        if(!options.compare(state, nextState)) {
            state = nextState;
            emit(state);
        }
    }

    const actions = applyActions(init.actions, set);
    

    const store : TStore = {
        get,
        set,
        actions,
        subscribe,
        select
    }

    return store;
}