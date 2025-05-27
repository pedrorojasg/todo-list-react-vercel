import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { supabase } from '../supabaseClient'; // Import supabase client

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [subscriptionError, setSubscriptionError] = useState(null); // For displaying subscription errors

  // Add a todo to the local state
  const addTodoToState = (newTodo) => {
    console.log('addTodoToState called with:', newTodo);
    if (newTodo && newTodo.id) { // Ensure newTodo is valid and has an id
      setTodos((prevTodos) => {
        // Prevent adding duplicate if already exists (e.g., from a rapid fire event)
        if (prevTodos.find(todo => todo.id === newTodo.id)) {
          console.warn('Attempted to add duplicate todo ID:', newTodo.id);
          return prevTodos;
        }
        return [...prevTodos, newTodo];
      });
    } else {
      console.error('addTodoToState called with invalid newTodo:', newTodo);
    }
  };

  // Update a todo in the local state
  const updateTodoInState = (updatedTodo) => {
    console.log('updateTodoInState called with:', updatedTodo);
    if (updatedTodo && updatedTodo.id) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    } else {
      console.error('updateTodoInState called with invalid updatedTodo:', updatedTodo);
    }
  };

  // Remove a todo from the local state
  const removeTodoFromState = (id) => {
    console.log('removeTodoFromState called with id:', id);
    if (id) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } else {
      console.error('removeTodoFromState called with invalid id:', id);
    }
  };

  useEffect(() => {
    console.log('TodoList useEffect: Setting up initial fetch and realtime subscription.');
    setLoading(true);
    setSubscriptionError(null);

    async function getInitialTodos() {
      console.log('Fetching initial todos...');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching todos:', error);
        alert('Error fetching todos. Please try refreshing the page.');
        setLoading(false);
      } else {
        console.log('Initial todos fetched:', data);
        setTodos(data || []);
        setLoading(false);
      }
    }
    getInitialTodos();

    const channel = supabase
      .channel('todos-realtime-channel') // Unique channel name
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Supabase REALTIME: INSERT event received', payload);
          if (payload.new) {
            addTodoToState(payload.new);
          } else {
            console.error('REALTIME INSERT: payload.new is missing', payload);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Supabase REALTIME: UPDATE event received', payload);
          if (payload.new) {
            updateTodoInState(payload.new);
          } else {
            console.error('REALTIME UPDATE: payload.new is missing', payload);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Supabase REALTIME: DELETE event received', payload);
          if (payload.old && payload.old.id) {
            removeTodoFromState(payload.old.id);
          } else {
            console.error('REALTIME DELETE: payload.old or payload.old.id is missing', payload);
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`Supabase REALTIME: Subscription status: ${status}`)
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to todos table changes!');
          setSubscriptionError(null);
        }
        if (status === 'TIMED_OUT'){
          console.warn('Supabase REALTIME: Subscription timed out.');
          setSubscriptionError('Realtime connection timed out. Updates may be delayed.');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Supabase REALTIME: Channel error.', err);
          setSubscriptionError('Realtime connection error. Please refresh.');
          alert('Connection issue: Realtime updates might be delayed or not working. Please refresh.');
        }
        if (err) {
            console.error('Supabase REALTIME: Subscription error object:', err);
        }
      });

    return () => {
      console.log('TodoList useEffect cleanup: Removing Supabase channel.');
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="text-center text-white mt-10">Loading todos...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <TodoForm />
      {subscriptionError && (
        <div className="bg-red-700 text-white p-2 my-2 rounded text-sm">
          {subscriptionError}
        </div>
      )}
      <div className="flex flex-col">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
          />
        ))}
      </div>
    </div>
  );
}

export default TodoList; 