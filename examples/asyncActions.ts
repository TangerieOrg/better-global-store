import { createStore } from "../src/mod.ts";

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
        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be the response from an API
        const users: User[] = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
          { id: 3, name: "Charlie" }
        ];
        
        // Update state with fetched users
        state.users = users;
      } catch (error) {
        // Type the error properly
        const errorMessage = error instanceof Error ? error.message : String(error);
        state.error = errorMessage || "Failed to fetch users";
      } finally {
        state.loading = false;
      }
    },
    
    // Another async action example with parameters
    async fetchUserById(state, id: number) {
      state.loading = true;
      state.error = null;
      
      try {
        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate fetching a single user
        const user: User = { id, name: `User ${id}` };
        
        // Add user to the list
        const existingIndex = state.users.findIndex(u => u.id === id);
        if (existingIndex >= 0) {
          state.users[existingIndex] = user;
        } else {
          state.users.push(user);
        }
      } catch (error) {
        // Type the error properly
        const errorMessage = error instanceof Error ? error.message : String(error);
        state.error = errorMessage || `Failed to fetch user with id ${id}`;
      } finally {
        state.loading = false;
      }
    }
  }
});

// Usage examples
const { get, actions, subscribe } = store;

// Subscribe to state changes
subscribe((current, previous) => {
  console.log("State changed:", { previous, current });
});

// Using sync action
console.log("Initial state:", get());
actions.addUser({ id: 0, name: "Admin" });
console.log("After adding user:", get());

// Using async action - handle the Promise properly
console.log("Fetching users...");
const fetchUsersPromise = actions.fetchUsers();
if (fetchUsersPromise instanceof Promise) {
  fetchUsersPromise.then(() => {
    console.log("Users fetched:", get());
  });
}

// Using async action with parameters - handle the Promise properly
console.log("Fetching user by ID...");
const fetchUserPromise = actions.fetchUserById(4);
if (fetchUserPromise instanceof Promise) {
  fetchUserPromise.then(() => {
    console.log("User fetched:", get());
  });
}