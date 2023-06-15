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
});

// const mySelector : StateSelector = (state : MyState) => state.key;

const { get, actions, select } = store;
const { use } = useStore(store);
use(state => state.key)
select(state => state.key);

get().key;

actions.resetKey()
actions.setKey("");
actions.append(0, "a", "b", "c");