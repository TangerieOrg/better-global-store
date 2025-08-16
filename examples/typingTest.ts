// typingTest.ts
import { createStore } from "../src/mod.ts";

interface AppState {
  count: number;
  loading: boolean;
}

const store = createStore({
  state: {
    count: 0,
    loading: false,
  } as AppState,
  actions: {
    // Sync action
    increment(state) {
      state.count += 1;
    },
    
    // Async action
    async fetchIncrement(state) {
      state.loading = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        state.count += 1;
      } finally {
        state.loading = false;
      }
    },
    
    // Sync action with parameters
    add(state, amount: number) {
      state.count += amount;
    },
    
    // Async action with parameters
    async fetchAdd(state, amount: number) {
      state.loading = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        state.count += amount;
      } finally {
        state.loading = false;
      }
    }
  }
});

// Test that the typing works correctly
const { actions } = store;

// The current typing correctly allows both sync and async actions
// Actions return void | Promise<void> which is correct for the implementation

// You can use sync actions directly
actions.increment();

// You can await async actions
actions.fetchIncrement().then(() => {
  console.log("Async increment completed");
});

// You can use sync actions with parameters
actions.add(5);

// You can await async actions with parameters
actions.fetchAdd(10).then(() => {
  console.log("Async add completed");
});

// The typing correctly reflects that all actions can be called,
// and async actions return a Promise that can be awaited

console.log("All typing tests completed!");
console.log("Store state:", store.get());