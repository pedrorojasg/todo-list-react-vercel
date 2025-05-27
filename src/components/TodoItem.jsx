import React from 'react';

function TodoItem({ todo, index, toggleTodo, deleteTodo }) {
  return (
    <div
      className={`flex items-center justify-between p-3 my-2 rounded transition-all duration-200 ease-in-out ${
        todo.completed ? 'bg-gray-700 line-through text-gray-500' : 'bg-gray-800 text-white'
      }`}
    >
      <span
        className="cursor-pointer flex-grow"
        onClick={() => toggleTodo(index)}
      >
        {todo.text}
      </span>
      <button
        onClick={() => deleteTodo(index)}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs focus:outline-none focus:shadow-outline ml-2"
      >
        Delete
      </button>
    </div>
  );
}

export default TodoItem; 