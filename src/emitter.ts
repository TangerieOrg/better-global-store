type EmitterCallback<TState> = (state : TState) => any;

interface Emitter<TState> {
    emit(state : TState): void;
    subscribe(cb : EmitterCallback<TState>): () => boolean;
}

export function createEmitter<TState>() : Emitter<TState> {
    const subs = new Map<Symbol, EmitterCallback<TState>>();
    return {
        emit(state) {
            subs.forEach(cb => cb(state))
        },
        subscribe(cb) {
            const key = Symbol();
            subs.set(key, cb);
            return () => subs.delete(key);
        },
    }
}