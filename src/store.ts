import { enableMapSet, type Draft, createDraft, finishDraft } from "immer";
import { deepMerge } from "@std/collections/deep-merge";
enableMapSet();

export type StateSelector<TState, U = unknown> = (state : TState) => U;

export type StateSelectorWithArgs<TState, TArgs extends unknown[], R> = (state : TState, ...args : TArgs) => R; 
export type BoundStateSelectorWithArgs<TArgs extends unknown[], R> = (...args : TArgs) => R;

type EmitterCallback<R> = (current : R, previous : R) => void;
type SelectedEmitterCallback<TState, R> = [selector : StateSelector<TState, R>, cb : EmitterCallback<R>];
type EmitterUnsubscriber = () => void;

export type Comparator<V = unknown> = (a : V, b : V) => boolean;
export type StoreAction<TState, TPayload extends unknown[]> = (state : TState, ...payload : TPayload) => void | Promise<void>;

export type ActionPayloadMap<TActions> = {
    [K in keyof TActions]: unknown[]
}

type ActionsInit<TState, TActions extends ActionPayloadMap<TActions>> = {
    [K in keyof TActions]: StoreAction<TState, TActions[K]>
}

type StoreInit<
    TState,
    TActions extends ActionPayloadMap<TActions>
> = {
    state : TState | (() => TState),
    actions: ActionsInit<TState, TActions>
}

// Simplified StoreActions type that works correctly
type StoreActions<TActions extends ActionPayloadMap<TActions>> = {
    [K in keyof TActions]: (...payload : TActions[K]) => void | Promise<void>;
}

export type StoreSetOperation<TState> = (d : Draft<TState>) => void | Promise<void>;
export type StoreSet<TState> = (op : StoreSetOperation<TState>) => void;

/**
 * @example
 * ```ts
const { get, actions, select, selector, set, subscribe } = store;

const keySelector = selector((state : MyState) => state.key);
const selectorWithArgs = selector((state : MyState, a : number) => String(state.other.length + a))

const stateWithGet = get();
const stateWithSelect = select(state => state);

const keyWithSelect = select(state => state.key);
const keyWithSelector = keySelector();

const lengthFromSelectorWithArgs = selectorWithArgs(2);
const unsubscribe = subscribe(state => console.log("[State Changed]", state));
actions.setKey("abba");
// [State Changed] { key: "abba", other: [ 1, 2, 3 ] }
set(state => state.other = [2]);
// [State Changed] { key: "abba", other: [ 2 ] }
unsubscribe();
set(state => state.other = [1, 2]);
// -
 * ```
 */
export interface Store<
    TState,
    TActions extends ActionPayloadMap<TActions>
> {
    /**
     * @example
     * ```ts
     * console.log(get())
     * ```
     */
    get() : TState,
    /**
     * @example
     * ```ts
     * set(state => state.key = value)
     * ```
     */
    set: StoreSet<TState>,

    /**
     * @example
     * ```ts
     * console.log(select(state => state.key)) // Equiv to get().key
     * ```
     */
    select<R>(selector : StateSelector<TState, R>) : R,

    /**
     * @example
     * ```ts
     * const func = selector(state => state.key);
     * console.log(func()) // Equiv to select(state => state.key)
     * 
     * const funcWithArgs = selector((state, multiply : number) => state.number * multiply);
     * console.log(funcWithArgs(2)) // Equiv to select(state => state.number * 2)
     * ```
     */
    selector<TArgs extends unknown[], R>(selector : StateSelectorWithArgs<TState, TArgs, R>) : BoundStateSelectorWithArgs<TArgs, R>,
    actions: StoreActions<TActions>,
    
    /**
     * @example
     * ```ts
     * const unsub = subscribe((state, prev) => console.log("State Changed", prev, state));
     * unsub();
     * subscribe(state => state.key, (cur, prev) => console.log("Key Changed", prev, cur));
     * ```
     */
    subscribe(cb : EmitterCallback<TState>) : EmitterUnsubscriber,
    subscribe<R>(selector : StateSelector<TState, R>, cb : EmitterCallback<R>) : EmitterUnsubscriber,
    subscribe<R>(selectorOrCb : StateSelector<TState, R> | EmitterCallback<R>, cb?: EmitterCallback<R>) : EmitterUnsubscriber,
}

interface StoreOptions {
    // Returns true if the states are equal
    compare: Comparator
}

export const defaultComparator : Comparator = (a, b) => a === b; 

const getOptions = (options : Partial<StoreOptions>) => {
    options = deepMerge({
        compare: defaultComparator
    }, options);
    return options as StoreOptions;
}

/**
 * Creates a store from a set of actions and initial state
 * @example 
 * ```ts
interface State {
    key: string;
}
const init : State = {
    key: "value"
}
const store = createStore({
    state: init,
    actions: {
        setKey(state, key : string) {
            state.key = key;
        }
    }
}, { compare: defaultComparator })
 * ```
 */
export function createStore<
    TState,
    TActions extends ActionPayloadMap<TActions>
>(init : StoreInit<TState, TActions>, _opts : Partial<StoreOptions> = {}): Store<TState, TActions> {
    type TStore = Store<TState, TActions>;

    const options = getOptions(_opts);
    const subs = new Map<symbol, SelectedEmitterCallback<TState, any>>();
    const prevValues = new Map<symbol, unknown>();

    const emit = (state : TState) => subs.forEach(([select, cb], key) => {
        const cur = select(state);
        const prev = prevValues.get(key);
        if(!options.compare(prev, cur)) {
            prevValues.set(key, cur);
            cb(cur, prev);
        }
    });

    function subscribe(cb : EmitterCallback<TState>) : EmitterUnsubscriber;
    function subscribe<R>(selector : StateSelector<TState, R>, cb : EmitterCallback<R>) : EmitterUnsubscriber;
    function subscribe<R>(selectorOrCb : StateSelector<TState, R> | EmitterCallback<R>, cbOrNull?: EmitterCallback<R>) : EmitterUnsubscriber {
        const cb = cbOrNull == null ? selectorOrCb as EmitterCallback<R> : cbOrNull;
        const selector = cbOrNull == null
            ? ((state: TState) => state as unknown as R)
            : selectorOrCb as StateSelector<TState, R>;
        const key = Symbol();
        subs.set(key, [selector, cb]);
        prevValues.set(key, selector(get()));
        return () => subs.delete(key);
    }

    let state : TState = init.state instanceof Function ? init.state() : init.state;
    const get : TStore["get"] = () => state;

    function selector<TArgs extends unknown[], R>(sel : StateSelectorWithArgs<TState, TArgs, R>) : BoundStateSelectorWithArgs<TArgs, R> {
        return (...args) => sel(get(), ...args);
    }

    
    const select : TStore["select"] = <R>(selector : StateSelector<TState, R>) : R => selector(get())
    const set : TStore["set"] = op => {
        // Create a draft for the operation
        const draft = createDraft(state as any);
        const result = op(draft as Draft<TState>);
        
        // Handle async operations
        if (result instanceof Promise) {
            result.then(() => {
                const nextState = finishDraft(draft);
                if (!options.compare(state, nextState)) {
                    state = nextState as TState;
                    emit(state);
                }
            });
        } else {
            // Handle sync operations
            const nextState = finishDraft(draft);
            if (!options.compare(state, nextState)) {
                state = nextState as TState;
                emit(state);
            }
        }
    }

    function applyActions(initActions : ActionsInit<TState, TActions>) : StoreActions<TActions> {
        const actions : Partial<StoreActions<TActions>> = {};
        for(const key in initActions) {
            const fullAction = initActions[key];
            actions[key] = (...args) => {
                // Create a draft for potential async operations
                const draft = createDraft(state as any);
                const result = fullAction(draft, ...args);
                
                // Handle async actions
                if (result instanceof Promise) {
                    return result.then(() => {
                        const nextState = finishDraft(draft);
                        // Update state with the new state
                        if (!options.compare(state, nextState)) {
                            state = nextState as TState;
                            emit(state);
                        }
                    });
                } else {
                    // Handle sync actions
                    const nextState = finishDraft(draft);
                    // Update state with the new state
                    if (!options.compare(state, nextState)) {
                        state = nextState as TState;
                        emit(state);
                    }
                    return result;
                }
            };
        }
        return actions as StoreActions<TActions>;
    }

    const actions = applyActions(init.actions);

    const store : TStore = {
        get,
        set,
        actions,
        subscribe,
        select,
        selector
    }

    return store;
}