import { isEqual } from "lodash";
import { createStore } from "../lib"


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

const { get, actions, use, emitter, useSelector, select } = store;
useSelector(state => state.key)

get().key;

actions.resetKey()
actions.setKey("");
actions.append(0, "a", "b", "c");