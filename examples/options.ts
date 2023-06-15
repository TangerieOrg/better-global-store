import { isEqual } from "lodash";
import { createStore, useStore } from "../lib"


interface MyState {
    key : string;
}

const store = createStore({
    state: {
        key: "value"
    } as MyState,
    actions: {
        setKey: (state, key : string) => {
            state.key = key
        },
        resetKey: (state) => {
            state.key = "";
        },
        append: (state, number : number, ...data : string[]) => {
            state.key += data.join(",");
        }
    }
}, {
    compare: (current, next) => isEqual(current, next)
});

// const mySelector : StateSelector = (state : MyState) => state.key;

const { get, actions, select } = store;
const { use } = useStore(store);
const key = use(state => state.key)
const state = use()

get().key;

actions.resetKey()
actions.setKey("");
actions.append(0, "a", "b", "c");