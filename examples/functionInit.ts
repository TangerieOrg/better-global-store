import { createStore, createUseStore } from "../src"


interface MyState {
    key : string;
}

const getInit = () : MyState => ({ key : "value" })

const store = createStore({
    state: getInit,
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
const use = createUseStore(store);
const key = use(state => state.key);
const state = use();
select(state => state.key);

get().key;

actions.resetKey()
actions.setKey("");
actions.append(0, "a", "b", "c");