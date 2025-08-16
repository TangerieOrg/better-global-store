# Global Store
`deno add --jsr @tangerie/global-store`


## Example
For more see `examples` directory.

### Basic Usage
```ts
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

set(state => state.other = []);

console.log(select(state => state.other));
```

### Async Actions
The store now supports async actions that can perform asynchronous operations and then update the state:

```ts
import { createStore } from "@tangerie/global-store"

interface User {
  id: number;
  name: string;
}

interface AppState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const store = createStore({
  state: {
    users: [],
    loading: false,
    error: null,
  } as AppState,
  actions: {
    // Sync action example
    addUser: (state, user: User) => {
      state.users.push(user);
    },
    
    // Async action example
    async fetchUsers(state) {
      state.loading = true;
      state.error = null;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update state with fetched users
        const users: User[] = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
          { id: 3, name: "Charlie" }
        ];
        state.users = users;
      } catch (error) {
        state.error = error.message || "Failed to fetch users";
      } finally {
        state.loading = false;
      }
    }
  }
});

// Using async action
store.actions.fetchUsers().then(() => {
  console.log("Users fetched:", store.get());
});
```