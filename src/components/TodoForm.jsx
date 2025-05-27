import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import supabase client

function TodoForm() {
  const [value, setValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value) return;

    // Optimistic UI: Clear input immediately
    const taskText = value;
    setValue('');

    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: taskText }]) // use taskText
      .select();

    if (error) {
      console.error('Error adding todo:', error);
      alert(`Error adding todo: ${error.message}`); // User-facing error
      setValue(taskText); // Restore input value if error occurs
    } else if (data) {
      // setValue(''); // Already cleared optimistically
      // Realtime will handle adding to list
      console.log('Todo added via form, realtime will update list', data);
    } else {
      console.warn('Todo insert might have succeeded, but no data was returned by select().');
      // setValue(''); // Already cleared
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex">
      <input
        type="text"
        className="bg-gray-800 text-white border border-gray-700 rounded-l w-full py-2 px-3 mr-0 focus:outline-none focus:border-indigo-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a new todo"
      />
      <button
        type="submit"
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
      >
        Add Todo
      </button>
    </form>
  );
}

export default TodoForm;