import React from 'react';
import { supabase } from '../supabaseClient'; // Import supabase client

function TodoItem({ todo }) { // Removed updateTodoInState and removeTodoFromState from props

  const handleToggleComplete = async () => {
    const originalStatus = todo.is_completed;
    // Optimistic UI update can be tricky here if we don't have the full updated object immediately.
    // Realtime will handle the visual update once Supabase confirms.

    const { data, error } = await supabase
      .from('todos')
      .update({ is_completed: !originalStatus })
      .match({ id: todo.id })
      .select();

    if (error) {
      console.error('Error updating todo:', error, todo.id);
      alert(`Error updating todo: ${error.message}`); // User-facing error
      // No need to revert optimistic UI here as we are relying on realtime for the actual visual change.
    } else if (!data || data.length === 0) {
      console.warn('Todo update might have succeeded, but no data was returned by select().', todo.id);
    }
    // No explicit state update here, realtime will handle it in TodoList
  };

  const handleDelete = async () => {
    // No direct optimistic UI for deletion needed here, as realtime will remove it from the list.
    const { error } = await supabase
      .from('todos')
      .delete()
      .match({ id: todo.id });

    if (error) {
      console.error('Error deleting todo:', error, todo.id);
      alert(`Error deleting todo: ${error.message}`); // User-facing error
    }
    // No explicit state update here, realtime will handle it in TodoList
  };

  return (
    <div
      className={`flex items-center justify-between p-3 my-2 rounded transition-all duration-200 ease-in-out ${
        todo.is_completed ? 'bg-gray-700 line-through text-gray-500' : 'bg-gray-800 text-white'
      }`}
    >
      <span
        className="cursor-pointer flex-grow"
        onClick={handleToggleComplete}
      >
        {todo.task}
      </span>
      <button
        onClick={handleDelete}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs focus:outline-none focus:shadow-outline ml-2"
      >
        Delete
      </button>
    </div>
  );
}

export default TodoItem; 