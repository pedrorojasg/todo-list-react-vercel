import './App.css';
import TodoList from './components/TodoList';

function App() {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col items-center pt-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-400">Todo List</h1>
      </header>
      <main className="w-full max-w-lg px-4">
        <TodoList />
      </main>
    </div>
  );
}

export default App;
