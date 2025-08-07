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
        }
    }
});


const { get, actions, select, subscribe } = store;

console.log("State", get())

const unsubscribe = subscribe(state => state.key, (key) => console.log("[Key Changed]", key));

actions.setKey("abba");
// [Key Changed] abba

actions.setKey("abba");
// Nothing because they are equal

actions.setKey("abbab");
// [Key Changed] abbab

actions.addOther(1);
// Nothing

unsubscribe();

actions.resetKey();
// Nothing because unsubscribed

subscribe(state => console.log("[State Changed]", state));
subscribe(state => state.other, other => console.log("[Other Changed]", other));
subscribe(state => state.other.at(1), (cur, prev) => console.log(`[Other[1] Changed] From ${prev} to ${cur}`));

actions.setKey("a");
actions.resetOther();
actions.setOther(0, 5);
actions.addOther(2);