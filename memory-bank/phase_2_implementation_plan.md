# Phase 2: Todo List with Supabase Integration

## Objective
Integrate Supabase into the existing React-based Todo List application to provide persistent storage for todo items, enabling data to be saved and retrieved from a Supabase database. This phase will also explore basic user authentication if time permits.

## Tools and Technologies
- **IDE**: Cursor IDE
- **Frontend**: React (with JSX)
- **Styling**: Tailwind CSS (via CDN)
- **Deployment**: Vercel
- **Version Control**: Git (with GitHub)
- **Node.js**: For local development and dependency management
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)

## Supabase Setup (via Supabase MCP)
1.  **Create Supabase Project**:
    *   Use Supabase MCP to create a new project.
    *   Note down the Project URL and `anon` key.
2.  **Define `todos` Table Schema**:
    *   Via Supabase MCP (or SQL editor in Supabase dashboard), create a `todos` table with the following columns:
        *   `id`: `uuid` (Primary Key, default: `uuid_generate_v4()`)
        *   `user_id`: `uuid` (Foreign Key to `auth.users(id)`, if authentication is implemented) - *Initially can be nullable or omitted if starting without auth.*
        *   `task`: `text` (Not Null)
        *   `is_completed`: `boolean` (Default: `false`)
        *   `created_at`: `timestamp with time zone` (Default: `now()`)
3.  **Row Level Security (RLS)**:
    *   Enable RLS on the `todos` table.
    *   **Initial Policy (if no auth)**: Allow public read/write access (for simplicity during initial development).
        ```sql
        -- For anonymous access initially (adjust if auth is implemented first)
        CREATE POLICY "Public access for todos" ON todos
        FOR ALL USING (true) WITH CHECK (true);
        ```
    *   **If Authentication is implemented**:
        *   Policy for users to manage their own todos:
          ```sql
          CREATE POLICY "Users can manage their own todos" ON todos
          FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
          ```

## Project Setup (Frontend)
1.  **Install Supabase Client Library**:
    *   In the Cursor IDE terminal, navigate to the project root (`todo-list`).
    *   Run: `npm install @supabase/supabase-js`.
2.  **Initialize Supabase Client**:
    *   Create a new file `src/supabaseClient.js`.
    *   Initialize the Supabase client with your Project URL and `anon` key.
    ```javascript
    // src/supabaseClient.js
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase Project URL
    const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    ```
    *   Add `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` to a `.env` file and add `.env` to `.gitignore`. Load these in your app appropriately.

## Implementation Steps

### 1. Refactor Core Components for Supabase
- **`TodoList.jsx`**:
    - **Fetch Todos**: Use `useEffect` to fetch todos from the Supabase `todos` table when the component mounts.
      ```javascript
      // Example fetch
      async function getTodos() {
        const { data, error } = await supabase.from('todos').select('*');
        if (error) console.error('Error fetching todos:', error);
        else setTodos(data);
      }
      ```
    - **Realtime (Optional but Recommended)**: Implement Supabase real-time subscriptions to listen for changes in the `todos` table and update the UI automatically.
- **`TodoForm.jsx`**:
    - **Add Todo**: Modify the form submission handler to insert a new todo into the Supabase `todos` table.
      ```javascript
      // Example insert
      async function addTodo(taskText) {
        const { data, error } = await supabase.from('todos').insert([{ task: taskText, user_id: supabase.auth.user()?.id /* if auth */ }]);
        if (error) console.error('Error adding todo:', error);
        // Optionally refetch or rely on realtime updates
      }
      ```
- **`TodoItem.jsx`**:
    - **Toggle Completion**: Update the `is_completed` status of a todo in Supabase.
      ```javascript
      // Example update
      async function toggleTodo(id, currentStatus) {
        const { data, error } = await supabase.from('todos').update({ is_completed: !currentStatus }).match({ id });
        if (error) console.error('Error updating todo:', error);
      }
      ```
    - **Delete Todo**: Delete a todo from the Supabase `todos` table by its `id`.
      ```javascript
      // Example delete
      async function deleteTodo(id) {
        const { data, error } = await supabase.from('todos').delete().match({ id });
        if (error) console.error('Error deleting todo:', error);
      }
      ```

### 2. State Management
- Continue using React's `useState` for managing the local list of todos in `TodoList.jsx`.
- This local state will be populated and updated based on data fetched from Supabase or through real-time subscriptions.
- Ensure UI updates correctly after Supabase operations (add, toggle, delete).

### 3. User Authentication (Stretch Goal for Phase 2)
- If proceeding with authentication:
    - **Choose Auth Method**: E.g., Email/Password, Magic Link, or Social Logins (Google, GitHub).
    - **Implement Auth UI**:
        - Create `Auth.jsx` component for login/signup forms.
        - Provide a way for users to sign up, log in, and log out.
    - **Integrate Supabase Auth**:
        - Use `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`.
    - **Manage User Session**:
        - Use `supabase.auth.onAuthStateChange()` to listen for authentication state changes and update the UI accordingly.
        - Store user session/data in React Context or a state management library for global access.
    - **Protect Routes/Features**: Ensure only authenticated users can access/modify their todos if RLS policies are user-specific.
    - **Update `user_id`**: Ensure `user_id` is correctly passed when creating todos.

### 4. Styling with Tailwind CSS
- Maintain the dark theme.
- Adapt styling for any new UI elements related to Supabase integration (e.g., loading states, error messages, auth forms).

### 5. Error Handling
- Implement robust error handling for all Supabase client operations.
- Display user-friendly error messages or notifications (e.g., "Failed to load todos," "Could not add todo").
- Log errors to the console for debugging.

### 6. Testing in Cursor IDE
- Run `npm start` for local development.
- **Test CRUD Operations**:
    - Add new todos and verify they persist after a page refresh.
    - Toggle todo completion and verify persistence.
    - Delete todos and verify they are removed permanently.
- **Test Realtime (if implemented)**: Open multiple browser windows/tabs and check if changes in one are reflected in others without a manual refresh.
- **Test Authentication (if implemented)**:
    - Sign up new users.
    - Log in and log out.
    - Verify that users can only see and manage their own todos (RLS).
- Use Cursor IDE's terminal and debugging tools.

## 7. Deployment to Vercel
1.  **Environment Variables**:
    *   In your Vercel project settings, add the Supabase Project URL and `anon` key as environment variables (e.g., `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`).
    *   Ensure your `supabaseClient.js` (or wherever you initialize Supabase) uses these environment variables.
        ```javascript
        // src/supabaseClient.js - updated
        import { createClient } from '@supabase/supabase-js';

        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

        export const supabase = createClient(supabaseUrl, supabaseAnonKey);
        ```
2.  **Redeploy**:
    *   Push changes to GitHub. Vercel should automatically trigger a new build and deployment.
    *   If manual deployment is needed: `vercel --prod`.

3.  **Post-Deployment Testing**:
    *   Thoroughly test all functionality on the live Vercel URL.
    *   Check browser console for any errors related to Supabase connection or operations.

## Additional Notes
- **Data Migrations**: For schema changes after initial setup, use Supabase's migration tools (either via their dashboard SQL editor or CLI if you set it up). For this phase, direct MCP/SQL editor use is fine.
- **Security**: Review RLS policies carefully, especially if implementing authentication, to ensure data is secure.
- **Cursor IDE Tips**: Continue to use AI features for refactoring components, writing Supabase queries, and debugging.

## Success Criteria
- Todo items are successfully stored in and retrieved from the Supabase database.
- All CRUD (Create, Read, Update, Delete) operations for todos function correctly with Supabase.
- Application maintains its dark theme and responsiveness.
- (If implemented) Basic user authentication allows users to sign up, log in, and manage their own todos.
- The application is successfully deployed to Vercel with Supabase integration working.
- Environment variables for Supabase are securely managed in Vercel. 