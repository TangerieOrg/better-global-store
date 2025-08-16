import { createStore, StateSelector } from "@tangerie/global-store"

interface MyState {
    key : string;
    other: number[];
}

const store = createStore({
    state: {
        key: "value",
        other: [1, 2, 3]
    } as MyState,
    actions: {
        setKey: (state, key : string) => {
            state.key = key
        },
        resetKey: (state) => {
            state.key = "";
        },
        appendKey: (state, number : number, ...data : string[]) => {
            state.key += data.join(",");
        },
        resetOther: (state) => {
            state.other = [];
        },
        addOther: (state, num : number) => {
            state.other.push(num);
        },
        setOther: (state, index : number, num : number) => {
            if(index === 0) return;
            if(index >= state.other.length) {
                state.other.push(num);
            } else {
                state.other[index] = num;
            }
        },
        async asyncFunction(state, num : number, ms : number) {
            await new Promise(resolve => setTimeout(resolve, ms));
            state.other.push(num);
        }
    }
});


const { get, actions, select, selector, set, subscribe } = store;

const keySelector = selector((state : MyState) => state.key);
const selectorWithArgs = selector((state : MyState, a : number) => String(state.other.length + a))


console.log("State", get())

const key = keySelector();
console.log("Key", key);

const other = select(state => state.other);
console.log("Other", other);

console.log("Args", selectorWithArgs(2));

actions.resetKey();
console.log("Key", keySelector());
actions.setKey("");
console.log("Key", keySelector());
actions.appendKey(0, "a", "b", "c");
console.log("Key", keySelector());

set(state => { state.other = [] });

console.log(select(state => state.other));
await actions.asyncFunction(5, 1000);
console.log(select(state => state.other))