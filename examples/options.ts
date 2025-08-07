import { deep_equals } from "jsr:@ordo-pink/deep-equals"
import { type Comparator, createStore, defaultComparator } from "@tangerie/global-store";

Object.assign(Map.prototype, {
    [Symbol.for("Deno.customInspect")](this: Map<unknown, unknown>) {
        return Deno.inspect(Object.fromEntries(this.entries()))
    }
})

interface MyState {
    data : {
        key: string;
        list: number[];
    },
    map: Map<string, number>;
}


function createStoreWithCmp(cmp : Comparator) {
    return createStore({
        state: {
            data: {
                key: "value",
                list: [1]
            },
            map: new Map([["someKey", 2]])
        } as MyState,
        actions: {
            setKey(state, key : string) {
                state.data.key = key;
            },
            resetKey(state) {
                state.data.key = "";
            },
            append(state, number : number, ...data : string[]) {
                state.data.key += data.join(",");
            },
            setList(state, list : number[]) {
                state.data.list = list;
            },
            addRecord(state, key : string, value : number) {
                state.map.set(key, value);
            },
            removeRecord(state, key : string) {
                state.map.delete(key);
            }
        }
    }, {
        compare: cmp
    });
}

const normalStore = createStoreWithCmp(defaultComparator);
const deepCompareStore = createStoreWithCmp(deep_equals);

const logChange = (name : string) => (v : unknown) => console.log(`[${name} Changed]`, v);

normalStore.subscribe(logChange("Normal.State"));
normalStore.subscribe(state => state.data, logChange("Normal.Data"));
normalStore.subscribe(state => state.data.key, logChange("Normal.Key"));
normalStore.subscribe(state => state.data.list, logChange("Normal.List"));
normalStore.subscribe(state => state.map, logChange("Normal.Map"));

normalStore.actions.resetKey()
normalStore.actions.setKey("");
normalStore.actions.append(0, "a", "b", "c");

normalStore.actions.setList([1]);
normalStore.actions.setList([1]);
normalStore.actions.addRecord("key", 1);
normalStore.actions.addRecord("key", 1);
// Will update each time

deepCompareStore.subscribe(logChange("DeepCompare.State"));
deepCompareStore.subscribe(state => state.data, logChange("DeepCompare.Data"));
deepCompareStore.subscribe(state => state.data.key, logChange("DeepCompare.Key"));
deepCompareStore.subscribe(state => state.data.list, logChange("DeepCompare.List"));
deepCompareStore.subscribe(state => state.map, logChange("DeepCompare.Map"));

deepCompareStore.actions.setList([]);
deepCompareStore.actions.setList([1]);
// Will update

deepCompareStore.actions.setList([1]);
deepCompareStore.actions.addRecord("key", 1);
deepCompareStore.actions.addRecord("key", 1);
// Won't update each time